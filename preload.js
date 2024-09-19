const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("profile", {
    toggle: () => ipcRenderer.invoke("profile:toggle")
})

contextBridge.exposeInMainWorld('secureApi', {
    sanitizeInput: (input) => ipcRenderer.invoke("secureApi:sanitizeInput", input)
})

contextBridge.exposeInMainWorld("store", {
    getProfiles: () => ipcRenderer.invoke("store:getProfiles"),
    getProfileUsed: () => ipcRenderer.invoke("store:getProfileUsed"),
    addProfile: (profileName) => ipcRenderer.invoke("store:addProfile", profileName),
    deleteProfile: (profileId) => ipcRenderer.invoke("store:deleteProfile", profileId),
    renameProfile: (json) => ipcRenderer.invoke("store:renameProfile", json),
    applyProfile: (profileId) => ipcRenderer.invoke("store:applyProfile", profileId),
    saveContent: (json) => ipcRenderer.invoke("store:saveContent", json),
    getContent: (json) => ipcRenderer.invoke("store:getContent", json),
    deleteContent: (json) => ipcRenderer.invoke("store:deleteContent", json),
})