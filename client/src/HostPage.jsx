import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import Player from "@/components/host/player";
import QuestionPreview from "@/components/host/question-preview";
import QuestionControl from "./components/host/question-control";
import { toast } from "sonner";

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
        correctAnswer: "Paris",
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
        correctAnswer: "Paris",
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
        correctAnswer: "Paris",
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
        correctAnswer: "Paris",
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

const PlayerStateBadge = ({ state }) => {
  let badgeClassnames = "font-bold ml-4 ";
  if (state === "Disconnected") badgeClassnames += "bg-red-500";
  else if (state === "Connected" || state === "Answered")
    badgeClassnames += "bg-green-500";
  else badgeClassnames += "bg-gray-500";
  return <Badge className={badgeClassnames}>{state}</Badge>;
};

export default function HostPage() {
  const [gameState, setGameState] = useState("waiting");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answeredPlayers, setAnsweredPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const [shownHints, setShownHints] = useState([]);
  const [playerStates, setPlayerStates] = useState([
    "Disconnected",
    "Connected",
    "Waiting",
    "Answered",
  ]);
  // const [players, setPlayers] = useState(mockPlayers);

  // const socket = useRef(null);
  // useEffect(() => {
  //   socket.current = new WebSocket("ws://localhost:3000"); // Replace with your server URL

  //   // Handle socket connection
  //   socket.current.onopen = (event) => {
  //     socket.current.send("hello");
  //     console.log("websocket connection opened");
  //   };

  //   // Handle incoming messages
  //   socket.current.onmessage = (event) => {
  //     const data = event.data.toString();
  //     console.log(data);
  //   };

  //   // Handle socket close
  //   socket.current.onclose = () => {
  //     console.log("WebSocket connection closed");
  //   };

  //   return () => {
  //     // Clean up on unmount
  //     socket.current.close();
  //   };
  // }, []);

  // const fetchPlayersData = async () => {
  //   try {
  //     const response = await fetch("/data/players", {
  //       headers: {

  //         password: `Bearer dataPassword`,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch players data");
  //     }

  //     const data = await response.json();
  //     console.log("Players data:", data);
  //     // Process the data as needed
  //   } catch (error) {
  //     console.error("Error fetching players data:", error);
  //   }
  // };

  const nextQuestion = () => {
    if (
      currentQuestionIndex <
      mockQuestions.rounds[currentRoundIndex].length - 1
    ) {
      // Go to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setGameState("questionStart");
    } else if (currentRoundIndex < mockQuestions.rounds.length - 1) {
      // Go to next round
      setCurrentRoundIndex(currentRoundIndex + 1);
      setCurrentQuestionIndex(0);
      setGameState("questionStart");
    } else {
      // Game end
      setGameState("gameFinished");
    }
  };

  const playerData = {
    players: [
      { id: 1, name: "A", password: "123", score: 10 },
      { id: 2, name: "B", password: "456", score: 20 },
      { id: 3, name: "C", password: "789", score: 30 },
      { id: 4, name: "D", password: "abc", score: 40 },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col p-4 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto w-screen">
        <Card className="shadow-lg mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold text-blue-600">
                Host Dashboard
              </CardTitle>
            </div>
            <CardDescription className="flex justify-between items-center">
              <span>
                {gameState === "waiting"
                  ? "Waiting for players to join"
                  : gameState === "questionStart"
                  ? `Round ${currentRoundIndex + 1}, Question ${
                      currentQuestionIndex + 1
                    } of ${mockQuestions.rounds[currentRoundIndex].length}`
                  : gameState === "questionEnd"
                  ? `Round ${currentRoundIndex + 1}, Question ${
                      currentQuestionIndex + 1
                    } of ${
                      mockQuestions.rounds[currentRoundIndex].length
                    } finished`
                  : gameState === "showResults"
                  ? "Showing results"
                  : gameState === "showRoundResults"
                  ? `Showing round ${currentRoundIndex + 1} results`
                  : "Game Finished"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="game">Game</TabsTrigger>
                <TabsTrigger value="question">Questions</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
              </TabsList>

              <TabsContent value="game" className="space-y-4 mt-4">
                <p className="text-xl font-bold text-blue-600">Players</p>
                <div className="w-full grid grid-cols-4 gap-4">
                  {playerData.players.map((player, index) => {
                    return (
                      <Card key={index}>
                        <CardHeader className="w-full">
                          <div className="flex justify-between items-center">
                            <CardTitle>
                              <div className="flex justify-between items-center text-xl font-bold text-blue-600">
                                {player.name}
                                <PlayerStateBadge state={playerStates[index]} />
                              </div>
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>Score: {player.score}</CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Button
                  className="bg-blue-500 hover:bg-blue-600 m-1"
                  onClick={() => {
                    setPlayerStates(
                      playerStates.map((state) => {
                        if (state === "Disconnected") return state;
                        return "Waiting";
                      })
                    );
                    setGameState("questionStart");
                  }}
                  disabled={gameState !== "waiting"}
                >
                  Start game
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 m-1"
                  onClick={() => {
                    setGameState("showResults");
                    //TODO handle showing result/leaderboard
                  }}
                  disabled={gameState !== "questionEnd"}
                >
                  Show results
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 m-1"
                  onClick={() => {
                    setGameState("showRoundResults");
                    //TODO handle showing round result/leaderboard
                  }}
                  disabled={
                    gameState !== "showResults" ||
                    currentQuestionIndex <
                      mockQuestions.rounds[currentRoundIndex].length - 1
                  }
                >
                  Show round results
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 m-1"
                  onClick={() => {
                    setPlayerStates(
                      playerStates.map((state) => {
                        if (state === "Disconnected") return state;
                        return "Waiting";
                      })
                    );
                    setGameState("questionStart");
                    nextQuestion();
                  }}
                  disabled={
                    gameState !== "showRoundResults" &&
                    (gameState !== "showResults" ||
                      currentQuestionIndex >=
                        mockQuestions.rounds[currentRoundIndex].length - 1)
                  }
                >
                  Next question
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 font-bold m-1"
                  onClick={() => {
                    setPlayerStates(
                      playerStates.map((state) => {
                        if (state === "Disconnected") return state;
                        return "Connected";
                      })
                    );
                    setGameState("waiting");
                    setCurrentQuestionIndex(0);
                    setCurrentRoundIndex(0);
                  }}
                >
                  Reset
                </Button>

                {gameState !== "waiting" ? (
                  <QuestionControl
                    key={currentQuestionIndex}
                    question={
                      mockQuestions.rounds[currentRoundIndex][
                        currentQuestionIndex
                      ]
                    }
                    onFinish={() => {
                      setGameState("questionEnd");
                    }}
                  />
                ) : (
                  ""
                )}
              </TabsContent>

              <TabsContent value="question" className="mt-4">
                <div className="space-y-4">
                  {mockQuestions.rounds.map((round, index) => {
                    return (
                      <>
                        <h1 className="font-semibold text-2xl">
                          Round {index + 1}
                        </h1>

                        {round.map((question) => {
                          return (
                            <QuestionPreview
                              key={question.id}
                              question={question}
                            />
                          );
                        })}
                      </>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="players" className="mt-4">
                <div className="flex flex-col gap-2">
                  {playerData.players.map((player) => {
                    return (
                      <Player
                        id={player.id}
                        name={player.name}
                        password={player.password}
                      ></Player>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
