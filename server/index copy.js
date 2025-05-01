// const express = require("express");
// const http = require("http");
// const WebSocket = require("ws");
// const multer = require("multer");
// const {
//   playerData: mockPlayerData,
//   questions: mockQuestions,
// } = require("./mock");

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// const PORT = 3000;

// let questions = [];

// // Serve a simple HTML page
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

// const mockCredentials = {
//   // Server only, do NOT send to client
//   players: [
//     { id: 1, username: "A", password: "123" },
//     { id: 2, username: "B", password: "456" },
//     { id: 3, username: "C", password: "789" },
//     { id: 4, username: "D", password: "abc" },
//   ],
//   host: { password: "asdf" },
//   // stage: { password: "hjkl" },
// };

// // Rooms for players, host, and stage
// let rooms = {
//   playerRoom: [],
//   hostRoom: [],
//   stageRoom: [],
// };

// function checkConnectionStatus() {

//   let disconnectedPlayers = [];

//   // Check player connections
//   rooms.playerRoom.forEach((client) => {
//     if (client.readyState === WebSocket.CLOSED) {
//       disconnectedPlayers.push(client.id);
//       client.isConnected = false;
//       rooms.playerRoom = rooms.playerRoom.filter((c) => c !== client);
//       console.log(`Player id ${client.id} disconnected`);
//     }
//   }); 

//   return connectionStatus;
// }

// // 

// app.post("/upload", (req, res, next) => {
//   const upload = multer({ dest: "uploads/" }).single("file");

//   const file = req.file;
//   if (!file) {
//     const error = new Error("Please upload a file");
//     error.httpStatusCode = 400
//     return next(error)
//   }
//   res.send(file);

// });

// // Check connection status every 5 seconds
// const CONNECTION_CHECK_INTERVAL = 2000; // 5 seconds
// setInterval(() => {
//   checkConnectionStatus();
// }, CONNECTION_CHECK_INTERVAL);

// // WebSocket logic
// wss.on("connection", (ws) => {
//   console.log("WebSocket connection opened");

//   ws.on("message", (message) => {
//     const data = JSON.parse(message);
//     let response = null;
//     // console.log("Received:", data);
//     switch (data.type) {
//       case "validation": {
//         response = { type: "validation-response" };
//         switch (data.loginRole) {
//           case "player": {
//             let player = mockCredentials.players.find(
//               (p) => p.password === data.password
//             );
//             if (player) {
//               response.username = player.username;
//               response.status = "success";
//               ws.id = player.id;
//               rooms.playerRoom.push(ws); // Join player room
//               player.isConnected = true;
//               if (rooms.hostRoom[0])
//                 rooms.hostRoom[0].send(
//                   JSON.stringify({ type: "connect-player", playerId: ws.id })
//                 );
//               console.log(`Player id ${player.id} joined the player room`);
//             } else {
//               response.status = "invalid password";
//             }
//             break;
//           }
//           case "host": {
//             if (mockCredentials.host.password === data.password) {
//               response.status = "success";
//               response.players = mockPlayerData; // Players' usernames, scores and passwords
//               response.questions = mockQuestions; // Questions' type, content, time, answer and hints
//               ws.id = 1000; // Host id
//               rooms.hostRoom.push(ws); // Join host room
//               console.log("Host joined the host room");
//             } else {
//               response.status = "invalid password";
//             }
//             break;
//           }
//           case "stage": {
//             if (mockCredentials.host.password === data.password) {
//               response.status = "success";
//               ws.id = 1001; // Stage id
//               rooms.stageRoom.push(ws); // Join stage room
//               console.log("Stage joined the stage room");
//             } else {
//               response.status = "invalid password";
//             }
//             break;
//           }
//           default:
//             response.status = "role not found";
//             break;
//         }
//         break;
//       }
//       case "start-game": {
//         response = { type: "game-started" };
//         break;
//       }
//     }
//     ws.send(JSON.stringify(response));
//   });

//   ws.on("close", (code, reason) => {
//     console.log("WebSocket connection closed");

//     // Remove the disconnected client from all rooms
//     if (rooms) {
//       if (rooms.playerRoom.includes(ws)) {
//         rooms.playerRoom = rooms.playerRoom.filter((client) => client !== ws);
//         let player = mockPlayerData.find((p) => p.id === ws.id);
//         player.isConnected = false;
//         if (rooms.hostRoom[0])
//           rooms.hostRoom[0].send(
//             JSON.stringify({ type: "disconnect-player", playerId: ws.id })
//           );
//         console.log(`Player id ${ws.id} left player room`);
//       }
//       if (rooms.hostRoom.includes(ws)) {
//         rooms.hostRoom = rooms.hostRoom.filter((client) => client !== ws);
//         console.log("Host left host room");
//       }
//       if (rooms.stageRoom.includes(ws)) {
//         rooms.stageRoom = rooms.stageRoom.filter((client) => client !== ws);
//         console.log("Stage left stage room");
//       }
//     }
//   });
// });

// // Start server
// server.listen(3000, () => {
//   console.log(`HTTP and WebSocket server running on http://localhost:${PORT}`);
// });

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 3000;

// Serve static files (including uploaded images and HTML)
app.use(express.static('public'));

// Set up multer to store images in `public/uploads`
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// WebSocket server
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Handle image upload via HTTP POST
app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = `/uploads/${req.file.filename}`;

  // Generate a static HTML file that displays the image
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Uploaded Image</title></head>
    <body>
      <h1>Image Preview</h1>
      <img src="${imagePath}" alt="Uploaded Image" style="max-width: 100%;">
    </body>
    </html>
  `;

  const htmlFileName = `image-${Date.now()}.html`;
  const htmlFilePath = `public/${htmlFileName}`;

  fs.writeFileSync(htmlFilePath, htmlContent);

  // Notify WebSocket clients (optional)
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'new_image', url: imagePath }));
    }
  }

  // Send back the URL of the HTML page
  res.json({ htmlUrl: `/${htmlFileName}` });
});

// Upgrade to WebSocket if needed
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});
