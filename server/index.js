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

const mockCredentials = {
  // Server only, do NOT send to client
  players: [
    { id: 1, username: "A", password: "123" },
    { id: 2, username: "B", password: "456" },
    { id: 3, username: "C", password: "789" },
    { id: 4, username: "D", password: "abc" },
  ],
  host: { password: "asdf" },
  stage: { password: "hjkl" },
};

const mockPlayerData = [
  // Send to client
  { id: 1, username: "A", score: 0, isConnected: false },
  { id: 2, username: "B", score: 0, isConnected: false },
  { id: 3, username: "C", score: 0, isConnected: false },
  { id: 4, username: "D", score: 0, isConnected: false },
];

const mockQuestions = [
  // Round 1
  [
    {
      id: 1,
      type: "multiple-choice",
      content:
        '<p>What is the <strong>capital</strong> of France?</p> <img src="/cc25.jpg" width=50 alt="coding-challenge" />',
      time: 20,
      options: ["London", "Berlin", "Paris", "Madrid"],
      answer: "Paris",
      hints: [
        "It's in Western Europe",
        "It's known for a famous tower",
        "It's on the Seine River",
        "It starts with 'P'",
      ],
    },
    {
      id: 2,
      type: "short-phrase",
      content:
        '<p>What is the chemical symbol for gold?</p> <img src="/cc25.jpg" width=50 alt="coding-challenge" />',
      time: 20,
      answer: "Au",
      hints: [
        "Its atomic number is 79.",
        "Used in jewelry and electronics.",
        "It's a precious yellow metal.",
        'The symbol comes from the Latin word "Aurum."',
      ],
    },
  ],
  // Round 2
  [
    {
      id: 3,
      type: "multiple-choice",
      content: "<p>Who painted the ceiling of the Sistine Chapel?</p>",
      time: 20,
      options: [
        "Leonardo da Vinci",
        "Vincent van Gogh",
        "Michelangelo",
        "Raphael",
      ],
      answer: "Michelangelo",
      hints: [
        "He was also a sculptor, not just a painter.",
        'He created the famous "David" statue.',
        "He worked during the Renaissance period.",
        "The project took about four years to complete.",
      ],
    },
    {
      id: 4,
      type: "short-phrase",
      content:
        '<p>Which planet is known as the "Red Planet"?</p> <img src="/cc25.jpg" width=50 alt="coding-challenge" />',
      time: 20,
      answer: "Mars",
      hints: [
        "It's the fourth planet from the Sun.",
        "Has the tallest volcano in the solar system.",
        "Its color is due to iron oxide (rust) on the surface.",
        "NASA has sent multiple rovers there.",
      ],
    },
  ],
];

// Rooms for players, host, and stage
let rooms = {
  playerRoom: [],
  hostRoom: [],
  stageRoom: [],
};

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("WebSocket connection opened");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("Received:", data);
    if (data.type === "login") {
      // Password validation
      let response = { type: "login-response" };
      if (data.loginRole === "player") {
        let playerCred = mockCredentials.players.find(
          (p) => p.password === data.password
        );
        if (playerCred) {
          let player = mockPlayerData.find((p) => p.id === playerCred.id);
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
            console.log(
              `Login success. Player id ${player.id} joined the player room`
            );
          } else {
            response.status = "invalid password";
            console.log("Login failed");
          }
        } else {
          response.status = "invalid password";
          console.log("Login failed");
        }
      } else if (data.loginRole === "host") {
        if (mockCredentials.host.password === data.password) {
          response.status = "success";
          response.players = mockPlayerData; // Players' usernames and scores
          response.credentials = mockCredentials; // Player's passwords
          response.questions = mockQuestions; // Questions' type, content, time, answer and hints
          ws.id = 1000; // Host id
          rooms.hostRoom.push(ws); // Join host room
          console.log("Login success. Host joined the host room");
        } else {
          response.status = "invalid password";
          console.log("Login failed");
        }
      } else if (data.loginRole === "stage") {
        if (mockCredentials.host.password === data.password) {
          response.status = "success";
          ws.id = 1001; // Stage id
          rooms.stageRoom.push(ws); // Join stage room
          console.log("Login success. Stage joined the stage room");
        } else {
          response.status = "invalid password";
          console.log("Login failed");
        }
      } else {
        response.status = "role not found";
      }
      ws.send(JSON.stringify(response));
    } else if (data.type === "host-start-question") {
      rooms.playerRoom.forEach((socket) => {
        // Send question for each players
        socket.send(
          JSON.stringify({
            type: "start-question",
            roundIndex: data.roundIndex,
            questionIndex: data.questionIndex,
            question: mockQuestions[data.roundIndex][data.questionIndex],
          })
        );
      });
    } else if (data.type === "host-hint") {
      rooms.playerRoom.forEach((socket) => {
        data.type = "hint";
        // Send hint for each players
        socket.send(JSON.stringify({ type: "hint", hint: data.hint }));
      });
    }
    // TODO data.type === host-leaderboard
    // TODO data.type === host-round-leaderboard
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
