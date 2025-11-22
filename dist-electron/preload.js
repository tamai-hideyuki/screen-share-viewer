"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// ElectronのdesktopCapturerをレンダラープロセスで使えるようにする
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    getDesktopSources: async () => {
        return await electron_1.ipcRenderer.invoke("get-desktop-sources");
    },
    executeRemoteClick: async (clickEvent) => {
        return await electron_1.ipcRenderer.invoke("execute-remote-click", clickEvent);
    },
});
