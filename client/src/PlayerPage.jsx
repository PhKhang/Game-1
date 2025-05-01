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
import AnswerMultipleChoice from "@/components/player/answer-multiple-choice";
import AnswerShortPhrase from "@/components/player/answer-short-phrase";
import Timer from "@/components/player/timer";
import Leaderboard from "@/components/player/leaderboard";
import PreviewDiv from "@/components/preview-div";

// Mock data
const mockPlayers = [
  { id: "1", name: "Player1", score: 30 },
  { id: "2", name: "Player2", score: 20 },
  { id: "3", name: "Player3", score: 40 },
  { id: "4", name: "Player4", score: 10 },
];

export default function PlayerPage({ username, socket }) {
  const [gameState, setGameState] = useState("waiting");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState([]);
  const question = useRef(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (socket.current) {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "start-question") {
          question.current = data.question;
          setContent(data.question.content);
          setTimeLeft(data.question.time);
          setCurrentRoundIndex(data.roundIndex);
          setCurrentQuestionIndex(data.questionIndex);
          setGameState("questionStart");
        } else if (data.type === "hint") {
          console.log("dumamay", data);
          setContent((prev) => (prev += data.hint));
        }
      };

      socket.current.addEventListener("message", handleMessage);

      // Cleanup function
      return () => {
        socket.current.removeEventListener("message", handleMessage);
      };
    }
  }, [socket]);

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

  return (
    <>
      {gameState === "waiting" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-muted-foreground">
            Waiting for the host to start the game...
          </p>
        </div>
      )}
      {gameState === "questionEnd" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-muted-foreground">
            The question has ended. Waiting for the host to show answer...
          </p>
        </div>
      )}
      {gameState === "showResults" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-blue-600">
                Leaderboard
              </CardTitle>

              <CardDescription>Round 1, question 1</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Leaderboard players={mockPlayers}></Leaderboard>
            </CardContent>
          </Card>
        </div>
      )}
      {gameState === "showRoundResults" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-blue-600">
                Leaderboard
              </CardTitle>

              <CardDescription>Round 1</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Leaderboard players={mockPlayers}></Leaderboard>
            </CardContent>
          </Card>
        </div>
      )}
      {gameState === "questionStart" && (
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
                    <Timer
                      seconds={timeLeft}
                      onTimeout={() => {
                        setTimeLeft(0);
                        setGameState("questionEnd");
                      }}
                    />
                  </div>
                </div>
                <CardDescription>
                  {gameState === "waiting"
                    ? "Waiting for host to start the game"
                    : gameState === "questionStart"
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
                <PreviewDiv htmlContent={content} />
              </CardContent>

              {/* 

          {gameState === "questionStart" &&
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
            </div>
          </div>
          <div className="h-[calc(100vh*1/4)] flex items-center justify-center">
            {question.current.type === "multiple-choice" ? (
              <AnswerMultipleChoice
                options={question.current.options}
                onSubmit={() => {
                  /**TODO */
                }}
              />
            ) : (
              <AnswerShortPhrase
                hint={question.current.answer.length + " characters"}
                onSubmit={() => {
                  /**TODO */
                }}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
