import LoginPage from "./LoginPage";
import HostPage from "./HostPage";
import PlayerPage from "./PlayerPage";
import QuestionPreview from "./components/host/question-preview";
import { useState, useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Leaderboard from "@/components/player/leaderboard";

function App() {
  const [page, setPage] = useState("login-page");
  const [username, setUsername] = useState("");
  const [hostPlayers, setHostPlayers] = useState([]);
  const [hostQuestions, setHostQuestions] = useState([]);

  const socket = useRef(null);
  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:3000"); // Replace with your server URL

    // Handle socket connection
    socket.current.onopen = () => {
      console.log("WebSocket connection opened");
    };

    // Handle incoming messages
    // socket.current.onmessage = (event) => {};

    // Handle socket close
    socket.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      // Clean up on unmount
      socket.current.close();
    };
  }, []);

  const handleLogin = async (password, role) => {
    // Send request
    socket.current.send(
      JSON.stringify({
        type: "validation",
        loginRole: role,
        password: password,
      })
    );
    // Wait for response
    const validation = await new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "validation-response") {
          socket.current.removeEventListener("message", handleMessage);
          resolve(data);
        }
      };

      setTimeout(() => {
        socket.current.removeEventListener("message", handleMessage);
        reject(new Error("Validation response timeout"));
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
          setHostPlayers(validation.players);
          setHostQuestions(validation.questions);
        } else if (role === "player") {
          setPage("player-page");
          setUsername(validation.username);
        }
      } else {
        toast.error("Password or role incorrect!");
      }
    } catch (reason) {
      // Server failed to respond
      toast.error("Something went wrong!");
      console.log("Login failed", reason);
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
        />
        <Toaster />
      </>
    );
  } else if (page === "player-page") {
    return <PlayerPage username={username} socket={socket} />;
  }
  return <div>404</div>;
}

export default App;
