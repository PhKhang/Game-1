import React, { useState, useEffect, useRef } from "react";

const Timer = ({ seconds, onTimeout }) => {
  const [currSeconds, setCurrSeconds] = useState(seconds);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (currSeconds > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      clearTimeout(timeoutRef.current);
      if (onTimeout) onTimeout();
    }

    return () => clearTimeout(timeoutRef.current);
  }, [currSeconds, onTimeout]);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-bold">{formatTime(currSeconds)}</h2>
    </div>
  );
};

export default Timer;
