const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");
const sanitizeHtml = require("sanitize-html")
const Store = require("electron-store")
const { v4: uuidv4 } = require('uuid');

let winMain, winProfile, winProfileToggle, store;

function initStore() {
  const schema = {
    profiles: {
      type: "object",
      properties: {
        "^\S+$": {
          type: "object",
          properties: {
            profile: {
              type: "string"
            },
            scope: {
              type: "array",
              items: {
                type: "string"
              }
            },
            description: {
              type: "array",
              items: {
                type: "string"
              }
            },
            body: {
              type: "array",
              items: {
                type: "string"
              }
            },
            footer: {
              type: "array",
              items: {
                type: "string"
              }
            }
          }
        }
      },
      default: {
        default: {
          profile: "default",
          scope: [],
          description: [],
          body: [],
          footer: []
        }
      }
    },
    profileUsed: {
      type: "string",
      default: "default"
    }
  };

  store = new Store({ schema });
}

const createWindowMain = () => {
  winMain = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: "#222831",
      symbolColor: "#EEEEEE",
      height: 40,
    },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  winMain.loadFile("index.html");

  winMain.on("focus", () => {
    if (winProfileToggle) {
      winProfile.focus()
    }
  })
};

const createWindowProfile = () => {
  winProfile = new BrowserWindow({
    width: 700,
    height: 500,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  winProfile.loadFile("index-profile.html");

  winProfile.on("closed", () => {
    winMain.setEnabled(true)
    winProfileToggle = false
  })
};

app.whenReady().then(() => {
  initStore();
  createWindowMain();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindowMain();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Handles the "profile:toggle" IPC event.
 * This function is used to open a profiles window.
 * 
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @returns {Promise<void>} A promise that resolves when the new profile window has been opened.
 */
ipcMain.handle("profile:toggle", (_event) => {
  if (winProfileToggle) {
    winMain.setEnabled(true)
    winMain.focus()

    winProfile.close()
    winProfileToggle = false
  } else {
    winMain.setEnabled(false)

    createWindowProfile()
    winProfileToggle = true
  }
})

/**
 * Handles the "secureApi:sanitizeInput" IPC event.
 * This function is used to remove unsafe (and potentially malicious) content from untrusted raw HTML strings.
 * 
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {string} input - value dari text yang akan di sainitize.
 * @returns {Promise<void>} A promise of string that resolves when the new profile window has been opened.
 */
ipcMain.handle("secureApi:sanitizeInput", (_event, input) => {
  return sanitizeHtml(input)
})

/**
 * Handles the "store:getProfiles" IPC event.
 * This function is used to retrieve profiles from the store.
 * 
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @returns {Promise<Object>} A promise that resolves with the profiles data as a JSON object.
 */
ipcMain.handle("store:getProfiles", (_event) => {
  return store.get("profiles")
})

/**
 * Handles the "store:getProfileUsed" IPC event.
 * This function is used to get the currently used profile ID from the store.
 * 
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @returns {Promise<string>} A promise that resolves with the ID of the currently used profile.
 */
ipcMain.handle("store:getProfileUsed", (_event) => {
  return store.get("profileUsed")
})

/**
 * Handles the "store:addProfile" IPC event.
 * This function is used to add a new profile to the store.
 * 
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {string} profileName - The name to be used for the new profile.
 * @returns {Promise<void>} A promise that resolves when the new profile has been added.
 */
ipcMain.handle("store:addProfile", (_event, profileName) => {
  try {
    const profiles = store.get("profiles");
    const id = uuidv4()
    store.set("profiles", {
      ...profiles,
      [id]: {
        profile: profileName,
        scope: [],
        description: [],
        body: [],
        footer: []
      },
    })
  } catch (error) {
    console.error("store:addProfile" + error);
  }
})

/**
 * Handles the "store:deleteProfile" IPC event.
 * This function is used to delete a profile in the store.
 * 
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {string} profileId - The ID of the profile to be deleted
 * @returns {Promise<void>} A promise that resolves when the profile has been deleted.
 */
ipcMain.handle("store:deleteProfile", (_event, profileId) => {
  try {
    let profiles = store.get("profiles");
    delete profiles[profileId]
    store.set("profiles", { ...profiles })
  } catch (error) {
    console.error("store:deleteProfile" + error);
  }
})

/**
 * Handles the "store:renameProfile" IPC event.
 * This function is used to rename a profile in the store.
 *
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {{id: string, newName: string}} json - An object containing the profile ID and the new name.
 * @param {string} json.id - The ID of the profile to be renamed.
 * @param {string} json.newName - The new name for the profile.
 * @returns {Promise<void>} A promise that resolves when the profile has been renamed.
 */
ipcMain.handle("store:renameProfile", (_event, json) => {
  try {
    const id = json["id"]
    const newName = json["newName"]

    const profileUsed = store.get("profileUsed");

    const profiles = store.get("profiles");
    store.set("profiles", {
      ...profiles,
      [id]: {
        ...profiles[id],
        profile: newName,
      },
    })


    if (id === profileUsed) {
      winMain.reload()
    }
  } catch (error) {
    console.error("store:renameProfile" + error);
  }
})

/**
 * Handles the "store:applyProfile" IPC event.
 * This function is used to apply a profile.
 * 
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {string} profileId - The ID of the profile to be applied.
 * @returns {Promise<void>} A promise that resolves when the profile has been applied.
 */
ipcMain.handle("store:applyProfile", (_event, profileId) => {
  try {
    store.set("profileUsed", profileId)
    winMain.reload()
  } catch (error) {
    console.error("store:applyProfile" + error);
  }
})

/**
 * Handles the "store:saveContent" IPC event.
 * This function is used to save content by scope in the applied profile.
 *
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {Object} json - An object containing the profile content details.
 * @param {string} json.id - The ID of the profile where content will be saved.
 * @param {string} json.scope - The scope for the profile content.
 * @param {string} json.description - The description for the profile content.
 * @param {string} json.body - The body for the profile content.
 * @param {string} json.footer - The footer for the profile content.
 * @returns {Promise<void>} A promise that resolves when the profile content has been saved.
 */
ipcMain.handle("store:saveContent", (_event, json) => {
  try {
    const id = json["id"];
    const scope = json["scope"];
    const description = json["description"];
    const body = json["body"];
    const footer = json["footer"];

    const profiles = store.get("profiles");
    const local = profiles[id];

    store.set("profiles", {
      ...profiles,
      [id]: {
        ...local,
        scope: !!scope.length ? [...(new Set([...local.scope, scope]))] : local.scope,
        description: !!description.length ? [...(new Set([...local.description, description]))] : local.description,
        body: !!body.length ? [...(new Set([...local.body, body]))] : local.body,
        footer: !!footer.length ? [...(new Set([...local.footer, footer]))] : local.footer,
      },
    })
  } catch (error) {
    console.error("store:saveContent" + error);
  }
})

/**
 * Handles the "store:getContent" IPC event.
 * This function is used to get content from a profile.
 *
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {Object} json - An object containing the profile ID and the content key.
 * @param {string} json.id - The ID of the profile to get content from.
 * @param {('scope'|'description'|'body'|'footer')} json.key - The key used to select which content will be retrieved.
 * @returns {Promise<Array>} A promise that resolves with the profile's content data for the specified key.
 */
ipcMain.handle("store:getContent", (_event, json) => {
  try {
    const id = json["id"];
    const key = json["key"];

    const profiles = store.get("profiles");
    const local = profiles[id];

    return local[key]
  } catch (error) {
    console.error("store:getContent" + error);
    return [];
  }
})

/**
 * Handles the "store:deleteContent" IPC event.
 * This function is used to delete content from a profile.
 *
 * @param {Electron.IpcMainInvokeEvent} _event - The IPC event object (unused in this function).
 * @param {Object} json - An object containing the profile ID, the content key, and the content to delete.
 * @param {string} json.id - The ID of the profile to delete content from.
 * @param {('scope'|'description'|'body'|'footer')} json.key - The key used to select which content will be deleted.
 * @param {string} json.content - The specific content to be deleted from the store.
 * @returns {Promise<void>} A promise that resolves when the profile content has been deleted.
 */
ipcMain.handle("store:deleteContent", (_event, json) => {
  try {
    const id = json["id"];
    const key = json["key"];
    const content = json["content"];

    const profileUsed = store.get("profileUsed");

    const profiles = store.get("profiles");
    const local = profiles[id];

    store.set("profiles", {
      ...profiles,
      [id]: {
        ...local,
        [key]: local[key].filter(e => e !== content)
      },
    })

    if (id === profileUsed) {
      winMain.reload()
    }
  } catch (error) {
    console.error("store:deleteContent" + error);
  }
})