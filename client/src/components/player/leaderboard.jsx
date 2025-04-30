import { Card, CardHeader } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

export default function Leaderboard({ players }) {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-3 w-3xl">
      <div className="space-y-2">
        {sortedPlayers.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No players yet
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <Card
                key={player.id}
                className="p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                    {index === 0 ? (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="h-4 w-4 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="h-4 w-4 text-amber-700" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="font-medium">{player.username}</div>
                </div>
                <div className="font-semibold">{player.score} pts</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
