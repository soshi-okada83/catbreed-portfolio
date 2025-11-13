# 🐾 猫種推定アプリ (Cat Breed Classifier & Describer)

AIモデルを使って猫の画像から猫種を推定し、GPTを用いてその猫種の説明を自動生成するWebアプリです。  
フロントエンド・バックエンド・AIモデルの全てを自作し、機械学習とWeb開発のスキルを統合したポートフォリオプロジェクトです。

---

## 🚀 プロジェクト概要

| 項目 | 内容 |
|------|------|
| **目的** | 猫画像から猫種を分類し、推定結果に応じた猫種の説明を自動生成する |
| **構成** | Next.js (フロントエンド) + FastAPI (バックエンド) + PyTorch (AIモデル) + OpenAI API |
| **期間** | 6週間（Week1〜Week6）で段階的に開発 |
| **開発者** | 岡田 蒼史（大学3年 / 機械学習 × Webフルスタック志向） |

---

## 🧩 構成図

catbreed-portfolio/
├── backend/ # FastAPI + PyTorch モデルサーバー
│ ├── app/
│ │ ├── routes/ # /predict, /describe などのAPI
│ │ ├── models/ # EfficientNetベースの学習済みモデル
│ │ ├── utils/ # 前処理・後処理
│ │ └── main.py # FastAPIエントリポイント
│ ├── data/ # データセット構造
│ ├── notebooks/ # モデル学習ノートブック
│ └── .env # OpenAIキーなど（Git管理外）
│
├── frontend/ # Next.js (App Router構成)
│ ├── app/
│ │ ├── components/ # Upload, BreedDescriptionCard などのUI
│ │ ├── lib/ # fetchDescription.ts（API呼び出し）
│ │ └── types/ # 型定義（BreedDescriptionなど）
│ └── .env.local # API接続先URL設定
│
├── docs/ # 各週のまとめ
│
└── README.md

---

## 🧠 Week別進捗概要

| Week | 内容 |
|------|------|
| **Week1** | 環境構築・設計（FastAPI + Next.js + データ構成設計） |
| **Week2** | データセット準備（Oxford-IIIT Pet Dataset） |
| **Week3** | PyTorchによる猫種分類モデルの学習 |
| **Week4** | UI接続（画像アップロード → 推論API接続） |
| **Week5** | GPTを用いた猫種説明生成機能の実装＋UI統合 |
| **Week6** | UIデザイン調整・レイアウト改善 |

---

## 🐱 推論の流れ

1. 画像をアップロード  
2. FastAPI (`/predict`) に送信  
3. PyTorchモデルが猫種を分類  
4. その結果（例: “Ragdoll”）を `/describe` に渡す  
5. GPTがその猫種の説明を日本語で生成  
6. Next.js 側で推定結果＋説明を表示  

---

## 🧪 APIエンドポイント

### 🧩 `/predict` - 猫種分類
```bash
POST /predict
FormData: { image: File }
Response:
{
  "top1": { "breed": "Ragdoll", "score": 0.998 },
  "top3": [
    { "breed": "Ragdoll", "score": 0.998 },
    { "breed": "Persian", "score": 0.001 },
    { "breed": "Birman", "score": 0.001 }
  ]
}
```
```bash
POST /describe
Body: { "breed": "Ragdoll", "lang": "ja" }
Response:
{
  "data": {
    "breed": "ラグドール",
    "overview": "ラグドールはその穏やかな性格で知られる...",
    "key_facts": { "origin": "アメリカ", "coat": "長毛", ... },
    "temperament": ["穏やか", "愛情深い", "遊び好き"],
    "care": { "grooming": "定期的なブラッシングが必要です" },
    "fun_fact": "抱っこされるのが好きで、ぬいぐるみのようにリラックスします。"
  }
}
```

使用技術
| **フロントエンド** | Next.js / TypeScript / Tailwind CSS / shadcn/ui            |
| **バックエンド**   | FastAPI / Python 3.10 / OpenAI API / Uvicorn               |
| **AIモデル**      | PyTorch / EfficientNet-B0 / torchvision / numpy / Pillow   |
| **環境管理**      | venv / .env / Git / GitHub                                 |
| **その他**        | Swagger UI / ESLint / Prettier                             |

🧭 実行方法
✅ バックエンド (FastAPI)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

→ http://127.0.0.1:8000/docs
 でAPI確認可能

✅ フロントエンド (Next.js)
```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:3000
 でUIが開く
