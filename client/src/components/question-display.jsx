import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export function QuestionDisplay({
  question,
  showAnswer,
  selectedAnswer,
  onSelectAnswer,
  disabled = false,
}) {
  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-center">{question.text}</div>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option) => {
          const isCorrect = showAnswer && option === question.correctAnswer;
          const isIncorrect =
            showAnswer &&
            selectedAnswer === option &&
            option !== question.correctAnswer;
          const isSelected = selectedAnswer === option;

          return (
            <Button
              key={option}
              variant={isSelected ? "default" : "outline"}
              className={`h-auto py-3 px-4 justify-between ${
                isCorrect
                  ? "bg-green-100 border-green-500 text-green-800"
                  : isIncorrect
                  ? "bg-red-100 border-red-500 text-red-800"
                  : ""
              }`}
              onClick={() => onSelectAnswer && onSelectAnswer(option)}
              disabled={disabled || showAnswer}
            >
              <span>{option}</span>
              {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
              {isIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
