import { contextBridge } from 'electron';
import WebSocket from 'ws';

const WS_URL = 'ws://192.168.1.60:5001';

let ws;
const listeners = new Set();

function connectWS() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('[BeaverPhone] Connected to Termux WebSocket');
  });

  ws.on('close', () => {
    console.log('[BeaverPhone] Disconnected, retrying in 5s');
    setTimeout(connectWS, 5000);
  });

  ws.on('error', (error) => {
    console.error('[BeaverPhone] WebSocket error', error.message);
  });

  ws.on('message', (message) => {
    for (const handler of listeners) {
      handler(message.toString());
    }
  });
}

connectWS();

function sendDialTone(number) {
  const payload = JSON.stringify({ type: 'dial', number });
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
    console.log('[BeaverPhone] Sent', payload);
  } else {
    console.warn('[BeaverPhone] WebSocket not ready');
  }
}

contextBridge.exposeInMainWorld('beaverphone', {
  sendDialTone,
  onMessage(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('beaverphone:dialpad', (event) => {
    const { number } = event.detail;
    sendDialTone(number);
  });
});
