# 画面共有機能ドキュメント

## 概要

iPhone Dual Cursorプロジェクトに、画面共有（Screen Capture）機能を追加しました。この機能により、QuickTime PlayerでミラーリングしたiPhoneの画面や、任意のウィンドウ・タブをブラウザ内でキャプチャし、背景として表示できます。

## 実装内容

### 1. 画面キャプチャフック

**ファイル**: [src/hooks/useScreenCapture.ts](../src/hooks/useScreenCapture.ts)

`getDisplayMedia` APIを使用して画面共有を実装したカスタムフックです。

```typescript
export function useScreenCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapture = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 },
      },
      audio: false,
    });
    setStream(mediaStream);
    setIsCapturing(true);
  }, []);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCapturing(false);
    }
  }, [stream]);

  return { stream, isCapturing, startCapture, stopCapture };
}
```

**機能**:
- `stream`: キャプチャした映像の MediaStream
- `isCapturing`: キャプチャ中かどうかのフラグ
- `startCapture()`: 画面共有を開始
- `stopCapture()`: 画面共有を停止

**設定**:
- 解像度: 1920x1080（理想値）
- フレームレート: 60fps（理想値）
- 音声: なし

### 2. Context Provider

**ファイル**: [src/contexts/ScreenCaptureContext.tsx](../src/contexts/ScreenCaptureContext.tsx)

画面共有の状態をアプリ全体で共有するためのContext Providerです。

```typescript
export function ScreenCaptureProvider({ children }: { children: ReactNode }) {
  const screenCapture = useScreenCapture();

  return (
    <ScreenCaptureContext.Provider value={screenCapture}>
      {children}
    </ScreenCaptureContext.Provider>
  );
}

export function useScreenCaptureContext() {
  const context = useContext(ScreenCaptureContext);
  if (!context) {
    throw new Error("useScreenCaptureContext must be used within ScreenCaptureProvider");
  }
  return context;
}
```

### 3. ビデオ背景レイヤー

**ファイル**: [src/components/IphoneBackgroundLayer.tsx](../src/components/IphoneBackgroundLayer.tsx)

キャプチャした映像を`<video>`要素で表示する背景レイヤーコンポーネントです。

**主要な変更点**:
- `useScreenCaptureContext`から`stream`を取得
- `stream`が存在する場合は`<video>`要素で表示
- `stream`が`null`の場合はグラデーション背景を表示

```typescript
export default function IphoneBackgroundLayer() {
  const { stream } = useScreenCaptureContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  return (
    <>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div>{/* グラデーション背景 */}</div>
      )}
    </>
  );
}
```

### 4. コントロールパネル

**ファイル**: [src/components/ControlPanel.tsx](../src/components/ControlPanel.tsx)

画面共有の開始/停止ボタンを追加しました。

```typescript
export default function ControlPanel() {
  const { isCapturing, startCapture, stopCapture } = useScreenCaptureContext();

  return (
    <div>
      <button onClick={isCapturing ? stopCapture : startCapture}>
        {isCapturing ? "📹 画面共有を停止" : "📹 画面共有を開始"}
      </button>
      {/* マウス接続ボタン */}
    </div>
  );
}
```

**UI仕様**:
- キャプチャ中: 緑色の背景 (#0a5)
- 待機中: 青色の背景 (#05a)
- ボタンラベルが状態に応じて切り替わる

### 5. キーボード操作

**ファイル**: [src/hooks/useKeyboardCursorControl.ts](../src/hooks/useKeyboardCursorControl.ts)

macOSではWebHIDでマウス入力が取得できないため、キーボードで2つのカーソルを操作できるようにしました。

```typescript
export function useKeyboardCursorControl() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const primary = getCursorById("primary");
      const secondary = getCursorById("secondary");
      const speed = 5;

      // Primary cursor: WASD
      if (e.key === "w") primary.y -= speed;
      if (e.key === "s") primary.y += speed;
      if (e.key === "a") primary.x -= speed;
      if (e.key === "d") primary.x += speed;

      // Secondary cursor: Arrow keys
      if (e.key === "ArrowUp") secondary.y -= speed;
      if (e.key === "ArrowDown") secondary.y += speed;
      if (e.key === "ArrowLeft") secondary.x -= speed;
      if (e.key === "ArrowRight") secondary.x += speed;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
```

**操作方法**:
- **第1カーソル（シアン）**: WASDキー
- **第2カーソル（マゼンタ）**: 矢印キー
- 移動速度: 5px/キー押下

## 使用方法

### 基本的な使い方

1. ブラウザで http://localhost:5173/ を開く
2. 「📹 画面共有を開始」ボタンをクリック
3. ブラウザの画面共有ダイアログが表示される
4. 共有したい画面/ウィンドウ/タブを選択して「共有」をクリック
5. 選択した画面がiPhoneフレーム内に表示される
6. WASDキーと矢印キーで2つのカーソルを操作

### QuickTime Playerでのミラーリング手順

1. iPhoneとMacをUSBケーブルで接続
2. QuickTime Playerを起動
3. メニューから「ファイル」→「新規ムービー収録」
4. 録画ボタン横の▼をクリックして、iPhoneを選択
5. iPhone画面がQuickTime Playerのウィンドウに表示される
6. ブラウザで「📹 画面共有を開始」をクリック
7. 画面共有ダイアログで以下のいずれかを選択：
   - **画面全体**タブ → メインディスプレイ
   - **ウィンドウ**タブ → QuickTime Playerのウィンドウ（表示されない場合あり）

## ブラウザ要件

### 対応ブラウザ

`getDisplayMedia` APIに対応したブラウザが必要です：

- **Chrome** 72+
- **Edge** 79+
- **Opera** 60+
- **Safari** 13+ (macOS 10.15+)
- **Firefox** 66+

### セキュリティ要件

- **HTTPS接続**または**localhost**でのみ動作
- ユーザージェスチャー（ボタンクリック等）が必要
- ブラウザの画面収録権限が必要（macOSの場合）

### macOSでの権限設定

画面共有が動作しない場合、以下を確認してください：

1. 「システム設定」→「プライバシーとセキュリティ」を開く
2. 「画面収録」をクリック
3. 使用しているブラウザ（Chrome/Edge/Safari等）にチェックを入れる
4. ブラウザを再起動

## トラブルシューティング

### 画面共有ダイアログでQuickTime Playerが表示されない

**原因**: macOSのセキュリティ制限により、一部のシステムアプリケーションのウィンドウが選択肢に表示されない場合があります。

**解決策**:
1. **画面全体を共有**する（「画面」タブを選択）
2. 別のミラーリングアプリを使用する
3. QuickTime Playerを全画面表示にしてから画面全体を共有

### "NotAllowedError: Permission denied by user"

**原因**: ダイアログで「キャンセル」を押した、または権限が拒否されています。

**解決策**:
1. もう一度「📹 画面共有を開始」ボタンをクリック
2. ダイアログで「**共有**」ボタンをクリック（キャンセルしない）
3. macOSの画面収録権限を確認

### 映像が表示されない・黒い画面になる

**原因**: ストリームの取得は成功しているが、video要素で再生されていない。

**確認方法**:
1. ブラウザの開発者ツール（F12）を開く
2. コンソールで以下のログを確認：
   ```
   [ScreenCapture] ✅ Started capturing screen successfully
   [IphoneBackground] Stream changed: MediaStream
   [IphoneBackground] ✅ Video playing
   ```

**解決策**:
- ブラウザをリロード（Cmd+R）
- 画面共有を停止して再度開始
- 別のウィンドウ/タブを試す

## 技術的な詳細

### MediaStream API

`getDisplayMedia()` は以下の設定で呼び出されています：

```typescript
const mediaStream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    width: { ideal: 1920 },   // 理想的な幅
    height: { ideal: 1080 },  // 理想的な高さ
    frameRate: { ideal: 60 }, // 理想的なフレームレート
  },
  audio: false,               // 音声キャプチャなし
});
```

**注意**: `ideal`は推奨値であり、実際の解像度・フレームレートはシステムやブラウザによって異なる場合があります。

### ビデオ表示の最適化

```css
video {
  width: 100%;
  height: 100%;
  object-fit: cover;  /* アスペクト比を保ちつつ領域を埋める */
  pointer-events: none;  /* ビデオ要素がクリックイベントを阻害しない */
}
```

- `object-fit: cover`: 映像のアスペクト比を保ちつつ、400x800pxのiPhoneフレームを埋める
- `autoPlay`: 自動再生
- `muted`: ミュート状態（autoPlayの要件）

### ストリーム停止の自動検出

ユーザーがブラウザのUIから共有を停止した場合、自動的に状態を更新します：

```typescript
mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
  stopCapture();
});
```

## デバッグログ

実装には詳細なデバッグログが含まれています：

| ログメッセージ | 意味 |
|--------------|------|
| `[ScreenCapture] Requesting display media...` | 画面共有ダイアログを表示中 |
| `[ScreenCapture] Got media stream:` | ストリーム取得成功 |
| `[ScreenCapture] ✅ Started capturing screen successfully` | キャプチャ開始成功 |
| `[ScreenCapture] ❌ Error:` | エラー発生 |
| `[ScreenCapture] Stream ended` | ストリームが停止された |
| `[IphoneBackground] Stream changed:` | ストリーム状態が変化 |
| `[IphoneBackground] Setting video srcObject` | video要素にストリームを設定 |
| `[IphoneBackground] ✅ Video playing` | ビデオ再生開始 |
| `[IphoneBackground] ❌ Video play error:` | ビデオ再生エラー |

## 今後の拡張案

### 可能な改善

1. **録画機能**: MediaRecorder APIを使用して画面+カーソル操作を録画
2. **スクリーンショット**: Canvasに描画してPNG出力
3. **ピクチャーインピクチャー**: 複数の画面を同時表示
4. **解像度選択**: UIから解像度を選択可能に
5. **フレームレート調整**: パフォーマンスに応じて調整
6. **音声キャプチャ**: システム音声も取得可能にする

### 制限事項

- macOSではQuickTime Playerのウィンドウが選択肢に表示されない場合がある（システムレベルの制限）
- 画面全体を共有する場合、他のウィンドウも映り込む
- ブラウザによって対応解像度・フレームレートが異なる

## 参考リンク

- [Screen Capture API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API)
- [MediaDevices.getDisplayMedia() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- [HTMLMediaElement - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
