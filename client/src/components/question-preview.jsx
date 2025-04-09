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
import PreviewIFrame from "@/components/preview-iframe";
import { useState } from "react";

export default function QuestionPreview({ question }) {
  const [previewContent, setPreviewContent] = useState(question.content);

  return (
    <Card className="shadow-lg mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-blue-600">
            Question {question.id}
          </CardTitle>
        </div>
        <CardDescription>Time: {question.time}s</CardDescription>
      </CardHeader>
      <CardContent>
        <PreviewIFrame htmlContent={previewContent} />
      </CardContent>
      <CardFooter className="overflow-visible">
        <Button
          className="bg-red-600 hover:bg-red-700 m-1"
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
            setPreviewContent(question.correctAnswer);
          }}
        >
          Answer
        </Button>
      </CardFooter>
    </Card>
  );
}
