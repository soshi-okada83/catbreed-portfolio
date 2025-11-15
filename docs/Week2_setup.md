# 🗓 Week 2：データセット準備 & 学習環境構築

## 🎯 目的
猫種分類モデルの学習に向けて、データセットの準備と前処理を行う。
Oxford-IIIT Pet Datasetを使用し、猫12種を対象にEDA・データ分割・転移学習モデルの雛形を作成する。

---

## ✅ 成果物
項目	内容
データセット	Oxford-IIIT Pet Dataset（猫12種）
前処理	tar.gz解凍、train/val/test 分割、自動整形
可視化	Matplotlibでランダムサンプル表示
学習環境	backend/.venv 仮想環境構築＋Jupyter設定
モデル雛形	EfficientNet-B0（出力12クラス）を転移学習用に準備

---

## 📂 ディレクトリ構成
```bash
catbreed-portfolio/
├── backend/
│   ├── app/
│   │   └── main.py
│   │
│   ├── data/
│   │   └── oxford-iiit-pet/
│   │       ├── raw/
│   │       │   ├── images.tar.gz
│   │       │   └── annotations.tar.gz
│   │       └── processed_cats/
│   │           ├── train/
│   │           ├── val/
│   │           └── test/
│   │
│   ├── notebooks/
│   │   └── Week2_01_dataset_preparation_backend_layout.ipynb
│   │
│   └── .venv/
│
├── frontend/
│   └── （Week1と同様）
│
└── docs/
    ├── Week1_setup.md
    └── Week2_setup.md
```

---

## ⚙️ 使用技術

- **データセット:** Oxford-IIIT Pet Dataset（12猫種）
- **前処理:** pandas, numpy, matplotlib, shutil, tarfile
- **学習環境:** PyTorch, torchvision, tqdm, scikit-learn
- **モデル:** EfficientNet-B0（torchvision.models.efficientnet_b0）
- **Notebook:** Jupyter + VSCode（仮想環境 .venv をカーネル登録）

---

## 🧱 実装ステップ
1. データ取得

公式からアーカイブをダウンロード
Oxford-IIIT Pet Dataset

配置先：
```bash
backend/data/oxford-iiit-pet/raw/
  ├── images.tar.gz
  └── annotations.tar.gz
```

2. Notebook準備
```bash
backend/notebooks/Week2_01_dataset_preparation_backend_layout.ipynb
```
目的：
アーカイブ解凍
クラス一覧抽出
train/val/test データ分割
サンプル可視化
雛形作成

3. 仮想環境構築
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install torch torchvision torchaudio
pip install jupyter matplotlib pandas scikit-learn tqdm
python -m ipykernel install --user --name backend_venv --display-name "Python (backend .venv)"
```

VSCode の Notebook カーネル選択：
```bash
Python (backend .venv)
```

4. データ解凍とEDA
Notebook セルを実行して以下を確認：
・images.tar.gz と annotations.tar.gz の展開成功
・猫種クラス12種を検出
・Matplotlibでランダム12枚を可視化

出力例：
```bash
Displayed 12 images.
(['Abyssinian', 'Bengal', 'Birman', ..., 'Sphynx'], 12)
```

5. データ分割（train/val/test）
Notebook内で自動実行：
```bash
processed_cats/
├── train/
├── val/
└── test/
```
それぞれに12猫種のフォルダが生成される。

6. モデル雛形
```bash
from torchvision import models
model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 12)
```

出力：
```bash
Loaded EfficientNet-B0 with 12 output classes
(device='cpu', num_classes=12, parameters=4,022,920)
```

🧩 Week2の成果まとめ
項目	状態
Oxford-IIIT Pet Dataset 取得	✅ 完了
データ解凍・整形	✅ 完了
train/val/test 分割	✅ 成功
可視化（EDA）	✅ 確認済み
EfficientNet-B0 モデル雛形	✅ 構築済み
仮想環境 + カーネル設定	✅ 完了