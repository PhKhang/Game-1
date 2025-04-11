import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
// import { Leaderboard } from "@/components/leaderboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AnswerMultipleChoice from "./components/player/answer-multiple-choice";
import AnswerShortPhrase from "./components/player/answer-short-phrase";
import Timer from "./components/player/timer";

// Mock data
const mockPlayers = [
  { id: "1", username: "Player1", score: 30 },
  { id: "2", username: "Player2", score: 20 },
  { id: "3", username: "Player3", score: 40 },
  { id: "4", username: "Player4", score: 10 },
];

const mockQuestions = [
  {
    id: 1,
    text: "What is the capital of France?",
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

export default function PlayerPage({ username }) {
  const [gameState, setGameState] = useState("waiting");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);

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
  //     if (data === "start") {
  //       setGameState("playing");
  //       setTimeLeft(mockQuestions[currentQuestionIndex].time);
  //     } else if (data === "hint") {
  //       setHints((prev) => [...prev, data]);
  //     }
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

  //TODO   const submitAnswer = (answer) => {
  //     setSelectedAnswer(answer);
  //     socket.send(JSON.stringify({ type: "submitAnswer", answer }));
  //   };

  // Mock game progression for demo purposes
  // useEffect(() => {
  //   // Wait until socket is connected before sending "play"
  //   const checkSocketConnection = setInterval(() => {
  //     if (
  //       socket.current &&
  //       socket.current.readyState === WebSocket.OPEN &&
  //       gameState === "waiting"
  //     ) {
  //       socket.current.send("play");
  //       clearInterval(checkSocketConnection);
  //     }
  //   }, 100);

  //   return () => clearInterval(checkSocketConnection);
  // }, [gameState]);

  // Mock timer countdown
  useEffect(() => {
    let timer;

    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      // Time's up, show results
      // showResults();
    }

    return () => {
      clearTimeout(timer);
    };
  }, [gameState, timeLeft]);

  const submitAnswer = (answer) => {
    setSubmittedAnswer(answer);
  };

  const showResults = () => {
    setGameState("showingResults");

    // Check if answer is correct
    const isAnswerCorrect =
      submittedAnswer === mockQuestions[currentQuestionIndex].correctAnswer;
    setIsCorrect(isAnswerCorrect);

    // Update score if correct
    if (isAnswerCorrect) {
      setScore((prev) => prev + 10);
    }

    // Simulate moving to next question after 5 seconds
    setTimeout(() => {
      if (currentQuestionIndex < mockQuestions.length - 1) {
        nextQuestion();
      } else {
        endRound();
      }
    }, 5000);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setSubmittedAnswer("");
    setGameState("waiting");
    setTimeLeft(30);
    setHints([]);
    setIsCorrect(null);
  };

  const endRound = () => {
    setGameState("roundEnd");

    // Simulate moving to next round after 5 seconds
    setTimeout(() => {
      if (currentRoundIndex < 2) {
        //TODO Mock 3 rounds
        nextRound();
      } else {
        endGame();
      }
    }, 5000);
  };

  const nextRound = () => {
    setCurrentRoundIndex((prev) => prev + 1);
    setCurrentQuestionIndex(0);
    setSubmittedAnswer(null);
    setGameState("waiting");
    setTimeLeft(30);
    setHints([]);
    setIsCorrect(null);
  };

  const endGame = () => {
    setGameState("gameEnd");
  };

  return (
    <>
      <div className="flex h-[calc(100vh*3/4)] flex-col p-4 bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="container mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-blue-600">
                Quiz Game
              </CardTitle>
              <div className="flex">
                <div className="bg-blue-100 px-3 py-1 rounded-full text-xl">
                  {username} - {score} points
                </div>
                {timeLeft > 0 && gameState === "playing" && (
                  <Timer seconds={timeLeft} onTimeout={() => setTimeLeft(0)} />
                )}
              </div>
            </div>
            <CardDescription>
              {gameState === "waiting"
                ? "Waiting for host to start the game"
                : gameState === "playing"
                ? `Round ${currentRoundIndex + 1}, Question ${
                    currentQuestionIndex + 1
                  }`
                : gameState === "showingResults"
                ? "Results"
                : gameState === "roundEnd"
                ? `End of Round ${currentRoundIndex + 1}`
                : "Game Finished"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* {gameState === "waiting" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">
                Waiting for the host to start the game...
              </p>
            </div>
          )}

          {gameState === "playing" &&
            currentQuestionIndex < mockQuestions.length && (
              <div className="space-y-6">
                <div className="text-center font-semibold">
                  Time Left: {timeLeft}s
                </div>

                <QuestionDisplay
                  question={mockQuestions[currentQuestionIndex]}
                  showAnswer={false}
                  onSelectAnswer={submitAnswer}
                  selectedAnswer={selectedAnswer}
                  disabled={selectedAnswer !== null}
                />

                {hints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Hints:</h3>
                    {hints.map((hint, index) => (
                      <Alert key={index} className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="ml-2 text-sm">
                          Hint {index + 1}
                        </AlertTitle>
                        <AlertDescription className="ml-2 text-sm">
                          {hint}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {selectedAnswer && (
                  <div className="text-center text-sm text-muted-foreground">
                    Answer submitted. Waiting for timer to end...
                  </div>
                )}
              </div>
            )}

          {gameState === "showingResults" &&
            currentQuestionIndex < mockQuestions.length && (
              <div className="space-y-6">
                <QuestionDisplay
                  question={mockQuestions[currentQuestionIndex]}
                  showAnswer={true}
                  selectedAnswer={selectedAnswer}
                />

                <div className="text-center">
                  {isCorrect ? (
                    <div className="text-green-600 font-semibold">
                      Correct! +10 points
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">Incorrect!</div>
                  )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Moving to next question soon...
                </div>
              </div>
            )}

          {gameState === "roundEnd" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">
                Round {currentRoundIndex + 1} Complete!
              </h2>

              <div className="text-center">
                <div className="text-lg">Your Score This Round</div>
                <div className="text-3xl font-bold text-blue-600">
                  {score} points
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Next round starting soon...
              </div>
            </div>
          )}

          {gameState === "gameEnd" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Game Over!</h2>

              <div className="text-center mb-4">
                <div className="text-lg">Your Final Score</div>
                <div className="text-3xl font-bold text-blue-600">{score}</div>
              </div>

              <Button className="w-full">Back to Home (TODO)</Button>
            </div>
          )} */}
          </CardContent>
        </div>
      </div>
      <div className="h-[calc(100vh*1/4)] flex items-center justify-center">
        {/* <AnswerShortPhrase
          answerLengthHint={mockQuestions[0].correctAnswer.length}
        /> */}
        <AnswerShortPhrase
          hint={mockQuestions[0].correctAnswer.length + " characters"}
          onSubmit={() => setGameState("playing")}
        />
      </div>
    </>
  );
}
