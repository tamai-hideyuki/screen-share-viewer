import { contextBridge, ipcRenderer } from "electron";

export interface ClickEvent {
  type: "click" | "mousedown" | "mouseup" | "mousemove";
  x: number; // 相対座標 (0-1)
  y: number; // 相対座標 (0-1)
  button?: "left" | "right" | "middle";
}

// ElectronのdesktopCapturerをレンダラープロセスで使えるようにする
contextBridge.exposeInMainWorld("electronAPI", {
  getDesktopSources: async () => {
    return await ipcRenderer.invoke("get-desktop-sources");
  },
  executeRemoteClick: async (clickEvent: ClickEvent) => {
    return await ipcRenderer.invoke("execute-remote-click", clickEvent);
  },
});
