import { useEffect, useState } from "react";
import IphoneMirrorSurface from "./components/IphoneMirrorSurface";
import ControlPanel from "./components/ControlPanel";
import OverlayCanvas from "./components/OverlayCanvas";
import ElectronControlPanel from "./components/ElectronControlPanel";
import { ScreenCaptureProvider } from "./contexts/ScreenCaptureContext";

export default function App() {
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // URLハッシュでオーバーレイモードを判定
    setIsOverlayMode(window.location.hash === "#overlay");

    // Electron環境かどうかを判定
    // contextIsolation: trueの環境では window.electronAPI が存在する
    setIsElectron(!!window.electronAPI);
  }, []);

  // オーバーレイモード（透明ウィンドウ）
  if (isOverlayMode) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "transparent",
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <OverlayCanvas />
      </div>
    );
  }

  // Electronアプリのメインウィンドウ
  if (isElectron) {
    return <ElectronControlPanel />;
  }

  // Web版（ブラウザ）
  return (
    <ScreenCaptureProvider>
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <IphoneMirrorSurface />
        <ControlPanel />
      </div>
    </ScreenCaptureProvider>
  );
}
