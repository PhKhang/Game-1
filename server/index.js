const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");

const {
  playerData: mockPlayerData,
  questions: mockQuestions,
} = require("./mock");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Serve a simple HTML page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const mockCredentials = {
  // Server only, do NOT send to client
  players: [
    { id: 1, username: "A", password: "123" },
    { id: 2, username: "B", password: "456" },
    { id: 3, username: "C", password: "789" },
    { id: 4, username: "D", password: "abc" },
  ],
  host: { password: "asdf" },
  // stage: { password: "hjkl" },
};

// Rooms for players, host, and stage
let rooms = {
  playerRoom: [],
  hostRoom: [],
  stageRoom: [],
};

let questions = [];

const upload = multer({ storage: multer.memoryStorage() });

// HTTP logic
app.post("/upload", upload.single("file"), (req, res) => {
  questions = [];
  try {
    // Access the file buffer
    const buffer = req.file.buffer;

    // Read the workbook from buffer
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Assume first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    // `data` is an array of objects, one per row
    let Round = 2;
    let rowIndex = 0;
    while (Round--) {
      let questionObj = [];
      let questionsPerRound = 2;
      while(questionsPerRound--){
        let tmp = {};
        console.log(rowIndex);
        let row = data[rowIndex++];
        if (row["type"] === "multiple-choice") {
          tmp = {
            id: row["id"],
            type: row["type"],
            content: row["question"],
            time: row["time"],
            options: [
              row["option1"],
              row["option2"],
              row["option3"],
              row["option4"],
            ],
            answer: row["answer"],
            hints: [row["hint1"], row["hint2"], row["hint3"], row["hint4"]],
          };
        } else if (row["type"] === "short-phrase") {
          tmp = {
            id: row["id"],
            type: row["type"],
            content: row["question"],
            time: row["time"],
            answer: row["answer"],
            hints: [row["hint1"], row["hint2"], row["hint3"], row["hint4"]],
          };
        }
        questionObj.push(tmp);
      }
      questions.push(questionObj);
    }

    res.json({ success: true, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to process file" });
  }
});

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("WebSocket connection opened");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    let response = null;
    // console.log("Received:", data);
    switch (data.type) {
      case "validation": {
        response = { type: "validation-response" };
        switch (data.loginRole) {
          case "player": {
            let player = mockCredentials.players.find(
              (p) => p.password === data.password
            );
            if (player) {
              response.username = player.username;
              response.status = "success";
              ws.id = player.id;
              rooms.playerRoom.push(ws); // Join player room
              player.isConnected = true;
              if (rooms.hostRoom[0])
                rooms.hostRoom[0].send(
                  JSON.stringify({ type: "connect-player", playerId: ws.id })
                );
              console.log(`Player id ${player.id} joined the player room`);
            } else {
              response.status = "invalid password";
            }
            break;
          }
          case "host": {
            if (mockCredentials.host.password === data.password) {
              response.status = "success";
              response.players = mockPlayerData; // Players' usernames, scores and passwords
              // response.questions = mockQuestions; // Questions' type, content, time, answer and hints
              response.questions = questions; // Questions' type, content, time, answer and hints
              ws.id = 1000; // Host id
              rooms.hostRoom.push(ws); // Join host room
              console.log("Host joined the host room");
            } else {
              response.status = "invalid password";
            }
            break;
          }
          case "stage": {
            if (mockCredentials.host.password === data.password) {
              response.status = "success";
              ws.id = 1001; // Stage id
              rooms.stageRoom.push(ws); // Join stage room
              console.log("Stage joined the stage room");
            } else {
              response.status = "invalid password";
            }
            break;
          }
          default:
            response.status = "role not found";
            break;
        }
        break;
      }
      case "start-game": {
        response = { type: "game-started" };
        break;
      }
    }
    ws.send(JSON.stringify(response));
  });

  ws.on("close", (code, reason) => {
    console.log("WebSocket connection closed");

    // Remove the disconnected client from all rooms
    if (rooms) {
      if (rooms.playerRoom.includes(ws)) {
        rooms.playerRoom = rooms.playerRoom.filter((client) => client !== ws);
        let player = mockPlayerData.find((p) => p.id === ws.id);
        player.isConnected = false;
        if (rooms.hostRoom[0])
          rooms.hostRoom[0].send(
            JSON.stringify({ type: "disconnect-player", playerId: ws.id })
          );
        console.log(`Player id ${ws.id} left player room`);
      }
      if (rooms.hostRoom.includes(ws)) {
        rooms.hostRoom = rooms.hostRoom.filter((client) => client !== ws);
        console.log("Host left host room");
      }
      if (rooms.stageRoom.includes(ws)) {
        rooms.stageRoom = rooms.stageRoom.filter((client) => client !== ws);
        console.log("Stage left stage room");
      }
    }
  });
});

// Start server
server.listen(3000, () => {
  console.log(`HTTP and WebSocket server running on http://localhost:${PORT}`);
});
