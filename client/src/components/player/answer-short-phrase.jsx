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
        className="w-full h-full flex items-center justify-center"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="flex flex-row items-center">
          <textarea
            id="answer"
            className="text-xl border font-mono bg-gray-200 resize-none rounded-2xl p-2"
            cols={80}
            rows={5}
            
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={hint}
            required
            disabled={answerSubmitted}
          />
          {!answerSubmitted && (
            <button
              type="submit"
              className="text-xl py-2 px-2 font-mono bg-blue-600 text-white hover:bg-blue-700 rounded-2xl ml-2"
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
