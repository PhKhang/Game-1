import LoginPage from "./LoginPage";
import HostPage from "./HostPage";
import PlayerPage from "./PlayerPage";
import QuestionPreview from "./components/host/question-preview";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import Leaderboard from "@/components/player/leaderboard";

const mockPlayers = {
  players: [
    { id: 1, name: "A", password: "123", score: 10 },
    { id: 2, name: "B", password: "456", score: 20 },
    { id: 3, name: "C", password: "789", score: 30 },
    { id: 4, name: "D", password: "abc", score: 40 },
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
    ],
    // Round 2
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
    ],
  ],
};

function App() {
  // const [page, setPage] = useState("login-page");
  // const handleLogin = (password, role) => {
  //   // TODO password validation
  //   if (role === "host" && password === "123") {
  //     setPage("host-page");
  //   } else {
  //     alert("password or role incorrect!");
  //   }
  // };
  // if (page === "login-page") {
  //   return <LoginPage onLogin={handleLogin} />;
  // } else if (page === "host-page") {
  //   return <HostPage />;
  // }
  // return <div>404</div>;
  return (
    <>
      <HostPage /> <Toaster richColors />
    </>
  );
  // return <Leaderboard players={playerData.players} />;
  // return <PlayerPage username="ABC" />;
  // return <QuestionPreview question={mockQuestions[0]} />;
}

export default App;
