import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import AnswerMultipleChoice from "@/components/player/answer-multiple-choice";
import AnswerShortPhrase from "@/components/player/answer-short-phrase";
import Timer from "@/components/player/timer";
import Leaderboard from "@/components/player/leaderboard";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function PlayerPage({ username, playerId, socket }) {
  const [gameState, setGameState] = useState("waiting");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [totalTime, setTotalTime] = useState(90);
  const [score, setScore] = useState(0);
  const [playerScores, setPlayerScores] = useState([]);
  const question = useRef(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (socket && socket.current) {
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "start-question":
            question.current = data.question;
            setContent(data.question.content);
            setTimeLeft(data.question.time);
            setTotalTime(data.question.time);
            setCurrentRoundIndex(data.roundIndex);
            setCurrentQuestionIndex(data.questionIndex);
            setGameState("questionStart");
            break;
          case "hint":
            setContent((prev) => (prev += data.hint));
            break;
          case "results":
            setGameState("showResults");
            setPlayerScores(data.results);
            break;
          case "round-results":
            setGameState("showRoundResults");
            setPlayerScores(data.results);
            break;
          case "reset-score":
            setScore(data.newScore);
            break;
          case "update-score":
            setScore(data.newScore);
            break;
          default:
            // optionally handle unknown types
            console.warn("Unknown message type:", data.type);
            break;
        }
      };

      socket.current.addEventListener("message", handleMessage);

      // Cleanup function
      return () => {
        socket.current.removeEventListener("message", handleMessage);
      };
    }
  }, [socket]);

  return (
    <div className="max-h-screen pt-4 flex flex-col">
      <div className="flex-none w-full px-8">
        <div>
          <div className="flex justify-between items-center mb-2 text-lg">
            <div className="flex space-x-4">
              <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                {username}
              </div>
              <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                Score: {score}
              </div>
            </div>
            {gameState === "questionStart" && (
              <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                <Timer
                  seconds={totalTime}
                  onTimeUpdate={(param) => {
                    setTimeLeft(param)
                  }}
                  onTimeout={() => {
                    setTimeLeft(0);
                    setGameState("questionEnd");
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {gameState === "waiting"
              ? "Waiting for host to start the game"
              : gameState === "questionStart"
              ? `Round ${currentRoundIndex + 1}, Question ${
                  currentQuestionIndex + 1
                }`
              : gameState === "showResults"
              ? `Showing question ${currentQuestionIndex + 1} results`
              : gameState === "showRoundResults"
              ? `Showing round ${currentRoundIndex + 1} results`
              : "Game Finished"}
          </div>
        </div>
      </div>

      {gameState === "waiting" && (
        <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-8 text-center w-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">
                Waiting for the host to start the game...
              </p>
            </div>
          </div>
        </div>
      )}
      {gameState === "questionEnd" && (
        <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-8 text-center w-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">
                The question has ended. Waiting for the host to show answer...
              </p>
            </div>
          </div>
        </div>
      )}
      {gameState === "showResults" && (
        <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-8 text-center w-2xl">
              <p className="text-2xl mb-8 rounded-2xl bg-white p-6 shadow-neutral-900">
                The correct answer is:{" "}
                <span className="text-green-600 font-bold">
                  {question.current.answer}
                </span>
              </p>
              <Leaderboard players={playerScores}></Leaderboard>
            </div>
          </div>
        </div>
      )}
      {gameState === "showRoundResults" && (
        <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-8 text-center w-2xl">
              <Leaderboard players={playerScores}></Leaderboard>
            </div>
          </div>
        </div>
      )}
      {gameState === "questionStart" && (
        <>
          <div className="flex-auto bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
            <ReactMarkdown
              children={content}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
            />
          </div>
          <div className="flex-none h-80 flex items-center justify-center">
            {question.current.type === "multiple-choice" ? (
              <AnswerMultipleChoice
                options={question.current.options}
                onSubmit={(answer) => {
                  let response = {
                    type: "submit-answer",
                    playerId: playerId,
                    answer: answer,
                  };
                  console.log(response);
                  socket.current.send(JSON.stringify(response));
                }}
              />
            ) : (
              <AnswerShortPhrase
                hint={question.current.answer.length + " characters"}
                onSubmit={(answer) => {
                  let response = {
                    type: "submit-answer",
                    playerId: playerId,
                    answer: answer,
                    submissionTime: totalTime - timeLeft + 1,
                  };
                  console.log(response);
                  socket.current.send(JSON.stringify(response));
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
