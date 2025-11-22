# Screen Share Viewer - ドキュメント

Screen Share Viewerは、ブラウザベースの画面共有ビューアーアプリケーションです。画面共有した映像を様々なアスペクト比やサイズでプレビューできます。

## 📚 ドキュメント一覧

- [機能概要](./features.md) - アプリケーションの主要機能
- [アーキテクチャ](./architecture.md) - コードベースの構造と設計
- [API リファレンス](./api-reference.md) - コンポーネントとフックの詳細
- [トラブルシューティング](./troubleshooting.md) - よくある問題と解決方法
- [開発ガイド](./development.md) - 開発環境のセットアップと開発フロー

## クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:5173/ を開く
```

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite 5
- **Web API**: Screen Capture API (getDisplayMedia)
- **スタイリング**: CSS-in-JS (インラインスタイル)

## プロジェクト構成

```
screen-share-viewer/
├── src/
│   ├── components/         # Reactコンポーネント
│   ├── contexts/          # Reactコンテキスト
│   ├── hooks/             # カスタムフック
│   ├── styles/            # グローバルスタイル
│   ├── types/             # TypeScript型定義
│   ├── lib/               # ユーティリティ関数
│   ├── App.tsx            # ルートコンポーネント
│   └── main.tsx           # エントリーポイント
├── docs/                  # ドキュメント
└── dist/                  # ビルド成果物
```

## ライセンス

このプロジェクトはプライベートプロジェクトです。
