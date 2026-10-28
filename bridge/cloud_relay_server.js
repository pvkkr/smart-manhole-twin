/**
 * Smart Manhole - Free Cloud WebSocket Relay Server
 * ==================================================
 * Deploy this single file for free on Render.com, Railway.app, or Heroku.
 * It provides an automatic SSL (wss://) endpoint for both ESP32 and Vercel!
 *
 * Install:
 *   npm install ws
 * Run:
 *   node cloud_relay_server.js
 */

const { WebSocketServer, WebSocket } = require('ws');

const port = process.env.PORT || 8080;
const wss = new WebSocketServer({ port });

console.log(`[Smart Manhole Relay] Server listening on port ${port}`);

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[Relay] New client connected from ${ip}`);

  ws.on('message', (data) => {
    // Broadcast received telemetry frame to all other connected clients (Vercel web apps)
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('[Relay] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[Relay Error]', err);
  });
});
