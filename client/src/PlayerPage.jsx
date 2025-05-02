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
  { id: "1", username: "Player1", score: 30 },
  { id: "2", username: "Player2", score: 20 },
  { id: "3", username: "Player3", score: 40 },
  { id: "4", username: "Player4", score: 10 },
];

export default function PlayerPage({ username, socket }) {
  const [gameState, setGameState] = useState("showResults");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(99 * 60 + 99);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState([]);
  const question = useRef({
    id: 4,
    type: "multiple-choice",
    content: `<p>Which planet is known as the "Red Planet"? </br></br> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam placerat erat nec dui tempor lacinia. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In hac habitasse platea dictumst. Aenean blandit dictum libero, quis consequat elit laoreet ut. Pellentesque tellus mi, mollis nec congue sit amet, dapibus et nulla. Maecenas non aliquet nibh, sit amet bibendum urna. Praesent tincidunt, mauris non feugiat lacinia, orci dui semper arcu, eu vestibulum orci dolor in dolor. In eros mi, mollis mollis interdum vel, ornare eget nibh. Praesent vel tincidunt diam. Donec luctus, nibh at dignissim vulputate, ligula nibh tristique elit, a eleifend diam ipsum sed ipsum. Nunc nec erat orci. Fusce erat mauris, sagittis nec tincidunt a, porttitor et lacus. Nullam in laoreet velit. Suspendisse vel commodo enim, in hendrerit ipsum. Donec iaculis velit nulla, quis sollicitudin justo placerat pretium. Suspendisse faucibus orci tortor, non commodo nunc facilisis vel.</br></br>
Nullam rhoncus egestas ipsum vel ultrices. Sed fringilla nibh gravida augue elementum, in tincidunt enim facilisis. Proin finibus, risus id posuere gravida, urna leo cursus nisl, sed vehicula purus urna non purus. Nullam nisl urna, posuere vel iaculis id, luctus id eros. Cras pulvinar velit sit amet mauris pretium vestibulum. Integer faucibus ipsum non metus scelerisque maximus. Nam dignissim magna dictum ligula feugiat posuere. Aliquam at justo interdum, pulvinar diam iaculis, tempus eros.</br></br>
Nullam rhoncus egestas ipsum vel ultrices. Sed fringilla nibh gravida augue elementum, in tincidunt enim facilisis. Proin finibus, risus id posuere gravida, urna leo cursus nisl, sed vehicula purus urna non purus. Nullam nisl urna, posuere vel iaculis id, luctus id eros. Cras pulvinar velit sit amet mauris pretium vestibulum. Integer faucibus ipsum non metus scelerisque maximus. Nam dignissim magna dictum ligula feugiat posuere. Aliquam at justo interdum, pulvinar diam iaculis, tempus eros.</br></br>
Nulla scelerisque sapien nec nisi vestibulum, ut consequat risus efficitur. Vestibulum vehicula vulputate ipsum, sagittis rhoncus erat auctor vel. Donec sit amet purus sit amet elit blandit iaculis. Aenean vehicula, justo vel tempor condimentum, velit dolor ornare nulla, vel elementum enim purus vel nunc. Proin eget mattis urna, eget accumsan est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc nec condimentum nibh. Donec ipsum erat, sodales quis enim eu, pretium sagittis enim. Morbi interdum dui nisi, quis pretium eros aliquet vitae. Curabitur eu hendrerit urna. Curabitur eu ultrices tortor, et rutrum velit. Vestibulum malesuada tristique magna ut hendrerit. Duis rutrum ipsum volutpat sem vulputate, a egestas est egestas. Duis aliquam, orci vitae pretium varius, est mauris viverra turpis, ac consequat felis velit eget odio. Mauris blandit nulla et sem ullamcorper sagittis. Donec luctus sem felis, non dignissim augue tincidunt suscipit.</br></br>
Vestibulum tincidunt, massa nec maximus suscipit, turpis velit faucibus turpis, ut ultrices est nisl in mi. Quisque ullamcorper lorem diam, non gravida mauris blandit interdum. Ut sodales, dui vel semper viverra, mauris nunc ultricies dolor, a posuere mauris lectus bibendum eros. Aliquam erat volutpat. Vestibulum eget nisi non ligula auctor ultricies vitae vitae ligula. Curabitur vestibulum ultricies tellus sit amet posuere. Proin sagittis scelerisque dui non porta. Vestibulum quis risus aliquet, suscipit justo sed, volutpat ligula. Maecenas ante ipsum, cursus a ex ac, congue blandit felis. Maecenas velit nulla, feugiat ac justo ac, mattis posuere leo. Nunc a diam ut ligula rhoncus gravida. Duis lobortis venenatis magna ut scelerisque. Donec ut felis in tortor ultricies tempus in semper velit. </p></br> <img src="/cc25.jpg" width=50 alt="coding-challenge" />`,
    time: 99 * 60 + 99,
    answer: "Mars",
    hints: [
      "It's the fourth planet from the Sun.",
      "Has the tallest volcano in the solar system.",
      "Its color is due to iron oxide (rust) on the surface.",
      "NASA has sent multiple rovers there.",
    ],
    options: ["Mars", "Jupiter", "Venus", "Saturn", "Earth", "Uranus"],
  });
  const [content, setContent] = useState(question.current.content);

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
        <div className="max-h-screen pt-4 flex flex-col">
          <div className="flex-none w-full px-8">
            <div>
              <div className="flex justify-between items-center mb-2 text-lg">
                <div className="flex space-x-4">
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    {username}
                  </div>
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    Điểm: {score}
                  </div>
                </div>
                <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                  <Timer seconds={0} />
                </div>
              </div>
              <div className="text-sm text-gray-600">
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
              </div>
            </div>
          </div>
          <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center py-12 text-center w-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-muted-foreground">
                  Waiting for the host to start the game...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {gameState === "questionEnd" && (
        <div className="max-h-screen pt-4 flex flex-col">
          <div className="flex-none w-full px-8">
            <div>
              <div className="flex justify-between items-center mb-2 text-lg">
                <div className="flex space-x-4">
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    {username}
                  </div>
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    Điểm: {score}
                  </div>
                </div>
                <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                  <Timer seconds={0} />
                </div>
              </div>
              <div className="text-sm text-gray-600">
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
              </div>
            </div>
          </div>
          <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center py-12 text-center w-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-muted-foreground">
                  The question has ended. Waiting for the host to show answer...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {gameState === "showResults" && (
        <div className="max-h-screen pt-4 flex flex-col">
          <div className="flex-none w-full px-8">
            <div>
              <div className="flex justify-between items-center mb-2 text-lg">
                <div className="flex space-x-4">
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    {username}
                  </div>
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    Điểm: {score}
                  </div>
                </div>
                <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                  <Timer seconds={0} />
                </div>
              </div>
              <div className="text-sm text-gray-600">
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
              </div>
            </div>
          </div>
          <div className="flex-none bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center py-12 text-center w-2xl">
                <Leaderboard players={mockPlayers}></Leaderboard>
              </div>
            </div>
          </div>
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
        <div className="max-h-screen pt-4 flex flex-col">
          <div className="flex-none w-full px-8">
            <div>
              <div className="flex justify-between items-center mb-2 text-lg">
                <div className="flex space-x-4">
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    {username}
                  </div>
                  <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                    Điểm: {score}
                  </div>
                </div>
                <div className="bg-blue-500 px-3 py-1 rounded-full text-white">
                  <Timer
                    seconds={timeLeft}
                    onTimeout={() => {
                      setTimeLeft(0);
                      setGameState("questionEnd");
                    }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
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
              </div>
            </div>
          </div>
          <div className="flex-auto bg-blue-50/75 m-4 mb-0 p-4 rounded-2xl overflow-y-auto">
            <PreviewDiv htmlContent={content} />
          </div>
          <div className="flex-none h-50 flex items-center justify-center">
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
        </div>
      )}
    </>
  );
}
