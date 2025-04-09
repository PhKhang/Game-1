const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Serve a simple HTML page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  ws.on("message", (message) => {
    const data = message.toString();
    console.log("Received:", data);
    if (data === "play") ws.send("start");
  });

  ws.send("Welcome to WebSocket with Express!");
});

// Start server
server.listen(3000, () => {
  console.log(`HTTP and WebSocket server running on http://localhost:${PORT}`);
});

const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
