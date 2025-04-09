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

export default function Player({ id, name, password }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copyState, setCopyState] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopyState(true);
    setTimeout(() => setCopyState(false), 1000);
  };

  return (
    <Card key={id}>
      <CardHeader>
        <CardTitle className="text-blue-600">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="pr-2">Password:</span>
        <input
          type="text"
          className="w-48 outline rounded-xs px-1"
          value={showPassword ? password : "••••••••"}
          disabled
        />
        <Button
          size="icon"
          variant="outline"
          className="ml-1"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <Eye className="w-6" />
          ) : (
            <EyeClosed className="w-5" />
          )}
        </Button>
        <Button
          size="icon"
          className="ml-1"
          variant="outline"
          onClick={handleCopy}
        >
          {copyState ? <Check /> : <Copy />}
        </Button>
      </CardContent>
    </Card>
  );
}
