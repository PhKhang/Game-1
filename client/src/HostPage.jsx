import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Player from "@/components/player";
import QuestionPreview from "@/components/question-preview";

const mockQuestions = [
  {
    id: 1,
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
];

export default function HostPage() {
  const [gameState, setGameState] = useState("waiting");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answeredPlayers, setAnsweredPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const [shownHints, setShownHints] = useState([]);
  // const [players, setPlayers] = useState(mockPlayers);
  const [joinLink, setJoinLink] = useState(
    "https://quiz.example.com/join/ABC123"
  );

  const copyJoinLink = () => {};

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

  const playerData = {
    players: [
      { id: 1, name: "A", password: "123" },
      { id: 2, name: "B", password: "456" },
      { id: 3, name: "C", password: "789" },
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
                {/* {gameState === "waiting"
                  ? "Waiting for players to join"
                  : gameState === "playing"
                  ? `Round ${currentRoundIndex + 1}, Question ${
                      currentQuestionIndex + 1
                    } of ${totalQuestionsInRound}`
                  : gameState === "showingResults"
                  ? "Showing Results"
                  : gameState === "roundEnd"
                  ? `End of Round ${currentRoundIndex + 1}`
                  : "Game Finished"} */}
                Waiting
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
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
              </TabsList>

              <TabsContent value="game" className="space-y-4 mt-4">
                BRUH
                {/* {gameState === "waiting" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">Players ({players.length})</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {players.map((player) => (
                        <div key={player.id} className="bg-white p-2 rounded-md shadow-sm">
                          {player.username}
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                      onClick={startGame}
                      disabled={players.length === 0}
                    >
                      Start Game
                    </Button>
                  </div>
                )} */}
                {/* {gameState === "playing" && currentQuestion && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold">Time Left: {timeLeft}s</div>
                      <div className="text-sm">
                        {answeredPlayers.length} / {players.length} answered
                      </div>
                    </div>

                    <QuestionDisplay question={currentQuestion} showAnswer={false} />

                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Hints</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {currentQuestion.hints.map((hint, index) => (
                          <Button
                            key={index}
                            variant={shownHints.includes(index) ? "default" : "outline"}
                            size="sm"
                            onClick={() => sendHint(index)}
                            disabled={shownHints.includes(index)}
                            className="justify-start"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {shownHints.includes(index) ? hint : `Send Hint ${index + 1}`}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" onClick={showResults} className="w-full">
                      End Question & Show Results
                    </Button>
                  </div>
                )} */}
                {/* {gameState === "showingResults" && currentQuestion && (
                  <div className="space-y-6">
                    <QuestionDisplay question={currentQuestion} showAnswer={true} />

                    <PlayerAnswers players={mockPlayerAnswers} correctAnswer={currentQuestion.correctAnswer} />

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={nextQuestion}>
                      {currentQuestionIndex < totalQuestionsInRound - 1
                        ? "Next Question"
                        : currentRoundIndex < totalRounds - 1
                          ? "End Round & Show Leaderboard"
                          : "End Game & Show Final Results"}
                    </Button>
                  </div>
                )} */}
                {/* {gameState === "roundEnd" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center">Round {currentRoundIndex + 1} Complete!</h2>

                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h3 className="font-semibold mb-2 text-center">Round {currentRoundIndex + 1} Leaderboard</h3>
                      <Leaderboard
                        players={players.map((p) => ({
                          ...p,
                          score: p.roundScores[currentRoundIndex],
                        }))}
                      />
                    </div>

                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h3 className="font-semibold mb-2 text-center">Overall Leaderboard</h3>
                      <Leaderboard players={players} />
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={nextRound}>
                      Start Round {currentRoundIndex + 2}
                    </Button>
                  </div>
                )} */}
                {/* {gameState === "gameEnd" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center">Game Complete!</h2>

                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h3 className="font-semibold mb-4 text-center">Final Leaderboard</h3>
                      <Leaderboard players={players} />

                      <div className="mt-6 space-y-4">
                        <h4 className="font-semibold text-center">Round Breakdown</h4>
                        <div className="grid grid-cols-4 gap-2 text-sm font-medium bg-gray-100 p-2 rounded">
                          <div>Player</div>
                          {mockRounds.map((round, index) => (
                            <div key={index}>Round {index + 1}</div>
                          ))}
                        </div>
                        {players.map((player) => (
                          <div key={player.id} className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                            <div>{player.username}</div>
                            {player.roundScores.map((score, index) => (
                              <div key={index}>{score} pts</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" onClick={resetGame}>
                      Play Again
                    </Button>
                  </div>
                )} */}
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">All Questions</h3>

                  {mockQuestions.map((question) => {
                    return (
                      <QuestionPreview key={question.id} question={question} />
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
