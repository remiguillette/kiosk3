Perfect 👌 I'll prepare a basic **Electron 2-in-1 kiosk** for you:

* **Main Menu** (choose BeaverPhone local or BeaverNet.ca cloud)
* **Local BeaverPhone Page** (a minimal dialpad that sends via WebSocket → Termux)
* **BeaverNet.ca Page** (your public site)
* **preload.js** which captures dialpad events and forwards them to the local WS (`ws://192.168.1.60:5001`).

---

## 1) `main.js`

```js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() { 
const win = new BrowserWindow({ 
kiosk: true, 
webPreferences: { 
preload: path.join(__dirname, 'preload.js'), 
contextIsolation: true, 
nodeIntegration: false, 
} 
}); 

// Start on local menu 
win.loadFile('menu.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => { 
if (process.platform !== 'darwin') app.quit();
});
```

---

## 2) `menu.html`

A simple kiosk menu page with two “cards”.

```html
<!DOCTYPE html>
<html lang="en">
<head> 
<meta charset="UTF-8"> 
<title>Beaver Kiosk</title> 
<style> 
body { 
font-family: sans-serif; 
display:flex; 
justify-content: center; 
align-items: center; 
height: 100vh; 
background: #111; 
color: #fff; 
} 
.menu { 
display:grid; 
gap: 2rem; 
} 
.card { 
background: #222; 
border: 2px solid #f89422; 
border-radius: 12px; 
padding: 2rem; 
text-align: center; 
cursor: pointer; 
transition: transform 0.2s; 
} 
.card:hover { 
transform: scale(1.05); 
} 
</style>
</head>
<body> 
<div class="menu"> 
<div class="card" onclick="location.href='beaverphone.html'">📞 BeaverPhone (local)</div> 
<div class="card" onclick="location.href='https://rgbeavernet.ca'">🌐 BeaverNet.ca (cloud)</div> 
</div>
</body>
</html>
```

---

## 3) `beaverphone.html`

A basic dialpad (buttons trigger `beaverphone:dialpad` events).

```html
<!DOCTYPE html>
<html lang="en">
<head> 
<meta charset="UTF-8"> 
<title>BeaverPhone</title> 
<style> 
body { 
font-family: sans-serif; 
background: #000; 
color: #fff; 
display:flex; 
justify-content: center; 
align-items: center; 
height: 100vh; 
} 
.dialpad { 
display:grid; 
grid-template-columns: repeat(3, 80px); 
gap: 1rem; 
} 
button { 
font-size: 1.5rem; 
padding: 1rem; 
border-radius: 8px; 
border:none; 
background: #333; 
color: #fff; 
cursor: pointer; 
} 
button:hover { 
background: #f89422; 
} 
</style>
</head>
<body> 
<div class="dialpad"> 
<button onclick="dial('1')">1</button> 
<button onclick="dial('2')">2</button> 
<button onclick="dial('3')">3</button> 
<button onclick="dial('4')">4</button> 
<button onclick="dial('5')">5</button> 
<button onclick="dial('6')">6</button> 
<button onclick="dial('7')">7</button> 
<button onclick="dial('8')">8</button> 
<button onclick="dial('9')">9</button> 
<button onclick="dial('*')">*</button> 
<button onclick="dial('0')">0</button> 
<button onclick="dial('#')">#</button> 
</div> 

<script> 
function dial(num) { 
const event = new CustomEvent("beaverphone:dialpad", { 
detail: { number: num } 
}); 
window.dispatchEvent(event); 
} 
</script>
</body>
</html>
```

---

## 4) `preload.js`

It intercepts `beaverphone:dialpad` events and sends them via WebSocket to your Termux (`ws://192.168.1.60:5001`).

```js
const WebSocket = require("ws");

let ws;

function connectWS() { 
ws = new WebSocket("ws://192.168.1.60:5001"); 

ws.on("open", () => { 
console.log("[BeaverPhone] Connected to local WS Termux"); 
}); 

ws.on("close", () => { 
console.log("[BeaverPhone] WS closed, reconnect in 5s..."); 
setTimeout(connectWS, 5000); 
}); 

ws.on("error", (err) => { 
console.error("[BeaverPhone] WS Error:", err.message); 
}); 

ws.on("message", (msg) => { 
console.log("[BeaverPhone] Response:", msg.toString()); 
});
}

connectWS();

window.addEventListener("DOMContentLoaded", () => { 
window.addEventListener("beaverphone:dialpad", (event) => { 
const dialpadEvent = event.detail; 

const payload = { 
type: "dial", 
number: dialpadEvent.number, 
}; 

if (ws && ws.readyState === WebSocket.OPEN) { 
ws.send(JSON.stringify(payload)); 
console.log("[BeaverPhone] Sent:", payload); 
} else { 
console.warn("[BeaverPhone] WS not ready"); 
} 
});
});
```

---

## 🔄 Operation

1. Launch → `menu.html` (2 cards).
2. Click on **BeaverPhone** → load `beaverphone.html`.
3. Click a key → `preload.js` captures the event → sends the JSON to Termux.
4. Termux responds → ACK logged in the Electron console.
5. Click on **BeaverNet.ca** → load your normal cloud site.

---
 wscat -c ws://192.168.1.60:5001
Connected (press CTRL+C to quit)
> { "type": "dial", "number": "+1411" }
< {"type":"ack","action":"dial","number":"+1411","status":"accepted"}
