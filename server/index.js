const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");

const {
  playerData: playerData,
  questions: mockQuestions,
  credentials: credentials,
} = require("./mock");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Serve a simple HTML page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

function loginValidation(role, password) {
  let isValid = false;
  switch (role) {
    case "player":
      isValid = credentials.players.some((p) => p.password === password);
      break;
    case "host":
      isValid = credentials.host.password === password;
      break;
    case "stage":
      isValid = credentials.stage.password === password;
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
    players: [], // Will store player state by ID
  };

  playerData.forEach((player) => {
    gameState.players.push({
      id: player.id,
      username: player.username,
      password: player.password,
      isConnected: false,
      score: 0,
      scores: [],
      lastSeen: null,
      currentSocket: null,
    });
    gameState.players[player.id].scores.push(
      ...Array(questions.length).fill([])
    );
    questions.forEach((round, roundIndex) => {
      gameState.players[player.id].scores[roundIndex].push(
        ...Array(round.length).fill([])
      );
      round.forEach((question, questionIndex) => {
        gameState.players[player.id].scores[roundIndex][questionIndex] = 0;
      });
    });
  });
}

function debug() {
  console.dir(gameState, { depth: 3 });
}

function resetGameSession() {
  gameState.roundIndex = 0;
  gameState.questionIndex = 0;

  playerData.forEach((player) => {
    gameState.players[player.id].score = 0;
    gameState.players[player.id].scores = [];

    gameState.players[player.id].scores.push(
      ...Array(questions.length).fill([])
    );
    questions.forEach((round, roundIndex) => {
      gameState.players[player.id].scores[roundIndex].push(
        ...Array(round.length).fill([])
      );
      round.forEach((question, questionIndex) => {
        gameState.players[player.id].scores[roundIndex][questionIndex] = 0;
      });
    });
  });
}

function removeGameSession() {
  gameState = {
    roomId: null,
    isActive: false,
    roundIndex: 0,
    questionIndex: 0,
    score: 10,
    players: {},
    scores: [],
  };
}

function updatePlayerScore(playerId, roundIndex, questionIndex, score) {
  if (!gameState.players[playerId].score) {
    gameState.players[playerId].score = 0;
  }
  gameState.players[playerId].score += score;
  // console.dir(gameState.players[playerId].scores);
  gameState.players[playerId].scores[roundIndex][questionIndex] =
    gameState.players[playerId].score;

  return gameState.players[playerId].score;
}

function getRoundResults(roundIndex) {
  const scoreScheme = [
    { id: 0, username: "A", score: 0 },
    { id: 1, username: "B", score: 0 },
    { id: 2, username: "C", score: 0 },
    { id: 3, username: "D", score: 0 },
  ];

  scoreScheme.forEach((player) => {
    player.score =
      gameState.players[player.id].scores[roundIndex][gameState.questionIndex];
  });

  return scoreScheme;
}

function getQuestionResults(roundIndex, questionIndex) {
  const scoreScheme = [
    { id: 0, username: "A", score: 0 },
    { id: 1, username: "B", score: 0 },
    { id: 2, username: "C", score: 0 },
    { id: 3, username: "D", score: 0 },
  ];

  scoreScheme.forEach((player) => {
    player.score =
      gameState.players[player.id].scores[roundIndex][questionIndex];
  });

  return scoreScheme;
}

function isCorrect(answer) {
  let answerLowerCase = answer.toLowerCase();
  let question = questions[gameState.roundIndex][gameState.questionIndex];
  let correctAnswer = question.answer.toLowerCase();
  return answerLowerCase === correctAnswer;
}

const upload = multer({ storage: multer.memoryStorage() });

app.get("/upload", (req, res) => {
  res.sendFile(__dirname + "/upload.html");
});

// HTTP logic
app.post("/upload", upload.single("file"), (req, res) => {
  questions = [];
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // `data` is an array of objects, one per row
    let Round = 2;
    let rowIndex = 0;

    while (Round--) {
      let questionObj = [];
      let questionsPerRound = 2;

      while (questionsPerRound--) {
        let row = data[rowIndex++];

        questionObj.push({
          id: row["id"],
          type: row["type"],
          content: row["question"],
          time: row["time"],
          answer: row["answer"],
          hints: [row["hint1"], row["hint2"], row["hint3"], row["hint4"]],
        });
      }
      questions.push(questionObj);
    }
    resetGameSession();
    res.json({ success: true, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to process file" });
  }
});

app.post("/upload-image", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const validExtensions = [".png", ".jpg", ".jpeg", ".svg"];

    if (!validExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid file type. Only PNG, JPG, JPEG, and SVG files are allowed.",
      });
    }

    const fileName = req.file.originalname;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    const imagePath = `/uploads/${fileName}`;
    imagePaths.push(imagePath);

    res.json({
      success: true,
      path: imagePath,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to process image" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
            if (!rooms.hostRoom[0]) {
              response = {
                type: "error",
                error: "Host has not joined the room yet!",
              };
              ws.send(JSON.stringify(response));
              return;
            }

            let playerCred = credentials.players.find(
              (p) => p.password === data.password
            );
            let player = playerData.find((p) => p.id === playerCred.id);
            response.username = player.username;
            response.playerId = player.id;

            const isReconnection =
              gameState.players[player.id].isConnected === false &&
              gameState.players[player.id].lastSeen !== null;

            gameState.players[player.id].isConnected = true;
            gameState.players[player.id].lastSeen = Date.now();
            gameState.players[player.id].currentSocket = ws;

            response.status = "success";
            ws.id = player.id;
            rooms.playerRoom.push(ws); // Join player room

            player.isConnected = true;

            if (rooms.hostRoom[0])
              rooms.hostRoom[0].send(
                JSON.stringify({
                  type: isReconnection ? "reconnect-player" : "connect-player",
                  playerId: ws.id,
                  playerState: gameState.players[player.id],
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
            // questions = mockQuestions;
            createGameSession();
            response.status = "success";
            console.log(gameState.players[0].scores);
            response.players = gameState.players; // Players' usernames, scores and passwords
            // response.players = playerData; // Players' usernames, scores and passwords
            response.credentials = credentials.players; // Player's passwords
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
        gameState.roundIndex = data.roundIndex;
        gameState.questionIndex = data.questionIndex;

        // Send question to players
        rooms.playerRoom.forEach((player) => {
          player.send(
            JSON.stringify({
              type: "start-question",
              roundIndex: data.roundIndex,
              questionIndex: data.questionIndex,
              question: questions[data.roundIndex][data.questionIndex],
            })
          );
        });
        rooms.stageRoom[0].send(
          JSON.stringify({
            type: "start-question",
            roundIndex: data.roundIndex,
            questionIndex: data.questionIndex,
            question: questions[data.roundIndex][data.questionIndex],
          })
        );
        break;
      }
      case "host-hint": {
        // Send hint to players
        rooms.playerRoom.forEach((socket) => {
          socket.send(JSON.stringify({ type: "hint", hint: data.hint }));
        });
        rooms.stageRoom[0].send(
          JSON.stringify({ type: "hint", hint: data.hint })
        )
        break;
      }
      case "submit-answer": {
        // Update score for each player at a time
        const { playerId, answer } = data;

        if (gameState.players[playerId]) {
          // Update the player's score for this round
          let newScore = 0;
          console.log(
            `Player ${playerId} is answering in round ${gameState.roundIndex}, question ${gameState.questionIndex}`
          );
          if (isCorrect(answer)) {
            newScore = updatePlayerScore(
              playerId,
              gameState.roundIndex,
              gameState.questionIndex,
              gameState.score
            );
            // debug();
          } else
            newScore = updatePlayerScore(
              playerId,
              gameState.roundIndex,
              gameState.questionIndex,
              0
            );
          response = {
            type: "update-players",
            players: gameState.players,
          };

          // Send score update to host
          if (rooms.hostRoom[0]) {
            rooms.hostRoom[0].send(JSON.stringify(response));
          }
        }
        break;
      }
      case "show-results": {
        let results = getQuestionResults(data.roundIndex, data.questionIndex);

        // Update total score for players
        rooms.playerRoom.forEach((player) => {
          player.send(
            JSON.stringify({
              type: "update-score",
              roundIndex: data.roundIndex,
              questionIndex: data.questionIndex,
              newScore: gameState.players[player.id].score,
            })
          );
        });

        rooms.playerRoom.forEach((socket) => {
          // Send leaderboard for each players
          socket.send(
            JSON.stringify({
              type: "results",
              results: results,
            })
          );
        });

        rooms.stageRoom[0].send(
          JSON.stringify({
            type: "results",
            results: results,
          })
        );

        break;
      }
      case "show-round-results": {
        let results = getRoundResults(data.roundIndex);
        rooms.playerRoom.forEach((socket) => {
          // Send leaderboard for each players
          socket.send(
            JSON.stringify({
              type: "roundResults",
              results: results,
            })
          );
        });

        rooms.stageRoom[0].send(
          JSON.stringify({
            type: "roundResults",
            results: results,
          })
        );
        break;
      }
      case "host-reset-game": {
        resetGameSession();
        break;
      }
      case "host-reset-score": {
        playerData.find((player) => player.id === data.playerId).score =
          data.newScore;
        let playerSocket = gameState.players[data.playerId].currentSocket;
        // Player hasn't connected
        if (!playerSocket) break;
        // Reset player score
        playerSocket.send(
          JSON.stringify({ type: "reset-score", newScore: data.newScore })
        );
        console.log(
          "Score reset, changed player id",
          data.playerId,
          "score to",
          data.newScore
        );
        break;
      }
      case "host-reset-password": {
        credentials.players.find(
          (player) => player.id === data.playerId
        ).password = data.newPassword;

        let playerSocket = gameState.players[data.playerId].currentSocket;
        // Player hasn't connected
        if (!playerSocket) break;
        // Soft close
        playerSocket.close();
        // Hard close
        setTimeout(() => {
          if (
            [playerSocket.OPEN, playerSocket.CLOSING].includes(
              playerSocket.readyState
            )
          ) {
            playerSocket.terminate();
          }
        }, 5000);
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

        if (ws.id && gameState.players[ws.id]) {
          const playerId = ws.id;
          gameState.players[playerId].isConnected = false;
          gameState.players[playerId].lastSeen = Date.now();
          gameState.players[playerId].currentSocket = null;

          let player = playerData.find((p) => p.id === ws.id);
          if (player) player.isConnected = false;

          if (rooms.hostRoom[0])
            rooms.hostRoom[0].send(
              JSON.stringify({
                type: "disconnect-player",
                playerId: ws.id,
                playerState: gameState.players[playerId],
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
        removeGameSession();
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
