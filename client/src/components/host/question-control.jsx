// import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import PreviewIFrame from "@/components/host/preview-iframe";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import PreviewDiv from "./preview-div";

export default function QuestionControl({ question, onFinish }) {
  // The content for preview (question, hints or answer)
  const [content, setContent] = useState(question.content);
  const [finished, setFinished] = useState(false);
  const [usedHints, setUsedHints] = useState(
    Array(question.hints.length).fill(false)
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-blue-600">
            Question {question.id}
          </CardTitle>
        </div>
        <CardDescription>
          <Badge className="mr-2 font-bold bg-cyan-500">
            Type: {question.type}
          </Badge>
          <Badge className="mr-2 font-bold bg-emerald-600">
            Time: {question.time}s
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PreviewDiv htmlContent={content} />
      </CardContent>
      <CardFooter className="overflow-visible">
        {question.hints.map((hint, index) => (
          <Button
            key={index}
            className="bg-blue-500 hover:bg-blue-600 m-1"
            onClick={() => {
              setContent(content + "<br/>" + hint);
              setUsedHints(
                usedHints.map((t, hintIndex) => {
                  if (hintIndex === index) return true;
                  else return t;
                })
              );
            }}
            disabled={finished || usedHints[index]}
          >
            Hint {index + 1}
          </Button>
        ))}
        <Button
          className="bg-green-600 hover:bg-green-700 m-1"
          onClick={() => {
            setContent(question.answer);
            setFinished(true);
            onFinish();
          }}
          disabled={finished}
        >
          Answer
        </Button>
      </CardFooter>
    </Card>
  );
}
