# WagayaDiscord v2

Discord風のチャットアプリケーションを **ASP.NET Core** と **React** で構築しました。
リアルタイムボイスチャット機能とAIノイズキャンセルを搭載しています。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-development-orange)

## 🚀 技術スタック

### バックエンド
ASP.NET Core 10 / Entity Framework Core / SignalR / RNNoise / Cookie認証

### フロントエンド
React 19 / TypeScript / Vite / Tailwind CSS v3 / Zustand / Web Audio API

### インフラ
Docker & Docker Compose / SQLite

## 🛠️ セットアップ

### 必要なもの
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/yourusername/WagayaDiscord.git
   cd WagayaDiscord
   ```

2. **環境変数の設定**
   サンプル設定ファイルをコピーします。
   ```bash
   cp .env.example .env
   ```
   ※ `.env.example` のデフォルト値は開発用です。

3. **Docker Composeで起動**
   全サービスをビルド・起動します。
   ```bash
   docker-compose up --build
   ```

4. **アクセス**
   ブラウザで以下にアクセスしてください：
   [http://localhost:6120](http://localhost:6120)

## 📂 プロジェクト構成

```
WagayaDiscord/
├── src/
│   ├── WagayaDiscord.Server/   # ASP.NET Core バックエンド
│   │   ├── Controllers/        # APIコントローラー
│   │   ├── Entities/           # データベースエンティティ
│   │   ├── Hubs/               # SignalRハブ (Chat, Voice)
│   │   ├── Models/             # DTO
│   │   └── Services/           # ビジネスロジック
│   └── wagaya-client/          # React フロントエンド
│       ├── src/
│       │   ├── components/     # UIコンポーネント
│       │   ├── hooks/          # カスタムフック
│       │   ├── pages/          # ページコンポーネント
│       │   ├── services/       # APIクライアント
│       │   └── stores/         # Zustandストア
├── docker-compose.yml          # コンテナオーケストレーション
├── Dockerfile                  # 統合ビルド設定
└── .env.example                # 環境変数テンプレート
```

## ✨ 機能

- � **テキストチャット**: リアルタイムメッセージング
- 🎙️ **ボイスチャット**: WebRTC風の音声通話
- 🤖 **AIノイズキャンセル**: RNNoiseによる高品質な音声
- 👤 **ユーザー認証**: Cookie認証によるセキュアなログイン
- 📱 **レスポンシブUI**: モダンなDiscord風デザイン

## 📄 ライセンス
このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) をご覧ください。
