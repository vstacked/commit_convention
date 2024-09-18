const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("profile", {
    toggle: () => ipcRenderer.invoke("profile:toggle")
})
