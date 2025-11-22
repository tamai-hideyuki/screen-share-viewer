import { WebSocketServer, WebSocket } from "ws";

export interface ClickEvent {
  type: "click" | "mousedown" | "mouseup" | "mousemove";
  x: number; // 相対座標 (0-1)
  y: number; // 相対座標 (0-1)
  button?: "left" | "right" | "middle";
}

export class RemoteClickServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port });

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("[WebSocket Server] Client connected");
      this.clients.add(ws);

      ws.on("message", (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());

          // すべてのクライアントにブロードキャスト（送信者以外）
          this.broadcast(message, ws);

          console.log("[WebSocket Server] Forwarding click event:", message);
        } catch (error) {
          console.error("[WebSocket Server] Error parsing message:", error);
        }
      });

      ws.on("close", () => {
        console.log("[WebSocket Server] Client disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("[WebSocket Server] WebSocket error:", error);
        this.clients.delete(ws);
      });
    });

    console.log(`[WebSocket Server] Running on ws://localhost:${port}`);
  }

  private broadcast(message: any, sender: WebSocket) {
    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public close() {
    this.wss.close();
    console.log("[WebSocket Server] Server closed");
  }
}
