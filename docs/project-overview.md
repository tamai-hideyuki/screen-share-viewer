# iPhone Dual Cursor プロジェクト - 調査報告書

## 概要

**iPhone Dual Cursor** は、WebHID APIを活用した複数マウス入力デモアプリケーションです。2つの独立したマウスからの入力を同時に受け取り、ブラウザ上のiPhone画面エミュレータに2つのカーソルを同時に表示・制御する実験的なプロジェクトです。

## プロジェクト構造

```
iphone-dual-cursor/
├── 設定・実行ファイル
│   ├── package.json              (プロジェクト定義・依存関係)
│   ├── tsconfig.json             (TypeScript設定)
│   ├── vite.config.ts            (Vite ビルド設定)
│   ├── index.html                (メインHTMLエントリーポイント)
│   └── README.md                 (プロジェクトドキュメント)
│
├── public/                       (静的アセット)
│   ├── iphone-frame.svg          (iPhone枠画像)
│   ├── iphone-mirror-sample.png  (ダミー画面画像・開発用)
│   └── icons/
│       └── app-icon.png          (アプリアイコン)
│
└── src/                          (ソースコード)
    ├── main.tsx                  (アプリケーション起動エントリー)
    ├── App.tsx                   (ルートコンポーネント)
    │
    ├── components/               (Reactコンポーネント)
    │   ├── IphoneMirrorSurface.tsx      (iPhone画面コンテナ・全体フレーム)
    │   ├── IphoneBackgroundLayer.tsx    (背景画像・ミラー映像表示層)
    │   ├── SecondaryCursorCanvas.tsx    (第2カーソル描画用Canvas)
    │   ├── ControlPanel.tsx             (デバイス接続操作UI)
    │   ├── PrimaryCursorHint.tsx        (OSカーソルヒント - 未実装)
    │   └── GestureDebugPanel.tsx        (ジェスチャーログパネル - 未実装)
    │
    ├── hooks/                    (Reactカスタムフック)
    │   ├── useSecondPointer.ts       (WebHID接続管理)
    │   ├── useIphoneCoordinateSystem.ts (座標変換)
    │   ├── useGestures.ts            (ジェスチャー検出 - 未実装)
    │   └── useAnimationFrame.ts      (フレームアニメーション管理 - 未実装)
    │
    ├── lib/                      (ビジネスロジック・ユーティリティ)
    │   ├── hid/                      (WebHID処理)
    │   │   ├── secondDeviceClient.ts (デバイス接続・入力処理)
    │   │   └── parsers/
    │   │       └── mouseDeltaParser.ts (HID入力解析)
    │   │
    │   ├── cursor/                   (カーソル処理)
    │   │   ├── cursorState.ts        (カーソル状態管理)
    │   │   └── cursorRenderer.ts     (Canvas描画処理)
    │   │
    │   ├── gestures/                 (ジェスチャー検出 - 未実装)
    │   │   ├── tapDetector.ts        (タップ判定)
    │   │   ├── swipeDetector.ts      (スワイプ判定)
    │   │   └── longPressDetector.ts  (長押し判定)
    │   │
    │   └── layout/                   (画面レイアウト定義)
    │       └── iphoneLayout.ts       (画面サイズ・レイアウト - 未実装)
    │
    ├── styles/                   (CSS スタイル)
    │   ├── global.css            (グローバルスタイル - 未実装)
    │   └── iphone.css            (iPhoneフレームスタイル - 未実装)
    │
    └── types/                    (TypeScript型定義)
        ├── hid.d.ts              (WebHID型補完 - 未実装)
        └── gestures.d.ts         (ジェスチャー型定義 - 未実装)
```

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | React | 18.3.0 |
| 言語 | TypeScript | 5.3.0 |
| ビルドツール | Vite | 5.0.0 |
| API | WebHID API | ネイティブブラウザAPI |
| 標準技術 | Canvas 2D | HTML5 Canvas |
| | requestAnimationFrame | HTML5 Animation API |
| | ES Modules | ECMAScript 2020+ |

## 主要実装済み機能

### 1. WebHIDによる複数デバイス接続

[secondDeviceClient.ts](../src/lib/hid/secondDeviceClient.ts) で実装されています。

- `navigator.hid.requestDevice()` でマウスデバイスを検出
- マウスの相対移動量（dx, dy）をリアルタイム取得
- HIDレポート解析・カーソル位置更新
- 画面枠内へのクリッピング処理（0-400, 0-800）

```typescript
export async function connectSecondDevice() {
  const devices = await navigator.hid.requestDevice({
    filters: [{ usagePage: 1, usage: 2 }], // マウス用途
  });

  const device = devices[0];
  await device.open();

  device.oninputreport = (event) => {
    const { dx, dy } = parseMouseDelta(event.data);
    cursorState.x += dx;
    cursorState.y += dy;
    // 画面枠内にクリップ
    cursorState.x = Math.max(0, Math.min(400, cursorState.x));
    cursorState.y = Math.max(0, Math.min(800, cursorState.y));
  };
}
```

### 2. iPhone画面エミュレータ

[IphoneMirrorSurface.tsx](../src/components/IphoneMirrorSurface.tsx) で実装されています。

- 400x800px のiPhone形状コンテナ
- 丸みのあるボーダー（40px）でiPhoneデザインを表現
- 背景画像（ダミー画像）表示機能
- レイヤー構造（背景層とカーソル描画層）

### 3. カーソル描画・アニメーション

[SecondaryCursorCanvas.tsx](../src/components/SecondaryCursorCanvas.tsx) と [cursorRenderer.ts](../src/lib/cursor/cursorRenderer.ts) で実装されています。

- Canvas要素への実時間カーソル描画
- `requestAnimationFrame` による60fpsアニメーション
- カーソル状態管理（位置、色、サイズ）

```typescript
export function renderCursor(
  ctx: CanvasRenderingContext2D,
  state: typeof cursorState
) {
  ctx.beginPath();
  ctx.arc(state.x, state.y, state.radius, 0, Math.PI * 2);
  ctx.fillStyle = state.color; // デフォルト: cyan
  ctx.fill();
}
```

### 4. UIインタラクション

[ControlPanel.tsx](../src/components/ControlPanel.tsx) で実装されています。

- デバイス接続ボタン
- ボタンクリックでWebHIDデバイス選択ダイアログを表示
- `useSecondPointer` フックによる接続処理

## 主要コンポーネント詳細

### コンポーネント階層

```
App
├── IphoneMirrorSurface
│   ├── IphoneBackgroundLayer (背景画像)
│   └── SecondaryCursorCanvas (カーソル描画)
└── ControlPanel (接続ボタン)
```

### データフロー

```
マウス入力 (HID Report)
    ↓
parseMouseDelta (dx, dy抽出)
    ↓
cursorState 更新 (グローバル状態)
    ↓
renderCursor (Canvas描画)
    ↓
requestAnimationFrame (アニメーションループ)
```

## 実装状況サマリー

| ファイル | 行数 | 状態 | 説明 |
|---------|------|------|------|
| **メイン/コンポーネント** |
| main.tsx | 6 | ✓ 完成 | アプリケーション起動 |
| App.tsx | 21 | ✓ 完成 | ルートコンポーネント |
| IphoneMirrorSurface.tsx | 21 | ✓ 完成 | iPhone枠コンテナ |
| IphoneBackgroundLayer.tsx | 16 | ✓ 完成 | 背景画像表示 |
| SecondaryCursorCanvas.tsx | 32 | ✓ 完成 | カーソル描画層 |
| ControlPanel.tsx | 24 | ✓ 完成 | 接続ボタンUI |
| PrimaryCursorHint.tsx | 0 | ✗ 未実装 | OSカーソルヒント |
| GestureDebugPanel.tsx | 0 | ✗ 未実装 | デバッグパネル |
| **フック** |
| useSecondPointer.ts | 14 | ✓ 完成 | HID接続管理 |
| useIphoneCoordinateSystem.ts | 7 | △ 部分実装 | 座標変換（基本のみ） |
| useGestures.ts | 0 | ✗ 未実装 | ジェスチャー検出 |
| useAnimationFrame.ts | 0 | ✗ 未実装 | フレーム管理 |
| **ビジネスロジック** |
| secondDeviceClient.ts | 33 | ✓ 完成 | WebHID接続処理 |
| mouseDeltaParser.ts | 10 | ✓ 完成 | HID解析 |
| cursorState.ts | 6 | ✓ 完成 | 状態管理 |
| cursorRenderer.ts | 11 | ✓ 完成 | Canvas描画 |
| tapDetector.ts | 0 | ✗ 未実装 | タップ判定 |
| swipeDetector.ts | 0 | ✗ 未実装 | スワイプ判定 |
| longPressDetector.ts | 0 | ✗ 未実装 | 長押し判定 |
| iphoneLayout.ts | 0 | ✗ 未実装 | レイアウト定義 |
| **スタイル・型定義** |
| global.css | 0 | ✗ 未実装 | グローバルスタイル |
| iphone.css | 0 | ✗ 未実装 | iPhoneスタイル |
| hid.d.ts | 0 | ✗ 未実装 | 型定義補完 |
| gestures.d.ts | 0 | ✗ 未実装 | ジェスチャー型 |

**総実装行数**: 約201行（実装済みコード）

## 計画済み機能（未実装）

### 1. ジェスチャー検出システム

以下のファイルがスケルトンとして用意されていますが、実装は未着手です。

- [tapDetector.ts](../src/lib/gestures/tapDetector.ts) - タップ判定
- [swipeDetector.ts](../src/lib/gestures/swipeDetector.ts) - スワイプ判定
- [longPressDetector.ts](../src/lib/gestures/longPressDetector.ts) - 長押し判定
- [useGestures.ts](../src/hooks/useGestures.ts) - ジェスチャー検出フック

### 2. デバッグ・開発支援機能

- [GestureDebugPanel.tsx](../src/components/GestureDebugPanel.tsx) - ジェスチャーログパネル
- タップ、スワイプなどのログ表示・デバッグ機能

### 3. スタイリング強化

- [global.css](../src/styles/global.css) - グローバルスタイル
- [iphone.css](../src/styles/iphone.css) - iPhoneフレーム専用スタイル

### 4. 型定義の強化

- [hid.d.ts](../src/types/hid.d.ts) - WebHID API型補完
- [gestures.d.ts](../src/types/gestures.d.ts) - ジェスチャー型定義

### 5. レイアウトシステム

- [iphoneLayout.ts](../src/lib/layout/iphoneLayout.ts) - ノッチ位置などの詳細定義
- [useIphoneCoordinateSystem.ts](../src/hooks/useIphoneCoordinateSystem.ts) の完全実装

## 開発環境

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（ポート5173）
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### ブラウザ要件

- **WebHID API対応ブラウザ**が必要です
  - Chrome 89+
  - Edge 89+
  - Opera 75+
- **HTTPSまたはlocalhostでの実行**が必須（WebHID APIのセキュリティ要件）

### TypeScript設定

- **target**: ES2020
- **jsx**: react-jsx（React 17+の自動JSX変換）
- **strict**: true（厳格な型チェック有効）
- **module**: ESNext（ネイティブモジュール出力）

## アーキテクチャ設計の特徴

### 1. レイヤー分離

- **UIコンポーネント層** (`components/`) - 表示のみを担当
- **ロジック層** (`hooks/`, `lib/`) - ビジネスロジックとデータ処理
- **状態管理** - グローバルな `cursorState` オブジェクト

### 2. モジュール設計

- **HIDモジュール** (`lib/hid/`) - デバイス接続・入力処理
- **カーソルモジュール** (`lib/cursor/`) - 描画・状態管理
- **ジェスチャーモジュール** (`lib/gestures/`) - 未実装、拡張予定

### 3. Reactフック活用

- カスタムフックでロジックを分離
- UIとロジックの疎結合を実現

## 技術的な課題と制約

### 1. WebHID APIの制限

- ユーザージェスチャー（ボタンクリックなど）が必要
- HTTPSまたはlocalhostでのみ動作
- ブラウザサポートが限定的（ChromiumベースのみSafari/Firefoxは未対応）

### 2. HIDレポートフォーマットの互換性

[mouseDeltaParser.ts](../src/lib/hid/parsers/mouseDeltaParser.ts#L2-L3) にコメントがあるように、デバイスによってHIDレポートフォーマットが異なる可能性があります。

### 3. カーソル状態のグローバル管理

現在、`cursorState` はグローバルオブジェクトとして管理されています。複数カーソルの完全なサポートには、状態管理の再設計が必要になる可能性があります。

## 拡張可能性

### 短期的な拡張

1. ジェスチャー検出の実装
2. デバッグパネルの追加
3. スタイリングの改善
4. 型定義の強化

### 中長期的な拡張

1. 複数カーソルの完全サポート（3つ以上）
2. タッチイベントのシミュレーション
3. ジェスチャー録画・再生機能
4. リアルタイムミラーリング（実際のiPhone画面を表示）
5. ネットワーク経由での複数ユーザー操作

## まとめ

iPhone Dual Cursor プロジェクトは、WebHID APIを活用した革新的なデュアルカーソルインタラクションシステムの実装例です。コア機能（HID接続、カーソル描画、基本UI）は完成していますが、ジェスチャー検出やスタイリング、型定義などの補助機能はスケルトン状態です。

現在の実装により、基本的なマウス入力を受け取り、iPhoneエミュレータに2つのカーソルを描画する段階にあります。コードは約201行と非常にコンパクトでありながら、モジュール化された設計により今後の拡張が容易な構造になっています。

## 参考リンク

- [WebHID API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)
- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [requestAnimationFrame - MDN](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
