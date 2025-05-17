import React, { useState } from "react";

const AnswerMultipleChoice = ({ options, onSubmit }) => {
  const [answer, setAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const handleSubmit = (option) => {
    console.log(`Button pressed: ${option}`);
    setAnswer(option);
    if (onSubmit) onSubmit(answer);
    setAnswerSubmitted(true);
  };

  const optionSpan = (optionCount) => {
    if (optionCount <= 2) return "col-span-6 row-span-4";
    if (optionCount <= 4) return "col-span-6 row-span-2";
    return "col-span-4 row-span-2";
  };

  return (
    <>
      <form
        className="grid grid-cols-12 grid-rows-4 w-full h-full gap-4 p-4"
        onSubmit={(e) => e.preventDefault()}
      >
        {!answerSubmitted
          ? options.map((option, index) => {
              return (
                <button
                  key={index}
                  className={
                    optionSpan(options.length) +
                    " bg-blue-500 hover:bg-blue-600 text-3xl text-white h-full rounded-2xl"
                  }
                  onClick={() => handleSubmit(option)}
                >
                  {option}
                </button>
              );
            })
          : options.map((option, index) => {
              return (
                <button
                  key={index}
                  className={
                    optionSpan(options.length) +
                    (option === answer ? " bg-blue-500" : " bg-gray-500") +
                    " text-3xl text-white h-full rounded-2xl"
                  }
                  disabled={answerSubmitted}
                >
                  {option}
                </button>
              );
            })}
      </form>
    </>
  );
};

export default AnswerMultipleChoice;
