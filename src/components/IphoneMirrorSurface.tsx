import { useState } from "react";
import IphoneBackgroundLayer from "./IphoneBackgroundLayer";
import ClickPointOverlay from "./ClickPointOverlay";
import { useClickPoints } from "../hooks/useClickPoints";
import { useRemoteClick } from "../hooks/useRemoteClick";

export default function IphoneMirrorSurface() {
  const [scale, setScale] = useState(1.0); // 0.5 ~ 2.0
  const [aspectRatio, setAspectRatio] = useState("9:19.5"); // アスペクト比 (iPhone 16 Pro Max)
  const [remoteClickEnabled, setRemoteClickEnabled] = useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false); // 手動で横向きにするかどうか

  const {
    clickPoints,
    isEditMode,
    setIsEditMode,
    addClickPoint,
    removeClickPoint,
    updateClickPoint,
    clearAllPoints,
  } = useClickPoints();

  const { sendClickEvent } = useRemoteClick();

  // アスペクト比から幅と高さを計算
  const calculateSize = () => {
    let [w, h] = aspectRatio.split(":").map(Number);

    const baseSize = 400; // 基準サイズ
    let width: number, height: number;

    // 常に縦向きの基本サイズを計算
    height = baseSize * 2;
    width = (height * w) / h;

    return { width: width * scale, height: height * scale };
  };

  const { width, height } = calculateSize();

  // 横向きモードの切り替え
  const toggleLandscapeMode = () => {
    setIsLandscapeMode(!isLandscapeMode);
  };

  // リモートクリックハンドラー（横向き時の座標変換を考慮）
  const handleRemoteClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!remoteClickEnabled || isEditMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let relativeX = (e.clientX - rect.left) / rect.width;
    let relativeY = (e.clientY - rect.top) / rect.height;

    // 横向き時は座標を変換（画面は90度回転しているが、実際のデバイスは縦向きのため）
    let transformedX = relativeX;
    let transformedY = relativeY;

    if (isLandscapeMode) {
      // 横向き表示時: 表示上の座標を実際のデバイスの縦向き座標に変換
      // 90度右回転しているので、逆変換が必要
      transformedX = 1 - relativeY;
      transformedY = relativeX;
    }

    // WebSocket経由でクリックイベントを送信
    sendClickEvent({
      type: "click",
      x: transformedX,
      y: transformedY,
      button: "left",
    });

    console.log(`[Remote Click] Sent: (${transformedX.toFixed(3)}, ${transformedY.toFixed(3)}) [Landscape: ${isLandscapeMode}]`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%", maxWidth: "1200px" }}>
      {/* コントロールパネル */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
        {/* 横向きモード切り替えボタン */}
        <button
          onClick={toggleLandscapeMode}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: isLandscapeMode ? "#5cb85c" : "#333",
            color: "#fff",
          }}
        >
          {isLandscapeMode ? "📱 縦向き" : "🔄 横向き"}
        </button>

        {/* クリックポイント編集モード */}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: isEditMode ? "#d9534f" : "#333",
            color: "#fff",
          }}
        >
          {isEditMode ? "✓ 編集完了" : "⊕ クリックポイント編集"}
        </button>

        {/* リモートクリック有効化ボタン */}
        <button
          onClick={() => setRemoteClickEnabled(!remoteClickEnabled)}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #444",
            backgroundColor: remoteClickEnabled ? "#5cb85c" : "#333",
            color: "#fff",
          }}
        >
          {remoteClickEnabled ? "🔗 リモートクリック ON" : "🔗 リモートクリック OFF"}
        </button>

        {clickPoints.length > 0 && (
          <button
            onClick={clearAllPoints}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "1px solid #444",
              backgroundColor: "#333",
              color: "#fff",
            }}
          >
            🗑 全削除
          </button>
        )}

        {/* アスペクト比選択 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ color: "#fff", fontSize: "14px" }}>比率:</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #444",
              backgroundColor: "#333",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="9:19.5">9:19.5 (iPhone 16 Pro Max)</option>
            <option value="9:16">9:16 (iPhone標準)</option>
            <option value="16:9">16:9 (iPhone横)</option>
            <option value="4:3">4:3 (iPad)</option>
            <option value="3:4">3:4 (iPad縦)</option>
            <option value="16:10">16:10</option>
            <option value="21:9">21:9 (ウルトラワイド)</option>
            <option value="1:1">1:1 (正方形)</option>
          </select>
        </div>

        {/* サイズ調整スライダー */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ color: "#fff", fontSize: "14px" }}>サイズ:</label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            style={{ width: "150px" }}
          />
          <span style={{ color: "#fff", fontSize: "14px", minWidth: "60px" }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      <div
        onClick={handleRemoteClick}
        style={{
          position: "relative",
          width: isLandscapeMode ? `${height}px` : `${width}px`,
          height: isLandscapeMode ? `${width}px` : `${height}px`,
          border: "2px solid #444",
          borderRadius: isLandscapeMode ? `${20 * scale}px` : `${40 * scale}px`,
          overflow: "hidden",
          maxWidth: "calc(100vw - 40px)",
          maxHeight: "calc(100vh - 200px)",
          cursor: remoteClickEnabled && !isEditMode ? "pointer" : "default",
          boxSizing: "border-box",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: isLandscapeMode ? "rotate(90deg)" : "rotate(0deg)",
            transformOrigin: "center",
            transition: "transform 0.3s ease",
          }}
        >
          <IphoneBackgroundLayer />
          <ClickPointOverlay
            clickPoints={clickPoints}
            isEditMode={isEditMode}
            onAddPoint={addClickPoint}
            onRemovePoint={removeClickPoint}
            onUpdatePoint={updateClickPoint}
          />
        </div>
      </div>

      {/* ヘルプテキスト */}
      {isEditMode && (
        <div style={{ color: "#aaa", fontSize: "12px", textAlign: "center" }}>
          画面上をクリックしてクリックポイントを配置できます。<br />
          キーボードのショートカットキーを押すと、対応するポイントがクリックされます。
        </div>
      )}

      {clickPoints.length > 0 && !isEditMode && (
        <div style={{ color: "#aaa", fontSize: "12px", textAlign: "center" }}>
          キーボードショートカット: {clickPoints.map((p) => `[${p.shortcutKey}]`).join(" ")}
        </div>
      )}

      {remoteClickEnabled && !isEditMode && (
        <div style={{ color: "#5cb85c", fontSize: "12px", textAlign: "center" }}>
          🔗 リモートクリックモード有効: 画面をクリックすると、接続先のデバイスで同じ位置がクリックされます
        </div>
      )}
    </div>
  );
}
