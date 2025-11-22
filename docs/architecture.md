# アーキテクチャ

Screen Share Viewerのコードベース構造と設計について説明します。

## プロジェクト構造

```
src/
├── components/              # UIコンポーネント
│   ├── ControlPanel.tsx    # 操作パネル
│   ├── IphoneMirrorSurface.tsx  # メインビューアー
│   └── IphoneBackgroundLayer.tsx # 映像レイヤー
├── contexts/               # Reactコンテキスト
│   └── ScreenCaptureContext.tsx # 画面共有の状態管理
├── hooks/                  # カスタムフック
│   ├── useScreenCapture.ts # 画面共有ロジック
│   └── useSecondPointer.ts # セカンドポインター管理
├── styles/                 # スタイルシート
│   └── global.css          # グローバルスタイル
├── types/                  # TypeScript型定義
├── lib/                    # ユーティリティ
├── App.tsx                 # ルートコンポーネント
└── main.tsx                # エントリーポイント
```

## コンポーネント階層

```
App
└── ScreenCaptureProvider (Context)
    └── Container
        ├── IphoneMirrorSurface
        │   ├── Controls (アスペクト比、向き、サイズ)
        │   └── IphoneBackgroundLayer
        │       └── <video> 要素
        └── ControlPanel
            ├── 画面共有ボタン
            ├── 第1マウス接続ボタン
            └── 第2マウス接続ボタン
```

## データフロー

### 画面共有のフロー

```
1. ユーザー操作
   └─> ControlPanel: "画面共有を開始" クリック
       └─> useScreenCaptureContext().startCapture()
           └─> useScreenCapture().startCapture()
               ├─> navigator.mediaDevices.getDisplayMedia()
               ├─> videoTrack.applyConstraints() (解像度最適化)
               └─> setStream(mediaStream)
                   └─> Context更新
                       └─> IphoneBackgroundLayer: video要素に反映
```

### 状態管理のフロー

```
useScreenCapture (カスタムフック)
  ├── stream: MediaStream | null
  ├── isCapturing: boolean
  ├── startCapture: () => Promise<void>
  └── stopCapture: () => void
       ↓
ScreenCaptureContext (Context)
  └── Provider経由で配下のコンポーネントに提供
       ↓
useScreenCaptureContext (カスタムフック)
  └── コンポーネントから利用
```

## 主要コンポーネント

### App.tsx

ルートコンポーネント。`ScreenCaptureProvider`でアプリ全体をラップし、画面共有の状態を全コンポーネントで共有できるようにします。

```tsx
<ScreenCaptureProvider>
  <Container>
    <IphoneMirrorSurface />
    <ControlPanel />
  </Container>
</ScreenCaptureProvider>
```

### IphoneMirrorSurface

ビューアーのメインコンポーネント。アスペクト比、向き、サイズの調整UIと、映像表示エリアを含みます。

**責務**:
- アスペクト比の選択
- 向きの切り替え
- サイズ調整
- 表示領域の計算とレンダリング

### IphoneBackgroundLayer

実際の映像を表示するコンポーネント。`video`要素を管理し、ストリームを表示します。

**責務**:
- MediaStreamの`video`要素への接続
- 映像の再生
- プレースホルダー表示（ストリームがない場合）

### ControlPanel

操作パネルコンポーネント。画面共有の開始/停止、セカンドポインターの接続を制御します。

**責務**:
- 画面共有の開始/停止ボタン
- セカンドポインターの接続ボタン
- 接続状態の表示

## カスタムフック

### useScreenCapture

画面共有のロジックを管理するフック。

**機能**:
- `getDisplayMedia`による画面キャプチャ
- 動的な解像度制約の適用
- エラーハンドリングと詳細なログ出力
- ストリームのライフサイクル管理

**最適化**:
1. 初期取得: 制約なしで取得（互換性重視）
2. 取得後: `applyConstraints()`で高解像度を要求
3. 警告: 低解像度の場合はコンソールに出力

### useSecondPointer

セカンドポインターの状態を管理するフック。

**機能**:
- 接続デバイスの管理
- 第1/第2マウスの接続/切断
- 接続状態の追跡

## Contextパターン

### ScreenCaptureContext

画面共有の状態をアプリケーション全体で共有するためのContext。

**提供する値**:
```typescript
interface ScreenCaptureContextType {
  stream: MediaStream | null;
  isCapturing: boolean;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
}
```

**メリット**:
- Props drillingの回避
- コンポーネント間の疎結合
- 状態の一元管理

## スタイリング戦略

### CSS-in-JS (インラインスタイル)

すべてのコンポーネントでインラインスタイルを使用。

**理由**:
- 動的なスタイル計算（アスペクト比、サイズ、向き）
- コンポーネントのカプセル化
- ビルドサイズの削減

### グローバルCSS

基本的なリセットと最適化のみグローバルCSSで定義。

**内容**:
- CSSリセット
- video要素の品質最適化
- GPUアクセラレーション

## パフォーマンス最適化

### レンダリング最適化

1. **CSS Transform**: `translateZ(0)`でGPUアクセラレーション
2. **Image Rendering**: `crisp-edges`で鮮明な描画
3. **Backface Visibility**: レンダリングの最適化

### メモリ管理

- ストリーム停止時に`track.stop()`を呼び出し
- 不要なリソースの解放

### useCallback

状態更新関数を`useCallback`でメモ化し、不要な再レンダリングを防止。

## エラーハンドリング戦略

### 段階的なエラー処理

1. **try-catch**: 画面共有APIの呼び出しをラップ
2. **エラー分類**: エラー名に基づいて分類
3. **ユーザーフィードバック**: 対処法を含む詳細なメッセージ
4. **ログ出力**: コンソールに詳細情報を記録

### ユーザーエクスペリエンス

- エラーの種類に応じた具体的な対処法を表示
- システム設定へのナビゲーション支援
- 開発者向けの詳細ログ

## 拡張性

### 新しいアスペクト比の追加

`IphoneMirrorSurface.tsx`の`select`要素に新しい`option`を追加するだけで対応可能。

### 新しいポインターデバイスの追加

`useSecondPointer`フックを拡張して、新しいデバイスタイプを追加可能。

### カスタムレンダリング

`IphoneBackgroundLayer`を置き換えることで、異なるレンダリング方式に対応可能。
