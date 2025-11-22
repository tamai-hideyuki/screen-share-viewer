# 開発ガイド

Screen Share Viewerの開発環境のセットアップと開発フローについて説明します。

## 開発環境のセットアップ

### 必要な環境

- **Node.js**: 18.x 以降
- **npm**: 9.x 以降
- **対応OS**: macOS, Windows, Linux

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd screen-share-viewer

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173/ を開く
```

開発サーバーは以下の機能を提供します:
- ホットリロード（ファイル変更時に自動的にリロード）
- TypeScriptのトランスパイル
- React Fast Refresh

---

## プロジェクト構成

```
screen-share-viewer/
├── src/                    # ソースコード
│   ├── components/         # Reactコンポーネント
│   │   ├── ControlPanel.tsx
│   │   ├── IphoneMirrorSurface.tsx
│   │   └── IphoneBackgroundLayer.tsx
│   ├── contexts/          # Reactコンテキスト
│   │   └── ScreenCaptureContext.tsx
│   ├── hooks/             # カスタムフック
│   │   ├── useScreenCapture.ts
│   │   └── useSecondPointer.ts
│   ├── styles/            # グローバルスタイル
│   │   └── global.css
│   ├── types/             # TypeScript型定義
│   ├── lib/               # ユーティリティ関数
│   ├── App.tsx            # ルートコンポーネント
│   └── main.tsx           # エントリーポイント
├── docs/                  # ドキュメント
├── public/                # 静的ファイル
├── dist/                  # ビルド成果物
├── package.json           # 依存関係とスクリプト
├── tsconfig.json          # TypeScript設定
├── vite.config.ts         # Vite設定
└── index.html             # HTMLエントリーポイント
```

---

## 開発フロー

### 1. 新しいコンポーネントの追加

```tsx
// src/components/MyComponent.tsx
import React from "react";

export default function MyComponent() {
  return (
    <div>
      {/* コンポーネントの内容 */}
    </div>
  );
}
```

### 2. 新しいフックの追加

```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from "react";

export function useMyHook() {
  const [state, setState] = useState(initialValue);

  const doSomething = useCallback(() => {
    // ロジック
  }, [dependencies]);

  return { state, doSomething };
}
```

### 3. Contextの追加

```tsx
// src/contexts/MyContext.tsx
import { createContext, useContext, ReactNode } from "react";
import { useMyHook } from "../hooks/useMyHook";

interface MyContextType {
  // 型定義
}

const MyContext = createContext<MyContextType | null>(null);

export function MyProvider({ children }: { children: ReactNode }) {
  const value = useMyHook();

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
}
```

---

## コーディング規約

### TypeScript

- **strictモード**: 有効化（`tsconfig.json`で設定済み）
- **型注釈**: 明示的に型を指定（推論できる場合は省略可）
- **インターフェース**: コンポーネントのPropsやデータ構造に使用

### React

- **関数コンポーネント**: クラスコンポーネントは使用しない
- **Hooks**: 状態管理は Hooks を使用
- **Props**: 分割代入で受け取る
- **export**: default export を使用（コンポーネント）

### スタイリング

- **インラインスタイル**: 動的なスタイルに使用
- **CSS-in-JS**: `style` プロパティで指定
- **グローバルCSS**: 最小限に留める（リセット、最適化のみ）

### ファイル命名

- **コンポーネント**: PascalCase（例: `MyComponent.tsx`）
- **フック**: camelCase with "use" prefix（例: `useMyHook.ts`）
- **ユーティリティ**: camelCase（例: `formatDate.ts`）

---

## ビルド

### 開発ビルド

```bash
npm run dev
```

### プロダクションビルド

```bash
npm run build
```

成果物は `dist/` ディレクトリに出力されます。

### ビルドのプレビュー

```bash
npm run preview
```

プロダクションビルドをローカルでプレビューできます。

---

## デバッグ

### コンソールログ

アプリケーションは詳細なログを出力します:

```javascript
console.log("[ScreenCapture] Requesting display media...");
console.log("[ScreenCapture] Resolution: 1920x1080 @ 60fps");
console.warn("[ScreenCapture] ⚠️ Low resolution detected");
console.error("[ScreenCapture] ❌ Error:", error);
```

### ブラウザ開発者ツール

- **Chrome DevTools**: `Cmd + Option + I` (macOS) / `Ctrl + Shift + I` (Windows)
- **React DevTools**: Chrome拡張機能をインストール

### TypeScriptエラー

開発サーバー起動中は、TypeScriptエラーがコンソールに表示されます。

---

## テスト

現在、テストは未実装です。将来的に以下のテストフレームワークの導入を検討:

- **Vitest**: ユニットテスト
- **React Testing Library**: コンポーネントテスト
- **Playwright**: E2Eテスト

---

## パフォーマンス最適化

### React.memo

不要な再レンダリングを防ぐため、必要に応じて使用:

```tsx
export default React.memo(MyComponent);
```

### useCallback

関数をメモ化:

```tsx
const handleClick = useCallback(() => {
  // 処理
}, [dependencies]);
```

### useMemo

計算結果をメモ化:

```tsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### CSS最適化

GPUアクセラレーションを活用:

```css
video {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

---

## デプロイ

### Vercel

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel
```

### Netlify

```bash
# Netlify CLIをインストール
npm i -g netlify-cli

# デプロイ
netlify deploy --prod
```

### GitHub Pages

```bash
# gh-pagesをインストール
npm install --save-dev gh-pages

# package.jsonにスクリプトを追加
"deploy": "npm run build && gh-pages -d dist"

# デプロイ
npm run deploy
```

**注意**: GitHub Pagesはデフォルトで HTTPS を提供します。

---

## トラブルシューティング（開発環境）

### ポートが使用中

```bash
# 別のポートで起動
npm run dev -- --port 3000
```

### node_modules の問題

```bash
# キャッシュをクリアして再インストール
rm -rf node_modules package-lock.json
npm install
```

### TypeScriptエラー

```bash
# TypeScriptの型チェック
npx tsc --noEmit
```

---

## コントリビューション

### ブランチ戦略

- `main`: プロダクション用ブランチ
- `develop`: 開発用ブランチ
- `feature/*`: 機能追加用ブランチ
- `fix/*`: バグ修正用ブランチ

### コミットメッセージ

```
<type>: <subject>

<body>

<footer>
```

**type**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: その他

**例**:
```
feat: Add second pointer support

Implement useSecondPointer hook to manage multiple pointer devices.
Support for primary (cyan) and secondary (magenta) pointers.

Closes #123
```

---

## よくある開発タスク

### 新しいアスペクト比の追加

1. `IphoneMirrorSurface.tsx` の `select` 要素に `option` を追加
2. 値は `"width:height"` 形式（例: `"21:9"`）

### エラーメッセージのカスタマイズ

`useScreenCapture.ts` の `catch` ブロックでエラーハンドリングをカスタマイズ

### ログの追加

一貫性のために `[ComponentName]` プレフィックスを使用:

```typescript
console.log("[MyComponent] Something happened");
```

---

## リソース

### 公式ドキュメント

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [MDN - Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API)

### 開発ツール

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Can I Use](https://caniuse.com/) - ブラウザ互換性チェック
