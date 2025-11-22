# API リファレンス

Screen Share Viewerのコンポーネント、フック、ContextのAPIリファレンスです。

## コンポーネント

### App

ルートコンポーネント。アプリケーション全体の構造を定義します。

**Props**: なし

**使用例**:
```tsx
import App from './App';
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

---

### IphoneMirrorSurface

ビューアーのメインコンポーネント。アスペクト比、向き、サイズの調整機能を提供します。

**Props**: なし

**内部状態**:
- `isLandscape: boolean` - 横向き表示フラグ
- `scale: number` - 表示スケール (0.5 ~ 2.0)
- `aspectRatio: string` - アスペクト比 ("9:16", "16:9", など)

**使用例**:
```tsx
<IphoneMirrorSurface />
```

---

### IphoneBackgroundLayer

映像を表示するレイヤーコンポーネント。

**Props**: なし

**依存**:
- `useScreenCaptureContext()` から `stream` を取得

**使用例**:
```tsx
<IphoneBackgroundLayer />
```

**レンダリング**:
- ストリームあり: `<video>` 要素で映像を表示
- ストリームなし: プレースホルダー（グラデーション背景 + "iPhone Mirror"）

---

### ControlPanel

操作パネルコンポーネント。画面共有とセカンドポインターの制御を提供します。

**Props**: なし

**依存**:
- `useSecondPointer()` - セカンドポインターの状態
- `useScreenCaptureContext()` - 画面共有の状態

**使用例**:
```tsx
<ControlPanel />
```

**ボタン**:
1. 画面共有ボタン: 画面共有の開始/停止
2. 第1マウス接続ボタン: シアンポインターの接続
3. 第2マウス接続ボタン: マゼンタポインターの接続

---

## カスタムフック

### useScreenCapture

画面共有の機能を提供するカスタムフック。

**戻り値**:
```typescript
{
  stream: MediaStream | null;      // 画面共有ストリーム
  isCapturing: boolean;            // キャプチャ中かどうか
  startCapture: () => Promise<void>; // 画面共有を開始
  stopCapture: () => void;         // 画面共有を停止
}
```

**使用例**:
```tsx
function MyComponent() {
  const { stream, isCapturing, startCapture, stopCapture } = useScreenCapture();

  return (
    <button onClick={isCapturing ? stopCapture : startCapture}>
      {isCapturing ? '停止' : '開始'}
    </button>
  );
}
```

**startCapture の処理フロー**:
1. `navigator.mediaDevices.getDisplayMedia()` でストリーム取得
2. `videoTrack.applyConstraints()` で解像度を最適化
3. 実際の解像度をコンソールに出力
4. `stream` 状態を更新
5. エラー発生時は詳細なメッセージを表示

**stopCapture の処理**:
1. すべてのトラックを停止
2. `stream` を `null` に設定
3. `isCapturing` を `false` に設定

**エラーハンドリング**:
- `NotAllowedError`: 権限エラー（システム設定の案内）
- `NotFoundError`: ディスプレイが見つからない
- `NotSupportedError`: ブラウザ非対応
- `AbortError`: ユーザーがキャンセル
- `TypeError`: 無効な制約

---

### useSecondPointer

セカンドポインターデバイスの管理を提供するカスタムフック。

**戻り値**:
```typescript
{
  connectedDevices: DeviceType[];    // 接続済みデバイスのリスト
  connectPrimary: () => void;        // 第1マウスを接続
  connectSecondary: () => void;      // 第2マウスを接続
  disconnectPrimary: () => void;     // 第1マウスを切断
  disconnectSecondary: () => void;   // 第2マウスを切断
}
```

**型定義**:
```typescript
type DeviceType = "primary" | "secondary";
```

**使用例**:
```tsx
function MyComponent() {
  const {
    connectedDevices,
    connectPrimary,
    connectSecondary
  } = useSecondPointer();

  return (
    <div>
      <button onClick={connectPrimary}>
        第1マウス接続
      </button>
      <p>接続済み: {connectedDevices.join(', ')}</p>
    </div>
  );
}
```

**動作**:
- 重複接続を防止（すでに接続済みの場合は何もしない）
- コンソールに接続/切断ログを出力
- 接続状態は配列で管理

---

## Context

### ScreenCaptureContext

画面共有の状態をアプリケーション全体で共有するContext。

**型定義**:
```typescript
interface ScreenCaptureContextType {
  stream: MediaStream | null;
  isCapturing: boolean;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
}
```

---

### ScreenCaptureProvider

`ScreenCaptureContext`のProviderコンポーネント。

**Props**:
```typescript
{
  children: ReactNode;  // 子コンポーネント
}
```

**使用例**:
```tsx
function App() {
  return (
    <ScreenCaptureProvider>
      <YourComponents />
    </ScreenCaptureProvider>
  );
}
```

---

### useScreenCaptureContext

`ScreenCaptureContext`の値を取得するフック。

**戻り値**: `ScreenCaptureContextType`

**使用例**:
```tsx
function MyComponent() {
  const { stream, isCapturing, startCapture, stopCapture }
    = useScreenCaptureContext();

  // stream を使って処理...
}
```

**エラー**:
`ScreenCaptureProvider`の外で使用した場合、エラーをthrowします:
```
Error: useScreenCaptureContext must be used within ScreenCaptureProvider
```

---

## 型定義

### DeviceType

セカンドポインターのデバイスタイプ。

```typescript
type DeviceType = "primary" | "secondary";
```

---

### ScreenCaptureContextType

画面共有のContext型。

```typescript
interface ScreenCaptureContextType {
  stream: MediaStream | null;
  isCapturing: boolean;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
}
```

---

## Web API

### navigator.mediaDevices.getDisplayMedia

画面共有ストリームを取得するブラウザAPI。

**使用箇所**: `src/hooks/useScreenCapture.ts`

**制約**:
```typescript
{
  video: true,  // シンプルな制約（互換性重視）
  audio: false  // 音声は無効
}
```

**取得後の最適化**:
```typescript
await videoTrack.applyConstraints({
  width: { ideal: 3840 },
  height: { ideal: 2160 },
  frameRate: { ideal: 60 },
});
```

---

### MediaStreamTrack.applyConstraints

取得済みのトラックに制約を適用するAPI。

**使用目的**: 初期取得後に高解像度を要求することで、互換性と品質を両立。

**エラーハンドリング**: 制約適用に失敗してもキャプチャは継続。

---

## スタイリング

### インラインスタイル

コンポーネント内で動的に計算されるスタイル。

**例**:
```tsx
style={{
  width: `${width}px`,
  height: `${height}px`,
  borderRadius: `${40 * scale}px`,
}}
```

### グローバルCSS

`src/styles/global.css` で定義される最適化スタイル。

**video要素の最適化**:
```css
video {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
```
