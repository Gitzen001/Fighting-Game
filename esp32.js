// ==================== SACHIN CODE: HARDWARE CONTROLLER ====================
// This file manages the persistent link between the browser and the ESP32.
// It uses auto-discovery to re-link the cable immediately after a page refresh (Ctrl+R).

let serialWriter = null;

/**
 * AUTO-LINK LOGIC:
 * Runs immediately to check if we already have permission for a port.
 * This is what prevents the connection from "breaking" for the user on refresh.
 */
async function autoConnect() {
  try {
    // Check if browser already has authorized ports
    const ports = await navigator.serial.getPorts();
    if (ports.length > 0) {
      const port = ports[0];
      // If the port is closed (happens after refresh), open it
      await port.open({ baudRate: 115200 });
      serialWriter = port.writable.getWriter();
      updateButtonUI(true);
      console.log("ESP32: Auto-reconnected after refresh.");
      // Optional: Notify hardware that we are back online
      sendToESP("MSG:RECONNECTED");
    }
  } catch (e) {
    console.log("ESP32: Auto-connect ready but waiting for hardware/permission.");
  }
}

/**
 * MANUAL LINK LOGIC:
 * Only used the very first time, or if the user manually disconnects the cable.
 */
async function requestSerialConnection() {
  const btn = document.getElementById('connectBle');
  try {
    if (btn) btn.blur(); 
    
    // This triggers the browser selection popup
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    serialWriter = port.writable.getWriter();
    
    updateButtonUI(true);
    sendToESP("MSG:LINK SUCCESS");
  } catch (e) {
    console.error("Connection Failed: Ensure the Serial Monitor in Arduino IDE is closed.");
  }
}

/**
 * DATA TRANSMISSION:
 * Global function used by index.js to send game events to the OLED.
 */
async function sendToESP(data) {
  if (serialWriter) {
    try {
      const encoder = new TextEncoder();
      await serialWriter.write(encoder.encode(data + "\n"));
    } catch (e) {
      console.warn("ESP32: Connection lost.");
      serialWriter = null;
      updateButtonUI(false);
      // Attempt to recover automatically
      autoConnect();
    }
  }
}

/**
 * UI SYNC:
 * Updates the button color and text based on connection state.
 */
function updateButtonUI(isConnected) {
  const btn = document.getElementById('connectBle');
  if (!btn) return;
  
  if (isConnected) {
    btn.innerText = "CABLE LINKED";
    btn.classList.add('connected');
    btn.style.opacity = "0.8"; // Visual cue it's locked in
  } else {
    btn.innerText = "LINK DATA CABLE";
    btn.classList.remove('connected');
    btn.style.opacity = "1";
  }
}

// 1. Listen for the manual click
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('connectBle');
  if (btn) btn.onclick = requestSerialConnection;
});

// 2. Run autoConnect immediately on script load (before DOM if possible)
autoConnect();