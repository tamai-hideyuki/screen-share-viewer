import React from "react";
import { useSecondPointer } from "../hooks/useSecondPointer";
import { useScreenCaptureContext } from "../contexts/ScreenCaptureContext";

export default function ControlPanel() {
  const { connectPrimary, connectSecondary, connectedDevices } = useSecondPointer();
  const { isCapturing, startCapture, stopCapture } = useScreenCaptureContext();

  const buttonStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
    marginRight: "10px",
  };

  return (
    <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          style={{
            ...buttonStyle,
            background: isCapturing ? "#0a5" : "#05a",
          }}
          onClick={isCapturing ? stopCapture : startCapture}
        >
          {isCapturing ? "📹 画面共有を停止" : "📹 画面共有を開始"}
        </button>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          style={{
            ...buttonStyle,
            background: connectedDevices.includes("primary") ? "#0a5" : "#222",
          }}
          onClick={connectPrimary}
          disabled={connectedDevices.includes("primary")}
        >
          第1マウスを接続 (シアン)
        </button>
        <button
          style={{
            ...buttonStyle,
            background: connectedDevices.includes("secondary") ? "#a05" : "#222",
          }}
          onClick={connectSecondary}
          disabled={connectedDevices.includes("secondary")}
        >
          第2マウスを接続 (マゼンタ)
        </button>
      </div>
      {connectedDevices.length > 0 && (
        <div style={{ color: "#888", fontSize: "12px" }}>
          接続済み: {connectedDevices.join(", ")}
        </div>
      )}
    </div>
  );
}
