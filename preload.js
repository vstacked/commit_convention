const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("profile", {
    toggle: () => ipcRenderer.invoke("profile:toggle")
})

contextBridge.exposeInMainWorld('secureApi', {
    sanitizeInput: (input) => ipcRenderer.invoke("secureApi:sanitizeInput", input)
})