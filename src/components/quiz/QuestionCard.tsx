"use client";

import React, { useState } from "react";
import { Question } from "@/types/quiz";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: number | string) => void;
  showFeedback: boolean;
  selectedAnswer: number | string | null;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

const questionTypeBadge: Record<string, { bg: string; text: string; label: string }> = {
  multiple_choice: { bg: "bg-indigo-50", text: "text-indigo-600", label: "Multiple Choice" },
  short_answer: { bg: "bg-cyan-50", text: "text-cyan-600", label: "Short Answer" },
  reading_comprehension: { bg: "bg-amber-50", text: "text-amber-600", label: "Reading" },
  visual_analysis: { bg: "bg-pink-50", text: "text-pink-600", label: "Visual Analysis" },
};

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showFeedback,
  selectedAnswer,
}: QuestionCardProps) {
  const [localAnswer, setLocalAnswer] = useState<number | string | null>(null);

  const handleOptionClick = (optionIndex: number) => {
    if (showFeedback) return;
    setLocalAnswer(optionIndex);
    onAnswer(optionIndex);
  };

  const handleShortAnswerSubmit = (value: string) => {
    if (showFeedback) return;
    onAnswer(value);
  };

  const getOptionClass = (index: number) => {
    const baseClass = "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3";

    if (showFeedback) {
      if (index === question.correctAnswer) {
        return `${baseClass} border-green-500 bg-green-50 text-green-800`;
      }
      if (index === localAnswer && index !== question.correctAnswer) {
        return `${baseClass} border-red-500 bg-red-50 text-red-800`;
      }
      return `${baseClass} border-gray-200 bg-gray-50 text-gray-400`;
    }

    if (localAnswer === index) {
      return `${baseClass} border-purple-500 bg-purple-50 text-purple-800`;
    }
    return `${baseClass} border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50 cursor-pointer`;
  };

  const typeBadge = questionTypeBadge[question.questionType] || questionTypeBadge.multiple_choice;
  const isRichQuestion = question.questionType === "reading_comprehension" || question.questionType === "visual_analysis";
  const hasPassage = !!question.passage;
  const hasImage = !!question.imageUrl;

  return (
    <div className="w-full max-w-2xl mx-auto">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[question.difficulty]}`}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeBadge.bg} ${typeBadge.text}`}>
            {typeBadge.label}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {hasImage && (
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <img
              src={question.imageUrl}
              alt="Question illustration"
              className="w-full max-h-56 object-contain rounded-xl shadow-sm"
            />
          </div>
        )}

        {hasPassage ? (
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 p-6 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Passage</span>
              </div>
              <div className="overflow-y-auto max-h-48 pr-2">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{question.passage}</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
                {question.question}
              </h2>
              {renderAnswerArea()}
            </div>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
              {question.question}
            </h2>
            {renderAnswerArea()}
          </div>
        )}
      </div>

      {showFeedback && (
        <div className={`mt-4 px-6 py-5 rounded-2xl border ${localAnswer === question.correctAnswer ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${localAnswer === question.correctAnswer ? "bg-green-500" : "bg-red-500"}`}>
              {localAnswer === question.correctAnswer ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <p className={`font-semibold ${localAnswer === question.correctAnswer ? "text-green-700" : "text-red-700"}`}>
                {localAnswer === question.correctAnswer ? "Excellent! That's correct!" : "Not quite, but keep trying!"}
              </p>
              <p className="mt-1 text-sm text-gray-600">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderAnswerArea() {
    if (question.questionType === "multiple_choice" && question.options) {
      return (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              className={getOptionClass(index)}
              disabled={showFeedback}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                showFeedback && index === question.correctAnswer
                  ? "bg-green-500 text-white"
                  : showFeedback && index === localAnswer
                  ? "bg-red-500 text-white"
                  : localAnswer === index
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
              {showFeedback && index === question.correctAnswer && (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      );
    }

    if (question.questionType === "short_answer" || isRichQuestion) {
      if (!showFeedback) {
        return (
          <>
            <input
              type="text"
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-lg"
              placeholder="Type your answer..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  handleShortAnswerSubmit(e.currentTarget.value);
                }
              }}
            />
            <p className="mt-2 text-sm text-gray-500">Press Enter to submit</p>
          </>
        );
      }
      return (
        <div className="p-4 rounded-xl bg-gray-100">
          <p className="font-medium">Correct answer: <span className="text-green-600">{question.correctAnswer}</span></p>
        </div>
      );
    }

    return null;
  }
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}