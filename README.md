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

---

## 🧩 構成図

```bash
catbreed-portfolio/
├── backend/ # FastAPI + PyTorch モデルサーバー
│ ├── .venv/ # Git管理外
│ ├── api/
│ │ └── predict.py
│ ├── app/
│ │ ├── routes/describe.py
│ │ └── main.py # FastAPIエントリポイント
│ ├── data/ # データセット構造
│ ├── notebooks/ # モデル学習ノートブック
│ └── .env # OpenAIキーなど（Git管理外）
│
├── frontend/ # Next.js (App Router構成)
│ ├── app/
│ │ ├── components/ # Upload, BreedDescriptionCard などのUI
│ │ │ └── ui/ # badge.tsx,　card.tsx
│ │ ├── lib/ # fetchDescription.ts（API呼び出し）
│ │ └── types/ # 型定義（BreedDescriptionなど）
│ └── .env.local # API接続先URL設定
│
├── .gitignore
│
├── docs/ # 各週のまとめ
│
└── README.md
```
---

## 🧠 Week別進捗概要

| Week | 内容 |
|------|------|
| **Week1** | 環境構築・設計（FastAPI + Next.js + データ構成設計） |
| **Week2** | データセット準備（Oxford-IIIT Pet Dataset） |
| **Week3** | PyTorchによる猫種分類モデルの学習 |
| **Week4** | UI接続（画像アップロード → 推論API接続） |
| **Week5** | GPTを用いた猫種説明生成機能の実装 |
| **Week6** | UIデザイン調整・レイアウト改善 |

---

## 🐱 推論の流れ

1. 画像をアップロード  
2. FastAPI (`/predict`) に送信  
3. PyTorchモデルが猫種を分類  
4. その結果を `/describe` に渡す  
5. GPTがその猫種の説明を日本語で生成  
6. Next.js 側で推定結果＋説明を表示  

---

## 💻 使用技術

| 分類 | 技術 |
|------|------|
| **フロントエンド** | Next.js / TypeScript / Tailwind CSS / shadcn/ui |
| **バックエンド** | FastAPI / Python 3.10 / OpenAI API / Uvicorn |
| **AIモデル** | PyTorch / torchvision / numpy / Pillow |
| **環境管理** | venv / .env / Git / GitHub |
| **その他** | Swagger UI / ESLint / Prettier / GitHub Push Protection 対応 |
