const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron/main");
const path = require("node:path");

let bluetoothPinCallback;
let selectBluetoothCallback;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.webContents.on("select-bluetooth-device", (event, devices, callback) => {
    event.preventDefault();

    selectBluetoothCallback = callback;

    const result = devices.find((device) => {
      return device.deviceName === "LE-Headset";
    });

    if (result) {
      callback(result.deviceId);
    } else {
      // The device wasn't found so we need to either wait longer (eg until the device is turned on)
      // or until the user cancels the request
    }
  });

  ipcMain.on("cancel-bluetooth-request", (event) => {
    selectBluetoothCallback("");
  });

  // Listen for a message from the renderer to get the response for the Bluetooth pairing
  ipcMain.on("bluetooth-pairing-response", (event, response) => {
    bluetoothPinCallback(response);
  });

  win.webContents.session.setBluetoothPairingHandler((details, callback) => {
    bluetoothPinCallback = callback;

    // Send a message to the renderer to prompt the user to confirm the pairing
    win.webContents.send("bluetooth-pairing-request", details);
  });

  win.webContents.session.on(
    "select-hid-device",
    (event, details, callback) => {
      // Add events to handle devices being added or removed before the callback on
      // `select-hid-device` is called.
      win.webContents.session.on("hid-device-added", (event, device) => {
        console.log("hid-device-added FIRED WITH", device);
        // Optionally update details.deviceList
      });

      win.webContents.session.on("hid-device-removed", (event, device) => {
        console.log("hid-device-removed FIRED WITH", device);
        // Optionally update details.deviceList
      });

      event.preventDefault();
      if (details.deviceList && details.deviceList.length > 0) {
        callback(details.deviceList[0].deviceId);
      }
    },
  );

  win.webContents.session.setPermissionCheckHandler(
    (webContents, permission, requestingOrigin, details) => {
      if (permission === "hid" && details.securityOrigin === "file:///") {
        return true;
      }
    },
  );

  win.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "hid" && details.origin === "file:///") {
      return true;
    }
  });

  win.loadFile("index.html");
};

ipcMain.handle("dark-mode:toggle", () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = "light";
  } else {
    nativeTheme.themeSource = "dark";
  }
  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle("dark-mode:system", () => {
  nativeTheme.themeSource = "system";
});

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
