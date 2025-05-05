const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");

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
  stage: { password: "hjkl" },
};

function loginValidation(role, password) {
  let isValid = false;
  switch (role) {
    case "player":
      isValid = mockCredentials.players.some((p) => p.password === password);
      break;
    case "host":
      isValid = mockCredentials.host.password === password;
      break;
    case "stage":
      isValid = mockCredentials.stage.password === password;
      break;
    default:
      isValid = false;
  }
  return isValid;
}

// Rooms for players, host, and stage
let rooms = {
  playerRoom: [],
  hostRoom: [],
  stageRoom: [],
};

let questions = [];
let imagePaths = [];

// Game session storage - persists even if players disconnect
let gameState;

function createGameSession() {
  gameState = {
    roomId: 12345,
    isActive: true,
    roundIndex: 0,
    questionIndex: 0,
    score: 10,
    playerStates: {}, // Will store player state by ID
    roundScores: [], // Array of score objects by round
  };

  mockPlayerData.forEach((player) => {
    gameState.playerStates[player.id] = {
      id: player.id,
      username: player.username,
      isConnected: false,
      totalScore: 0,
      roundScores: [],
      lastSeen: null,
      currentSocket: null,
    };
  });
}

function updatePlayerScore(playerId, roundIndex, score) {
  if (!gameState.playerStates[playerId].totalScore) {
    gameState.playerStates[playerId].totalScore = 0;
  }
  gameState.playerStates[playerId].totalScore += score;
  gameState.playerStates[playerId].roundScores[roundIndex] =
    gameState.playerStates[playerId].totalScore;

  gameState.roundScores[roundIndex][playerId] =
    gameState.playerStates[playerId].roundScores[roundIndex];

  return gameState.playerStates[playerId].roundScores[roundIndex];
}

function getRoundResults(roundIndex) {
  return gameState.roundScores[roundIndex];
}

function isCorrect(answer) {
  let answerLowerCase = answer.toLowerCase();
  let question = questions[gameState.roundIndex][gameState.questionIndex];
  let correctAnswer = question.answer.toLowerCase();
  return answerLowerCase === correctAnswer;
}

const upload = multer({ storage: multer.memoryStorage() });

//TODO: add a simple html page to upload problems (xlsx) and images (png,jpg,svg,...)

// HTTP logic
app.post("/upload", upload.single("file"), (req, res) => {
  questions = [];
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // `data` is an array of objects, one per row
    let Round = 2;
    let rowIndex = 0;

    while (Round--) {
      let questionObj = [];
      let questionsPerRound = 2;

      while (questionsPerRound--) {
        let tmp = {};
        let row = data[rowIndex++];
        let imagePath = null;

        console.log(data.media);
        if (row["image"]) {
          const base64String = row["image"];
          const matches = base64String.match(
            /^data:image\/(png|jpeg);base64,(.+)$/
          );

          if (matches) {
            const ext = matches[1];
            const base64Data = matches[2];
            const imageFileName = `question_${row["id"]}.${ext}`;
            const imageFullPath = path.join(uploadsDir, imageFileName);
            fs.writeFileSync(imageFullPath, base64Data, "base64");
            imagePath = `/uploads/${imageFileName}`; // Public path
            imagePaths.push(imagePath); // Store the path for later use
          }
        }

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

    res.json({ success: true, questions, imagePaths });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to process file" });
  }
});

app.use("/public", express.static(path.join(__dirname, "public"))); // Serve static images in public directory

// WebSocket logic
wss.on("connection", (ws) => {
  console.log("WebSocket connection opened");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    let response = null;
    // console.log("Received:", data);
    switch (data.type) {
      case "login": {
        response = { type: "login-response" };

        if (loginValidation(data.loginRole, data.password) === false) {
          response.status = "invalid password";
          if (!data.loginRole) console.log("login failed");
          else console.log(data.loginRole + " login failed");
          ws.send(JSON.stringify(response));
          return;
        }

        // Handle valid connections
        switch (data.loginRole) {
          case "player": {
            let playerCred = mockCredentials.players.find(
              (p) => p.password === data.password
            );
            let player = mockPlayerData.find((p) => p.id === playerCred.id);
            response.username = player.username;

            const isReconnection =
              //TODO: Beware if the player connects first => Can crash server
              gameState.playerStates[player.id].isConnected === false &&
              gameState.playerStates[player.id].lastSeen !== null;

            gameState.playerStates[player.id].isConnected = true;
            gameState.playerStates[player.id].lastSeen = Date.now();
            gameState.playerStates[player.id].currentSocket = ws;

            response.status = "success";
            ws.id = player.id;
            rooms.playerRoom.push(ws); // Join player room

            player.isConnected = true;

            if (rooms.hostRoom[0])
              rooms.hostRoom[0].send(
                JSON.stringify({
                  type: isReconnection ? "reconnect-player" : "connect-player",
                  playerId: ws.id,
                  playerState: gameState.playerStates[player.id],
                })
              );
            console.log(
              `Player id ${ws.id} ${
                isReconnection ? "re" : ""
              }joined the player room`
            );

            break;
          }
          case "host": {
            createGameSession();
            response.status = "success";
            response.players = mockPlayerData; // Players' usernames, scores and passwords
            response.credentials = mockCredentials.players; // Player's passwords
            // response.questions = mockQuestions; // Questions' type, content, time, answer and hints
            response.questions = questions; // Questions' type, content, time, answer and hints
            ws.id = 1000; // Host id
            rooms.hostRoom.push(ws); // Join host room
            console.log("Login success. Host joined the host room");
            break;
          }
          case "stage": {
            response.status = "success";
            ws.id = 1001; // Stage id
            rooms.stageRoom.push(ws); // Join stage room
            console.log("Login success. Stage joined the stage room");
            break;
          }
          default:
            response.status = "role not found";
            break;
        }
        // Send response to the client
        ws.send(JSON.stringify(response));
        break;
      }
      case "host-start-question": {
        // Start new round
        if (gameState.roundIndex !== data.roundIndex) {
          gameState.roundIndex = data.roundIndex;
          gameState.roundScores[data.roundIndex] = [
            ...Array(mockPlayerData.length).fill(0),
          ];
          gameState.playerStates.forEach((player) => {
            player.roundScores[data.roundIndex] = 0;
          });
        }
        gameState.questionIndex = data.questionIndex;

        // Send question to players
        rooms.playerRoom.forEach((socket) => {
          socket.send(
            JSON.stringify({
              type: "start-question",
              roundIndex: data.roundIndex,
              questionIndex: data.questionIndex,
              question: mockQuestions[data.roundIndex][data.questionIndex],
            })
          );
        });
        break;
      }
      case "host-hint": {
        // Send hint to players
        rooms.playerRoom.forEach((socket) => {
          socket.send(JSON.stringify({ type: "hint", hint: data.hint }));
        });
        break;
      }
      case "submit-answer": {
        // Update score for each player at a time
        const { playerId, answer } = data;

        if (gameState.playerStates[playerId]) {
          // Update the player's score for this round
          let newScore = 0;
          if (isCorrect(answer))
            newScore = updatePlayerScore(
              playerId,
              gameState.roundIndex,
              gameState.score
            );
          else newScore = updatePlayerScore(playerId, gameState.roundIndex, 0);

          response = {
            type: "score-updated",
            playerId: playerId,
            roundIndex: roundIndex,
            roundScore: newScore,
          };

          // Send score update to the player
          socket.send(JSON.stringify(response));

          // Send score update to host
          if (rooms.hostRoom[0]) {
            rooms.hostRoom[0].send(JSON.stringify(response));
          }

          // Send score update to stage
          if (rooms.stageRoom[0]) {
            rooms.stageRoom[0].send(JSON.stringify(response));
          }
        }
        break;
      }
      case "show-results": {
        let results = getRoundResults(data.roundIndex);
        rooms.playerRoom.forEach((socket) => {
          // Send leaderboard for each players
          socket.send(
            JSON.stringify({
              type: "results",
              results: results,
            })
          );
        });
        break;
      }
    }
  });

  ws.on("close", (code, reason) => {
    console.log("WebSocket connection closed");

    // Remove the disconnected client from all rooms
    if (rooms) {
      // Player room
      if (rooms.playerRoom.includes(ws)) {
        rooms.playerRoom = rooms.playerRoom.filter((client) => client !== ws);

        if (ws.id && gameState.playerStates[ws.id]) {
          const playerId = ws.id;
          gameState.playerStates[playerId].isConnected = false;
          gameState.playerStates[playerId].lastSeen = Date.now();
          gameState.playerStates[playerId].currentSocket = null;

          let player = mockPlayerData.find((p) => p.id === ws.id);
          if (player) player.isConnected = false;

          if (rooms.hostRoom[0])
            rooms.hostRoom[0].send(
              JSON.stringify({
                type: "disconnect-player",
                playerId: ws.id,
                playerState: gameState.playerStates[playerId],
              })
            );
          console.log(
            `Player id ${ws.id} left player room, but state is preserved`
          );
        }
      }

      // Host room
      if (rooms.hostRoom.includes(ws)) {
        rooms.hostRoom = rooms.hostRoom.filter((client) => client !== ws);
        console.log("Host left host room");
      }

      // Stage room
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
