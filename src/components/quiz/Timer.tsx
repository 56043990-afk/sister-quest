"use client";

import React, { useEffect, useRef } from "react";

interface TimerProps {
  seconds: number;
  onTick: (seconds: number) => void;
  isRunning: boolean;
  dailyGoalSeconds?: number;
}

export function Timer({ seconds, onTick, isRunning, dailyGoalSeconds = 1800 }: TimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        onTick(seconds + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onTick]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min((seconds / dailyGoalSeconds) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md">
        <svg
          className={`w-5 h-5 ${isRunning ? "text-purple-500" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeLinecap="round" strokeWidth="2" d="M12 6v6l4 2" />
        </svg>
        <span className="font-mono text-lg font-bold text-gray-800">
          {formatTime(seconds)}
        </span>
        <span className="text-sm text-gray-500">/ {formatTime(dailyGoalSeconds)}</span>
      </div>
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {seconds >= dailyGoalSeconds ? "Daily goal reached! 🎉" : `${Math.round(progressPercent)}% of daily goal`}
      </span>
    </div>
  );
}
