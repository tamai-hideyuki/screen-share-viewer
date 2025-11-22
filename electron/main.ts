// Use eval to prevent TypeScript/bundler from resolving 'electron' at build time
// This forces runtime resolution by Electron's built-in module system
const electron = eval('require("electron")');

import * as path from "path";
import * as robot from "robotjs";
import { RemoteClickServer, ClickEvent } from "./websocket-server";

// Debug logging
console.log("[DEBUG] electron:", electron);
console.log("[DEBUG] electron type:", typeof electron);
console.log("[DEBUG] electron keys:", Object.keys(electron || {}).slice(0, 10));

const { app, BrowserWindow, screen: electronScreen, globalShortcut, ipcMain } = electron;

console.log("[DEBUG] app type:", typeof app);
console.log("[DEBUG] app:", app);
console.log("[DEBUG] BrowserWindow type:", typeof BrowserWindow);

// __dirname is automatically available in CommonJS

let mainWindow: any = null;
let overlayWindow: any = null;
let wsServer: any = null;

function createMainWindow() {
  // tsc builds preload.ts to dist-electron/preload.js
  const preloadPath = path.join(__dirname, "preload.js");

  console.log("[Main] Preload path:", preloadPath);
  console.log("[Main] __dirname:", __dirname);

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    title: "iPhone Mirror Controller",
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createOverlayWindow() {
  const primaryDisplay = electronScreen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // @ts-ignore
    hasShadow: false,
  });

  // @ts-ignore
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  if (process.env.VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#overlay`);
  } else {
    overlayWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "overlay",
    });
  }

  overlayWindow.webContents.on("did-finish-load", () => {
    overlayWindow?.focus();
    console.log("[Overlay] Window focused");
  });

  overlayWindow.webContents.on("before-input-event", (_event: any, input: any) => {
    if (input.meta && input.shift && input.key === "I") {
      overlayWindow?.webContents.toggleDevTools();
    }
  });

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
}

function registerGlobalShortcuts() {
  globalShortcut.register("CommandOrControl+Shift+O", () => {
    if (overlayWindow) {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
      }
    } else {
      createOverlayWindow();
    }
  });

  globalShortcut.register("CommandOrControl+Shift+E", () => {
    if (overlayWindow) {
      // @ts-ignore
      overlayWindow.setIgnoreMouseEvents(false);
      console.log("[Overlay] Edit mode enabled");
    }
  });

  globalShortcut.register("CommandOrControl+Shift+D", () => {
    if (overlayWindow) {
      // @ts-ignore
      overlayWindow.setIgnoreMouseEvents(true, { forward: true });
      console.log("[Overlay] Click-through enabled");
    }
  });
}

app.whenReady().then(() => {
  // IPCハンドラー: リモートクリックを実行
  ipcMain.handle("execute-remote-click", (_event: any, clickEvent: any) => {
    try {
      const primaryDisplay = electronScreen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.size;

      // 相対座標を絶対座標に変換
      const absoluteX = Math.round(clickEvent.x * width);
      const absoluteY = Math.round(clickEvent.y * height);

      console.log(`[Remote Click] Moving to (${absoluteX}, ${absoluteY})`);

      // マウスを移動
      robot.moveMouse(absoluteX, absoluteY);

      // クリックを実行
      if (clickEvent.type === "click" || clickEvent.type === "mousedown") {
        const button = clickEvent.button === "right" ? "right" : "left";
        robot.mouseClick(button);
        console.log(`[Remote Click] ${button} click executed`);
      }

      return { success: true };
    } catch (error) {
      console.error("[Remote Click] Error:", error);
      return { success: false, error: String(error) };
    }
  });

  createMainWindow();
  registerGlobalShortcuts();

  // WebSocketサーバーを起動
  wsServer = new RemoteClickServer(8080);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();

  if (wsServer) {
    wsServer.close();
  }
});
