import { useEffect, useRef } from "react";
import { useScreenCaptureContext } from "../contexts/ScreenCaptureContext";

export default function IphoneBackgroundLayer() {
  const { stream } = useScreenCaptureContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("[IphoneBackground] Stream changed:", stream);
    if (videoRef.current && stream) {
      console.log("[IphoneBackground] Setting video srcObject");
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        console.log("[IphoneBackground] ✅ Video playing");
      }).catch((err) => {
        console.error("[IphoneBackground] ❌ Video play error:", err);
      });
    }
  }, [stream]);

  return (
    <>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            pointerEvents: "none",
          } as React.CSSProperties}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            userSelect: "none",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          iPhone Mirror
        </div>
      )}
    </>
  );
}
