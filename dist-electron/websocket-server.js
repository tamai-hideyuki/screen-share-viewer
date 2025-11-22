"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteClickServer = void 0;
const ws_1 = require("ws");
class RemoteClickServer {
    constructor(port = 8080) {
        this.clients = new Set();
        this.wss = new ws_1.WebSocketServer({ port });
        this.wss.on("connection", (ws) => {
            console.log("[WebSocket Server] Client connected");
            this.clients.add(ws);
            ws.on("message", (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    // すべてのクライアントにブロードキャスト（送信者以外）
                    this.broadcast(message, ws);
                    console.log("[WebSocket Server] Forwarding click event:", message);
                }
                catch (error) {
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
    broadcast(message, sender) {
        this.clients.forEach((client) => {
            if (client !== sender && client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    close() {
        this.wss.close();
        console.log("[WebSocket Server] Server closed");
    }
}
exports.RemoteClickServer = RemoteClickServer;
