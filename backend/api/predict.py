from fastapi import APIRouter, File, UploadFile, HTTPException  # type: ignore[import]
from PIL import Image  # type: ignore[import]
import io, glob, traceback, logging
from pathlib import Path
import torch  # type: ignore[import]
import torchvision.transforms as transforms  # type: ignore[import]
import torchvision.models as models  # type: ignore[import]

logging.basicConfig(level=logging.INFO)

router = APIRouter()

def find_latest_best_pt() -> Path:
    """
    学習成果物(artifacts/**/best.pt)の中で、最も新しいチェックポイントを返す
    """
    project_root = Path(__file__).resolve().parents[2]
    pattern = str(project_root / "backend/notebooks/artifacts/**/best.pt")
    candidates = [Path(p) for p in glob.glob(pattern, recursive=True)]
    if not candidates:
        raise FileNotFoundError("best.pt が見つかりませんでした。artifacts配下を確認してください。")
    return max(candidates, key=lambda p: p.stat().st_mtime)

# ------- 推論用のグローバル -------
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model = None
_transform = None
_num_classes = None

# 学習時のラベル
CLASSES = [
    "Abyssinian", "Bengal", "Birman", "Bombay", "British_Shorthair",
    "Egyptian_Mau", "Maine_Coon", "Persian", "Ragdoll",
    "Russian_Blue", "Siamese", "Sphynx"
]

def build_model(num_classes: int):
    """
    ResNet50（bottleneck系, 最終特徴2048）で復元
    """
    m = models.resnet50(weights=None)
    in_features = m.fc.in_features  # = 2048
    m.fc = torch.nn.Linear(in_features, num_classes)
    return m

def extract_state_dict(obj):
    """
    チェックポイント(dict)から state_dict を取り出す。
    """
    if isinstance(obj, dict):
        for k in ["model_state_dict", "state_dict", "model"]:
            if k in obj and isinstance(obj[k], dict):
                return obj[k]
    return None

def load_model_once():
    global _model, _transform, _num_classes
    if _model is not None:
        return

    best_path = find_latest_best_pt()
    logging.info(f"Loading checkpoint from: {best_path}")
    ckpt = torch.load(best_path, map_location=_device)

    if hasattr(ckpt, "eval"):
        # torch.save(model) で保存されていた場合
        _model = ckpt
        logging.info("Loaded full model object.")
    else:
        state = extract_state_dict(ckpt)
        if state is None:
            raise RuntimeError("best.pt は dict ですが state_dict が見つかりませんでした。保存方法を確認してください。")
        _num_classes = len(CLASSES)
        model = build_model(_num_classes)
        missing, unexpected = model.load_state_dict(state, strict=False)
        logging.info(f"Loaded state_dict. missing_keys={missing}, unexpected_keys={unexpected}")
        _model = model

    _model.to(_device).eval()

    _transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    # 出力形状チェック
    with torch.no_grad():
        dummy = torch.zeros(1, 3, 224, 224, device=_device)
        out = _model(dummy)
        if out.ndim != 2:
            raise RuntimeError(f"Unexpected model output shape: {tuple(out.shape)}")
        if _num_classes is None:
            _num_classes = int(out.shape[1])
    logging.info(f"Model ready on {_device}, num_classes={_num_classes}")

@router.get("/health")
def health():
    try:
        load_model_once()
        return {"status": "ok", "device": str(_device), "num_classes": _num_classes, "labels": len(CLASSES)}
    except Exception as e:
        return {"status": "error", "detail": repr(e)}

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        load_model_once()
        assert _model is not None and _transform is not None and _num_classes is not None

        if len(CLASSES) != _num_classes:
            raise RuntimeError(f"Class count mismatch: model={_num_classes}, labels={len(CLASSES)}")

        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = _transform(image).unsqueeze(0).to(_device)

        with torch.no_grad():
            outputs = _model(img_tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            k = min(3, probs.shape[0])
            topk = torch.topk(probs, k=k)
            idxs = topk.indices.tolist()
            vals = topk.values.tolist()

        top3 = [
            {"class_name": CLASSES[i], "confidence": round(float(v), 4)}
            for i, v in zip(idxs, vals)
        ]
        return {
            "top1": top3[0],
            "top3": top3
        }
    except Exception as e:
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction failed: {repr(e)}")
