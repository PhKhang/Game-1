import { useState, useEffect, useRef } from "react";
import AnswerMultipleChoice from "@/components/player/answer-multiple-choice";
import Timer from "@/components/player/timer";
import Leaderboard from "@/components/player/leaderboard";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Mock data
const mockPlayers = [
  { id: "0", username: "A", score: 0 },
  { id: "1", username: "B", score: 0 },
  { id: "2", username: "C", score: 0 },
  { id: "3", username: "D", score: 0 },
];

export default function StagePage({ socket }) {
  const [gameState, setGameState] = useState("waiting");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const question = useRef(null);
  const [content, setContent] = useState("");
  const [leaderboard, setLeaderboard] = useState(mockPlayers);

  useEffect(() => {
    if (socket && socket.current) {
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
          setContent((prev) => prev + data.hint);
        } else if (data.type === "results") {
          setLeaderboard(data.results);
          setGameState("showResults")
        } else if (data.type === "roundResults") {
          setLeaderboard(data.results);
          setGameState("showRoundResults")
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
    <div className="h-screen max-h-screen pt-4 flex flex-col">
      <div className="flex-none w-full px-8">
        <div>
          <div className="flex justify-center items-center mb-2 text-lg">
            <div className="flex space-x-4">
              <img src="/header.png" alt="" width="600" />
            </div>
          </div>
        </div>
        {gameState === "questionStart" && (
          <>
            <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
              <Timer
                seconds={timeLeft}
                onTimeout={() => {
                  setTimeLeft(0);
                  setGameState("questionEnd");
                }}
              />
            </div>
            <h1 className="text-4xl text-center font-bold mt-2">
              Vòng {currentRoundIndex + 1}, câu hỏi {currentQuestionIndex + 1}
            </h1>
          </>
        )}
      </div>

      {gameState === "waiting" && (
        <div className="flex-1">
          <img
            src="/title.png"
            alt=""
            width="600"
            className="relative top-28 left-[calc(50%-300px)]"
          />
          <h1 className="text-4xl font-bold text-blue-500 text-center relative top-38">
            <span className="p-6 bg-blue-50/75 rounded-2xl">Game 1</span>
          </h1>
        </div>
      )}
      {gameState === "showResults" && (
        <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-8 text-center w-2xl">
              <p className="text-2xl mb-8 rounded-2xl bg-white p-6 shadow-neutral-900">
                Câu trả lời đúng là:{" "}
                <span className="text-green-600 font-bold">
                  {question.current.answer}
                </span>
              </p>
              <Leaderboard players={leaderboard}></Leaderboard>
            </div>
          </div>
        </div>
      )}
      {gameState === "showRoundResults" && (
        <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center py-8 text-center w-2xl">
              <Leaderboard players={leaderboard}></Leaderboard>
            </div>
          </div>
        </div>
      )}
      {(gameState === "questionStart" || gameState === "questionEnd") && (
        <>
          <div className="flex-auto bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
            <ReactMarkdown
              children={content}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
            />
          </div>
          {question.current.type === "multiple-choice" ? (
            <div className="flex-none h-60 flex items-center justify-center">
              <AnswerMultipleChoice options={question.current.options} />
            </div>
          ) : (
            <div className="mb-4"></div>
          )}
        </>
      )}
    </div>
  );
}
