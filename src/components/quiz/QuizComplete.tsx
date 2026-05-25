"use client";

import React from "react";
import Link from "next/link";

interface QuizCompleteProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  subject: string;
  userId: string;
  onRetry: () => void;
}

export function QuizComplete({
  score,
  totalQuestions,
  correctAnswers,
  timeSpent,
  subject,
  userId,
  onRetry,
}: QuizCompleteProps) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", emoji: "🌟", message: "Outstanding! You're a genius!" };
    if (percentage >= 80) return { grade: "A", emoji: "🎉", message: "Excellent work!" };
    if (percentage >= 70) return { grade: "B", emoji: "👏", message: "Great job!" };
    if (percentage >= 60) return { grade: "C", emoji: "💪", message: "Good effort!" };
    if (percentage >= 50) return { grade: "D", emoji: "📚", message: "Keep practicing!" };
    return { grade: "Keep trying!", emoji: "🎯", message: "Practice makes perfect!" };
  };

  const { grade, emoji, message } = getGrade();

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full text-center">
        <div className="text-8xl mb-6 animate-bounce">{emoji}</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
        <p className="text-xl text-gray-600 mb-8">{message}</p>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-6xl font-bold text-purple-600 mb-2">{grade}</div>
          <p className="text-gray-500 mb-6">{percentage}% correct</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-green-600">Correct</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-red-600">Incorrect</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{score}</div>
              <div className="text-sm text-purple-600">Points Earned</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
              <div className="text-sm text-blue-600">Time Spent</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            Try Again
          </button>
          <Link
            href={`/${userId}`}
            className="flex-1 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 border-2 border-purple-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
