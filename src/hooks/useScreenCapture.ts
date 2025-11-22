import { useState, useCallback } from "react";

export function useScreenCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapture = useCallback(async () => {
    try {
      console.log("[ScreenCapture] Requesting display media...");
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      console.log("[ScreenCapture] Got media stream:", mediaStream);

      const videoTrack = mediaStream.getVideoTracks()[0];
      console.log("[ScreenCapture] Video tracks:", mediaStream.getVideoTracks());

      // 取得後に高解像度の制約を適用
      try {
        await videoTrack.applyConstraints({
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 60 },
        });
        console.log("[ScreenCapture] ✅ Applied high resolution constraints");
      } catch (constraintError) {
        console.warn("[ScreenCapture] ⚠️ Could not apply high resolution constraints:", constraintError);
        // 制約適用に失敗しても続行
      }

      // 実際の解像度とフレームレートを確認
      const settings = videoTrack.getSettings();
      console.log("[ScreenCapture] Video settings:", settings);
      console.log(`[ScreenCapture] Resolution: ${settings.width}x${settings.height} @ ${settings.frameRate}fps`);

      // 解像度が低い場合は警告
      if (settings.width && settings.width < 1920) {
        console.warn(`[ScreenCapture] ⚠️ Low resolution detected: ${settings.width}x${settings.height}`);
        console.warn("[ScreenCapture] 共有元の画面解像度が低い可能性があります");
      }

      setStream(mediaStream);
      setIsCapturing(true);

      // ストリームが停止された時の処理
      mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("[ScreenCapture] Stream ended");
        stopCapture();
      });

      console.log("[ScreenCapture] ✅ Started capturing screen successfully");
    } catch (error) {
      console.error("[ScreenCapture] ❌ Error:", error);

      let errorMessage = "画面共有を開始できませんでした\n\n";

      if (error instanceof Error) {
        errorMessage += `エラー: ${error.name}\n`;
        errorMessage += `詳細: ${error.message}\n\n`;

        if (error.name === "NotAllowedError") {
          errorMessage += "対処法:\n";
          errorMessage += "1. システム設定 > プライバシーとセキュリティ > 画面収録\n";
          errorMessage += "2. ブラウザ（Chrome/Safari等）にチェックを入れる\n";
          errorMessage += "3. ブラウザを完全に終了（Cmd+Q）して再起動";
        } else if (error.name === "NotFoundError") {
          errorMessage += "対処法: 画面共有可能なディスプレイが見つかりませんでした";
        } else if (error.name === "NotSupportedError") {
          errorMessage += "対処法: このブラウザは画面共有をサポートしていません\n";
          errorMessage += "Chrome、Safari、Firefox等の最新版をお試しください";
        } else if (error.name === "AbortError") {
          errorMessage += "画面共有がキャンセルされました";
        }
      }

      alert(errorMessage);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCapturing(false);
      console.log("[ScreenCapture] Stopped capturing");
    }
  }, [stream]);

  return { stream, isCapturing, startCapture, stopCapture };
}
