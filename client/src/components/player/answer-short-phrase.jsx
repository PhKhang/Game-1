import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AnswerShortPhrase = ({ hint, onSubmit }) => {
  const [answer, setAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) onSubmit();
    //TODO process answer
    console.log(answer);
    setAnswerSubmitted(true);
  };

  return (
    <>
      <form
        className="w-full h-full p-4 flex items-center justify-center"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="flex flex-col items-center">
          <textarea
            id="answer"
            className="text-xl border font-mono bg-gray-200 resize-none"
            cols={80}
            rows={5}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={hint}
            required
            disabled={answerSubmitted}
          />
          {!answerSubmitted && (
            <button
              type="submit"
              className="text-xl py-2 px-2 font-mono bg-blue-500 text-white hover:bg-blue-600"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default AnswerShortPhrase;
