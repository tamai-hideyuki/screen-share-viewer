// Node.js standalone server for robotjs mouse control
const WebSocket = require("ws");
const robot = require("robotjs");

const PORT = 8080;

class RemoteClickServer {
  constructor(port) {
    this.wss = new WebSocket.Server({ port });
    this.clients = new Set();

    console.log(`[RemoteClickServer] WebSocket server started on ws://localhost:${port}`);

    this.wss.on("connection", (ws) => {
      console.log("[RemoteClickServer] Client connected");
      this.clients.add(ws);

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log("[RemoteClickServer] Received:", message);

          // Execute mouse action on this machine
          this.executeMouseAction(message);

          // Broadcast to all other clients (for cursor sync)
          this.broadcast(message, ws);
        } catch (error) {
          console.error("[RemoteClickServer] Error processing message:", error);
        }
      });

      ws.on("close", () => {
        console.log("[RemoteClickServer] Client disconnected");
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("[RemoteClickServer] WebSocket error:", error);
      });
    });
  }

  executeMouseAction(clickEvent) {
    try {
      // Get screen size
      const screenSize = robot.getScreenSize();
      const { width, height } = screenSize;

      // Convert relative coordinates (0-1) to absolute screen coordinates
      const absoluteX = Math.round(clickEvent.x * width);
      const absoluteY = Math.round(clickEvent.y * height);

      console.log(`[RemoteClickServer] Moving mouse to (${absoluteX}, ${absoluteY})`);

      // Move mouse
      robot.moveMouse(absoluteX, absoluteY);

      // Execute click if needed
      if (clickEvent.type === "click" || clickEvent.type === "mousedown") {
        const button = clickEvent.button === "right" ? "right" : "left";
        console.log(`[RemoteClickServer] Clicking ${button} button`);
        robot.mouseClick(button);
      }
    } catch (error) {
      console.error("[RemoteClickServer] Error executing mouse action:", error);
    }
  }

  broadcast(message, excludeWs) {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

// Start server
const server = new RemoteClickServer(PORT);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[RemoteClickServer] Shutting down...");
  server.wss.close(() => {
    console.log("[RemoteClickServer] Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n[RemoteClickServer] Shutting down...");
  server.wss.close(() => {
    console.log("[RemoteClickServer] Server closed");
    process.exit(0);
  });
});
