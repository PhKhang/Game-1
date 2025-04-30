import LoginPage from "./LoginPage";
import HostPage from "./HostPage";
import PlayerPage from "./PlayerPage";
import QuestionPreview from "./components/host/question-preview";
import { useState, useRef, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Leaderboard from "@/components/player/leaderboard";

const mockPlayers = {
  players: [
    { id: 1, username: "A", password: "123", score: 10 },
    { id: 2, username: "B", password: "456", score: 20 },
    { id: 3, username: "C", password: "789", score: 30 },
    { id: 4, username: "D", password: "abc", score: 40 },
  ],
};

const mockQuestions = {
  rounds: [
    // Round 1
    [
      {
        id: 1,
        type: "multiple-choice",
        content:
          '<p>What is the <strong>capital</strong> of England?</p> <img src="/cc25.jpg" width=50 alt="coding-challenge" />',
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
  ],
};

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
    socket.current.send(
      JSON.stringify({
        type: "validation",
        loginRole: role,
        password: password,
      })
    );
    const validation = await new Promise((resolve) => {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "validation-response") {
          socket.current.removeEventListener("message", handleMessage);
          resolve(data);
        }
      };
      socket.current.addEventListener("message", handleMessage);
    });

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
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  } else if (page === "host-page") {
    return (
      <>
        <HostPage players={hostPlayers} questions={hostQuestions} />
        <Toaster />
      </>
    );
  } else if (page === "player-page") {
    return <PlayerPage username={username} />;
  }
  return <div>404</div>;
  // return (
  //   <>
  //     <HostPage /> <Toaster richColors />
  //   </>
  // );
  // return <Leaderboard players={playerData.players} />;
  // return <PlayerPage username="ABC" />;
  // return <QuestionPreview question={mockQuestions[0]} />;
}

export default App;
