import { useEffect, useRef, useCallback } from "react";

export interface ClickEvent {
  type: "click" | "mousedown" | "mouseup" | "mousemove";
  x: number; // 相対座標 (0-1)
  y: number; // 相対座標 (0-1)
  button?: "left" | "right" | "middle";
}

export function useRemoteClick(serverUrl: string = "ws://localhost:8080") {
  const ws = useRef<WebSocket | null>(null);
  const isConnected = useRef(false);

  // WebSocket接続を確立
  useEffect(() => {
    console.log(`[WebSocket Client] Attempting to connect to ${serverUrl}...`);

    try {
      ws.current = new WebSocket(serverUrl);

      ws.current.onopen = () => {
        console.log("[WebSocket Client] ✅ Connected to server successfully");
        isConnected.current = true;
      };

      ws.current.onclose = (event) => {
        console.log(`[WebSocket Client] ❌ Disconnected from server (code: ${event.code}, reason: ${event.reason})`);
        isConnected.current = false;
      };

      ws.current.onerror = (error) => {
        console.error("[WebSocket Client] ❌ Connection error:", error);
        console.error("[WebSocket Client] Make sure the WebSocket server is running (npm run electron)");
      };

      // リモートからのクリックイベントを受信
      ws.current.onmessage = async (event) => {
        try {
          const clickEvent: ClickEvent = JSON.parse(event.data);
          console.log("[WebSocket Client] Received click event:", clickEvent);

          // Electron環境の場合、IPCを通じてクリックを実行
          if (window.electronAPI?.executeRemoteClick) {
            console.log("[WebSocket Client] Executing remote click via IPC...");
            const result = await window.electronAPI.executeRemoteClick(clickEvent);
            console.log("[WebSocket Client] IPC result:", result);
          } else {
            console.warn("[WebSocket Client] electronAPI not available - not in Electron environment");
          }
        } catch (error) {
          console.error("[WebSocket Client] Error parsing message:", error);
        }
      };
    } catch (error) {
      console.error("[WebSocket Client] Connection error:", error);
    }

    // クリーンアップ
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [serverUrl]);

  // クリックイベントを送信
  const sendClickEvent = useCallback((clickEvent: ClickEvent) => {
    if (ws.current && isConnected.current) {
      try {
        ws.current.send(JSON.stringify(clickEvent));
        console.log("[WebSocket Client] Sent click event:", clickEvent);
      } catch (error) {
        console.error("[WebSocket Client] Error sending message:", error);
      }
    } else {
      console.warn("[WebSocket Client] Not connected to server");
    }
  }, []);

  return { sendClickEvent, isConnected: isConnected.current };
}

// グローバル型定義の拡張
declare global {
  interface Window {
    electronAPI?: {
      getDesktopSources?: () => Promise<any>;
      executeRemoteClick?: (clickEvent: ClickEvent) => Promise<any>;
    };
  }
}
