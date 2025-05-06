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
import { Check, Copy, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import Player from "@/components/host/player";
import QuestionPreview from "@/components/host/question-preview";
import QuestionControl from "./components/host/question-control";
import { toast } from "sonner";

const PlayerStateBadge = ({ state }) => {
  let badgeClassnames = "font-bold ml-4 ";
  if (state === "Disconnected") badgeClassnames += "bg-red-500";
  else if (state === "Connected") badgeClassnames += "bg-green-500";
  else badgeClassnames += "bg-gray-500";
  return <Badge className={badgeClassnames}>{state}</Badge>;
};

export default function HostPage({ players, questions, socket, http }) {
  const [gameState, setGameState] = useState("waiting");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("game");
  const [playerStates, setPlayerStates] = useState(
    Object.fromEntries(
      players.map((player) => [
        player.id,
        player.isConnected ? "Connected" : "Disconnected",
      ])
    )
  );
  useEffect(() => {
    if (socket && socket.current) {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "connect-player") {
          players.find(
            (player) => player.id === data.playerId
          ).isConnected = true;
          setPlayerStates((prevStates) => ({
            ...prevStates,
            [data.playerId]: "Connected",
          }));
        } else if (data.type === "disconnect-player") {
          players.find(
            (player) => player.id === data.playerId
          ).isConnected = false;
          setPlayerStates((prevStates) => ({
            ...prevStates,
            [data.playerId]: "Disconnected",
          }));
        }
      };

      socket.current.addEventListener("message", handleMessage);

      // Cleanup function
      return () => {
        socket.current.removeEventListener("message", handleMessage);
      };
    }
  }, [socket, gameState, players]);

  const nextQuestion = (handler) => {
    let nextQuestionIndex = currentQuestionIndex + 1;
    let nextRoundIndex = currentRoundIndex;
    if (nextQuestionIndex >= questions[currentRoundIndex].length) {
      nextQuestionIndex = 0;
      nextRoundIndex += 1;
    }
    if (nextRoundIndex >= questions.length) {
      // Game end
      setGameState("gameFinished");
      return;
    }
    if (handler) handler(nextQuestionIndex, nextRoundIndex);
    setCurrentQuestionIndex(nextQuestionIndex);
    setCurrentRoundIndex(nextRoundIndex);
    setGameState("questionStart");
  };

  function showUploadPanel(){
    window.open("/upload", "UploadFile", "width=600,height=800");

    const handleUploadMessage = (e) => {
      if (e.data?.type === 'excel-upload-result') {
        const questions = e.data.questions;
        console.log('Received Excel questions');
        
      }

    };
    window.addEventListener()
  }

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
                    } of ${questions[currentRoundIndex].length}`
                  : gameState === "questionEnd"
                  ? `Round ${currentRoundIndex + 1}, Question ${
                      currentQuestionIndex + 1
                    } of ${questions[currentRoundIndex].length} finished`
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
                  {players.map((player, index) => {
                    return (
                      <Card key={index}>
                        <CardHeader className="w-full">
                          <div className="flex justify-between items-center">
                            <CardTitle>
                              <div className="flex justify-between items-center text-xl font-bold text-blue-600">
                                {player.username}
                                <PlayerStateBadge
                                  state={playerStates[player.id]}
                                />
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
                    setGameState("questionStart");
                    socket.current.send(
                      JSON.stringify({
                        type: "host-start-question",
                        roundIndex: currentRoundIndex,
                        questionIndex: currentQuestionIndex,
                      })
                    );
                  }}
                  disabled={gameState !== "waiting"}
                >
                  Start game
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 m-1"
                  onClick={() => {
                    setGameState("showResults");
                    socket.current.send(
                      JSON.stringify({
                        type: "show-results",
                        roundIndex: currentRoundIndex,
                        questionIndex: currentQuestionIndex,
                      })
                    );
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
                    socket.current.send(
                      JSON.stringify({
                        type: "show-results",
                        roundIndex: currentRoundIndex,
                      })
                    );
                  }}
                  disabled={
                    gameState !== "showResults" ||
                    currentQuestionIndex <
                      questions[currentRoundIndex].length - 1
                  }
                >
                  Show round results
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 m-1"
                  onClick={() => {
                    setGameState("questionStart");
                    nextQuestion((questionIndex, roundIndex) => {
                      socket.current.send(
                        JSON.stringify({
                          type: "host-start-question",
                          roundIndex: roundIndex,
                          questionIndex: questionIndex,
                        })
                      );
                    });
                  }}
                  disabled={
                    gameState !== "showRoundResults" &&
                    (gameState !== "showResults" ||
                      currentQuestionIndex >=
                        questions[currentRoundIndex].length - 1)
                  }
                >
                  Next question
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 font-bold m-1"
                  onClick={() => {
                    setGameState("waiting");
                    setCurrentQuestionIndex(0);
                    setCurrentRoundIndex(0);
                  }}
                >
                  Reset
                </Button>

                {gameState !== "waiting" ? ( // Question control when the game starts
                  <QuestionControl
                    key={currentQuestionIndex}
                    question={
                      questions[currentRoundIndex][currentQuestionIndex]
                    }
                    onFinish={() => {
                      setGameState("questionEnd");
                    }}
                    socket={socket}
                  />
                ) : (
                  ""
                )}
              </TabsContent>

              <TabsContent value="question" className="mt-4">
                <div className="space-y-4">
                  {questions.map((round, index) => {
                    return (
                      <div key={index}>
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
                      </div>
                    );
                  })}
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 font-bold m-1"
                    onClick={() => {
                      showUploadPanel();
                    }}
                  >
                    Upload Questions
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="players" className="mt-4">
                <div className="flex flex-col gap-2">
                  {players.map((player) => {
                    return (
                      <Player
                        key={player.id}
                        id={player.id}
                        username={player.username}
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
