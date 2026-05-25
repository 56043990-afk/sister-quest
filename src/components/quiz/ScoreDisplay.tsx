"use client";

import React from "react";
import { Flame, Zap, Target } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  streak: number;
  difficultyLevel: number;
}

export function ScoreDisplay({ score, streak, difficultyLevel }: ScoreDisplayProps) {
  const getDifficultyLabel = (level: number) => {
    if (level <= 1) return { label: "Beginner", color: "text-green-500", bg: "bg-green-100" };
    if (level === 2) return { label: "Easy", color: "text-lime-500", bg: "bg-lime-100" };
    if (level === 3) return { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-100" };
    if (level === 4) return { label: "Hard", color: "text-orange-500", bg: "bg-orange-100" };
    return { label: "Expert", color: "text-red-500", bg: "bg-red-100" };
  };

  const difficulty = getDifficultyLabel(difficultyLevel);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md">
        <Zap className="w-5 h-5 text-purple-500" />
        <span className="font-bold text-gray-800">{score}</span>
        <span className="text-sm text-gray-500">pts</span>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full shadow-md">
        <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500 animate-pulse" : "text-gray-400"}`} />
        <span className="font-bold text-orange-600">{streak}</span>
        <span className="text-sm text-orange-500">streak</span>
      </div>

      <div className={`flex items-center gap-2 px-4 py-2 ${difficulty.bg} rounded-full shadow-md`}>
        <Target className={`w-5 h-5 ${difficulty.color}`} />
        <span className={`font-semibold ${difficulty.color}`}>{difficulty.label}</span>
      </div>
    </div>
  );
}
