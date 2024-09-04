const information = document.getElementById("info");
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

const func = async () => {
  const response = await window.versions.ping();
  console.log(response); // prints out 'pong'
};

func();

document
  .getElementById("toggle-dark-mode")
  .addEventListener("click", async () => {
    const isDarkMode = await window.darkMode.toggle();
    document.getElementById("theme-source").innerHTML = isDarkMode
      ? "Dark"
      : "Light";
  });

document
  .getElementById("reset-to-system")
  .addEventListener("click", async () => {
    await window.darkMode.system();
    document.getElementById("theme-source").innerHTML = "System";
  });

async function testIt() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
    });

    document.getElementById("device-name").innerHTML =
      device.name || `ID: ${device.id}`;
  } catch (e) {
    console.log("bluetooth-error: ", e);
  }
}

document.getElementById("clickme").addEventListener("click", testIt);

function cancelRequest() {
  window.deviceAccess.cancelBluetoothRequest();
}

document.getElementById("cancel-bluetooth").addEventListener("click", cancelRequest);

window.deviceAccess.bluetoothPairingRequest((event, details) => {
  const response = {};

  switch (details.pairingKind) {
    case "confirm":
      response.confirmed = window.confirm(
        `Do you want to connect to device ${details.deviceId}?`,
      );
      break;
    case "confirmPin":
      response.confirmed = window.confirm(
        `Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`,
      );
      break;
    case "providePin":
      const pin = window.prompt(
        `Please provide a pin for ${details.deviceId}.`,
      );
      if (pin) {
        response.pin = pin;
        response.confirmed = true;
      } else {
        response.confirmed = false;
      }
      break;
  }

  window.deviceAccess.bluetoothPairingResponse(response);
});
