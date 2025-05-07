import { useState } from "react";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeClosed, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function Player({
  id,
  username,
  password,
  socket,
  onSetScore,
  onSetPassword,
}) {
  const [passwordValue, setPasswordValue] = useState(password);
  const [scoreValue, setScoreValue] = useState(0);

  const resetPassword = (newPassword) => {
    // TODO: reset password
    onSetPassword(newPassword);
    socket.current.send(
      JSON.stringify({
        type: "host-reset-password",
        playerId: id,
        newPassword: newPassword,
      })
    );
    toast.info("Password reset: " + newPassword);
  };

  const resetScore = (newScore) => {
    // TODO: reset score
    onSetScore(newScore);
    socket.current.send(
      JSON.stringify({
        type: "host-reset-score",
        playerId: id,
        newScore: newScore,
      })
    );
    toast.info("Score reset: " + newScore);
  };

  return (
    <Card key={id}>
      <CardHeader>
        <CardTitle className="text-blue-600">{username}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <label>
            Password:
            <input
              type="text"
              name="password-field"
              className="w-48 outline rounded-xs px-1 mx-2"
              value={passwordValue}
              onChange={(e) => {
                e.preventDefault();
                setPasswordValue(e.target.value);
              }}
            />
          </label>
          <Button
            className="ml-1 bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => resetPassword(passwordValue)}
          >
            Reset password
          </Button>
        </div>
        <div className="pt-2">
          <label>
            Score (must be a number):
            <input
              type="number"
              name="score-field"
              className="w-48 outline rounded-xs px-1 mx-2"
              value={scoreValue}
              onChange={(e) => {
                e.preventDefault();
                setScoreValue(e.target.value);
              }}
            />
          </label>
          <Button
            className="ml-1 bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => resetScore(scoreValue)}
          >
            Reset score
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
