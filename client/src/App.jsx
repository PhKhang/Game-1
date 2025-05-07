import LoginPage from "./LoginPage";
import HostPage from "./HostPage";
import PlayerPage from "./PlayerPage";
import QuestionPreview from "./components/host/question-preview";
import { useState, useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Leaderboard from "@/components/player/leaderboard";
import StagePage from "./StagePage";

function App() {
  const [page, setPage] = useState("login-page");
  const [playerInfo, setPlayerInfo] = useState(null);
  const [hostPlayers, setHostPlayers] = useState([]);
  const [hostQuestions, setHostQuestions] = useState([]);

  const socket = useRef(null);
  const http = useRef(null);

  const handleUploadMessage = (e) => {
    // Handle new question upload
    if (e.data?.type === "excel-upload-result") {
      const questions = e.data.questions;
      console.log("Received Excel questions");
      setHostQuestions(questions);
    }
  };

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:3000"); // Replace with your server URL
    http.current = "http://localhost:3000";

    // Handle socket connection
    socket.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    // Handle incoming messages
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update-players"){
        setHostPlayers(data.players);
      }
    };
    socket.current.addEventListener("message", handleMessage);

    // Handle socket close
    socket.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Handle window message
    window.addEventListener("message", handleUploadMessage);

    return () => {
      // Clean up on unmount
      socket.current.close();
      window.removeEventListener("message", handleUploadMessage);
      socket.current.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const handleLogin = async (password, role) => {
    // Send request
    socket.current.send(
      JSON.stringify({
        type: "login",
        loginRole: role,
        password: password,
      })
    );
    // Wait for response
    const validation = await new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data.type);
        if (data.type === "login-response") {
          socket.current.removeEventListener("message", handleMessage);
          resolve(data);
        }
        if (data.type === "error") {
          reject(new Error(data.error));
        }
      };

      setTimeout(() => {
        socket.current.removeEventListener("message", handleMessage);
        reject(new Error("Login response timeout"));
      }, 5000); // 5 seconds timeout

      socket.current.addEventListener("message", handleMessage);
    });

    // Process response
    try {
      // Server responded
      console.log(validation);
      if (validation.status === "success") {
        if (role === "host") {
          setPage("host-page");
          setHostPlayers(
            validation.players.map((player) => ({
              ...player,
              password: validation.credentials.find(
                (cred) => cred.id === player.id
              ).password,
            }))
          );
          setHostQuestions(validation.questions);
        } else if (role === "player") {
          setPage("player-page");
          setPlayerInfo({
            username: validation.username,
            playerId: validation.playerId,
          });
        } else if (role === "stage") {
          setPage("stage-page");
        }
      } else {
        toast.error("Password or role incorrect!");
      }
    } catch (reason) {
      // Server failed to respond
      toast.error("Something went wrong!");
      console.log("Login failed ", reason);
    }
  };

  if (page === "login-page") {
    return (
      <>
        <LoginPage onLogin={handleLogin} socket={socket} />
        <Toaster />
      </>
    );
  } else if (page === "host-page") {
    return (
      <>
        <HostPage
          players={hostPlayers}
          questions={hostQuestions}
          socket={socket}
          http={http}
          onSetScore={(id, newScore) => {
            setHostPlayers(
              hostPlayers.map((player) => {
                if (player.id === id) player.score = newScore;
                return player;
              })
            );
          }}
          onSetPassword={(id, newPassword) => {
            setHostPlayers(
              hostPlayers.map((player) => {
                if (player.id === id) player.password = newPassword;
                return player;
              })
            );
          }}
        />
        <Toaster />
      </>
    );
  } else if (page === "player-page") {
    return (
      <PlayerPage
        username={playerInfo.username}
        playerId={playerInfo.playerId}
        socket={socket}
      />
    );
  } else if (page === "stage-page") {
    return <StagePage socket={socket} />;
  }
  return <div>404</div>;
}

export default App;
