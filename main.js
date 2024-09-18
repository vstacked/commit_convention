const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");
const sanitizeHtml = require("sanitize-html")

let winMain, winProfile, winProfileToggle;

const createWindowMain = () => {
  winMain = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
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

ipcMain.handle("profile:toggle", () => {
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

ipcMain.handle("secureApi:sanitizeInput", (_event, input) => {
  return sanitizeHtml(input)
})