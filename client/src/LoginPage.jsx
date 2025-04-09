import { useState } from "react";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    //TODO password and loginRole validation
    onLogin(password, loginRole);

    // Allow login after 1 second to prevent spamming
    // setTimeout(() => {
    //   setIsLoading(false);
    // }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="lg:max-w-5xl md:max-w-3xl sm:max-w-xl max-w-full">
        <Card className="shadow-lg w-xl">
          <img src="/cc25-main.png" width={360} className="m-auto" alt="" />
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-500">
              Login
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password<span className="text-red-500 -m-1">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginRole">
                  Role<span className="text-red-500 -m-1">*</span>
                </Label>
                <Select required onValueChange={(value) => setLoginRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="host">Host</SelectItem>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="stage">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                  <LogIn />
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
