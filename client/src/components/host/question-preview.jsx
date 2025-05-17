import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

export default function QuestionPreview({ question }) {
  // The content for preview (question, hints or answer)
  const [previewContent, setPreviewContent] = useState(question.content);

  return (
    <Card className="mb-4">
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
        <ReactMarkdown
          children={previewContent}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
        />
      </CardContent>
      <CardFooter className="overflow-visible">
        <Button
          className="bg-red-600 hover:bg-red-700 font-bold m-1"
          onClick={() => {
            setPreviewContent(question.content);
          }}
        >
          Question
        </Button>
        {question.hints.map((hint, index) => (
          <Button
            key={index}
            className="bg-blue-500 hover:bg-blue-600 m-1"
            onClick={() => {
              setPreviewContent(hint);
            }}
          >
            Hint {index + 1}
          </Button>
        ))}
        <Button
          className="bg-green-600 hover:bg-green-700 m-1"
          onClick={() => {
            setPreviewContent(question.answer);
          }}
        >
          Answer
        </Button>
      </CardFooter>
    </Card>
  );
}
