"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Question } from "@/types/quiz";
import {
  fetchErrorBook,
  removeFromErrorBook,
  markErrorReviewed,
  isWeekend,
  getWeekendLabel,
  ErrorBookEntry,
} from "@/lib/dataService";
import { getActiveUserId, subscribeActiveUser } from "@/lib/activeUser";
import { USERS } from "@/types/user";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Sparkles,
  Filter,
} from "lucide-react";

interface ReviewState {
  currentIndex: number;
  showFeedback: boolean;
  selectedAnswer: number | string | null;
  correctCount: number;
  reviewedCount: number;
  totalCount: number;
  isComplete: boolean;
}

const subjectFilters = ["all", "math", "english", "science", "logic", "physics", "chemistry"];

export default function ReviewPage() {
  const params = useParams();
  const subjectParam = params.subject as string | undefined;
  const [userId, setUserId] = useState<string>("pink");
  const [errorBook, setErrorBook] = useState<ErrorBookEntry[]>([]);
  const [filteredErrorBook, setFilteredErrorBook] = useState<ErrorBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>({
    currentIndex: 0,
    showFeedback: false,
    selectedAnswer: null,
    correctCount: 0,
    reviewedCount: 0,
    totalCount: 0,
    isComplete: false,
  });
  const [, setIsWeekendDay] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(subjectParam || "all");

  useEffect(() => {
    setUserId(getActiveUserId());
    const unsub = subscribeActiveUser((id) => {
      setUserId(id);
      setActiveFilter("all");
    });
    return unsub;
  }, []);

  useEffect(() => {
    async function loadErrorBook() {
      if (!userId) return;
      try {
        setIsWeekendDay(isWeekend());
        const allBook = await fetchErrorBook(userId);
        const filtered = activeFilter === "all"
          ? allBook
          : allBook.filter((entry) => entry.question.subject === activeFilter);
        setErrorBook(allBook);
        setFilteredErrorBook(filtered);
        setReviewState((prev) => ({
          ...prev,
          totalCount: filtered.length,
          currentIndex: 0,
        }));
        setCurrentQuestion(filtered.length > 0 ? filtered[0].question : null);
      } catch (err) {
        console.error("Failed to load error book:", err);
      } finally {
        setLoading(false);
      }
    }
    loadErrorBook();
  }, [userId, activeFilter]);

  const handleAnswer = useCallback(
    async (answer: number | string) => {
      if (!currentQuestion || reviewState.showFeedback) return;

      let isCorrect = false;
      if (currentQuestion.questionType === "multiple_choice") {
        isCorrect = answer === currentQuestion.correctAnswer;
      } else {
        isCorrect =
          String(answer).toLowerCase().trim() ===
          String(currentQuestion.correctAnswer).toLowerCase().trim();
      }

      setReviewState((prev) => ({
        ...prev,
        showFeedback: true,
        selectedAnswer: answer,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        reviewedCount: prev.reviewedCount + 1,
      }));

      await markErrorReviewed(userId, currentQuestion.id);
    },
    [currentQuestion, reviewState.showFeedback, userId]
  );

  const handleNext = useCallback(async () => {
    const nextIndex = reviewState.currentIndex + 1;

    if (nextIndex >= filteredErrorBook.length) {
      setReviewState((prev) => ({ ...prev, isComplete: true }));
      return;
    }

    setReviewState((prev) => ({
      ...prev,
      currentIndex: nextIndex,
      showFeedback: false,
      selectedAnswer: null,
    }));

    setCurrentQuestion(filteredErrorBook[nextIndex].question);
  }, [reviewState.currentIndex, filteredErrorBook]);

  const handleRemoveAndNext = useCallback(
    async (questionId: string) => {
      await removeFromErrorBook(userId, questionId);

      const newBook = filteredErrorBook.filter((entry) => entry.question.id !== questionId);
      setFilteredErrorBook(newBook);

      if (newBook.length === 0) {
        setReviewState((prev) => ({
          ...prev,
          isComplete: true,
          totalCount: 0,
        }));
        setCurrentQuestion(null);
        return;
      }

      const nextIndex = Math.min(reviewState.currentIndex, newBook.length - 1);
      setReviewState((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        showFeedback: false,
        selectedAnswer: null,
        totalCount: newBook.length,
      }));

      setCurrentQuestion(newBook[nextIndex].question);
    },
    [userId, filteredErrorBook, reviewState.currentIndex]
  );

  const currentUser = USERS.find((u) => u.id === userId) || USERS[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (filteredErrorBook.length === 0 && !reviewState.isComplete) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            All Caught Up!
          </h1>
          <p className="text-gray-500 mb-8">
            You don&apos;t have any questions to review. Keep learning and building your error book for the weekend!
          </p>
          <Link
            href={`/${userId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (reviewState.isComplete) {
    const accuracy =
      reviewState.totalCount > 0
        ? Math.round(
            (reviewState.correctCount / reviewState.reviewedCount) * 100
          )
        : 0;

    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Review Complete!
          </h1>
          <p className="text-gray-500 mb-8">
            Great work reinforcing your knowledge!
          </p>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-600">
                  {reviewState.correctCount}
                </div>
                <div className="text-sm text-green-600">Correct</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-600">
                  {reviewState.reviewedCount - reviewState.correctCount}
                </div>
                <div className="text-sm text-red-600">Needs Work</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600">
                {accuracy}%
              </div>
              <div className="text-sm text-indigo-600">Accuracy</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/${userId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {subjectFilters.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveFilter(subject)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeFilter === subject
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {subject === "all" ? "All Subjects" : subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/${userId}`}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Review
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-gray-200/50">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-gray-800">
                {reviewState.currentIndex + 1} / {reviewState.totalCount}
              </span>
              <span className="text-sm text-gray-500">Error Book</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              {getWeekendLabel()} Review
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Reinforcement Mode
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Reviewing mistakes from {currentUser.name}&apos;s Error Book — no penalties, just learning!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {reviewState.currentIndex + 1}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentQuestion.difficulty === "easy"
                  ? "bg-green-100 text-green-700"
                  : currentQuestion.difficulty === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {currentQuestion.questionType === "multiple_choice" &&
            currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const isSelected = index === reviewState.selectedAnswer;

                  let optionClass =
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 cursor-pointer";

                  if (reviewState.showFeedback) {
                    if (isCorrect) {
                      optionClass +=
                        " border-green-500 bg-green-50 text-green-800";
                    } else if (isSelected) {
                      optionClass +=
                        " border-red-500 bg-red-50 text-red-800";
                    } else {
                      optionClass +=
                        " border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed";
                    }
                  } else {
                    optionClass +=
                      " border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        !reviewState.showFeedback && handleAnswer(index)
                      }
                      disabled={reviewState.showFeedback}
                      className={optionClass}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          reviewState.showFeedback && isCorrect
                            ? "bg-green-500 text-white"
                            : reviewState.showFeedback && isSelected && !isCorrect
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {reviewState.showFeedback && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {reviewState.showFeedback && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
        </div>

        {reviewState.showFeedback && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/50 mb-6">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl ${
                  reviewState.selectedAnswer === currentQuestion.correctAnswer
                    ? "bg-green-100"
                    : "bg-amber-100"
                }`}
              >
                {reviewState.selectedAnswer ===
                currentQuestion.correctAnswer ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    reviewState.selectedAnswer === currentQuestion.correctAnswer
                      ? "text-green-700"
                      : "text-amber-700"
                  }`}
                >
                  {reviewState.selectedAnswer ===
                  currentQuestion.correctAnswer
                    ? "You got it!"
                    : "Let's reinforce this concept"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {reviewState.showFeedback && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleRemoveAndNext(currentQuestion.id)}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Reviewed
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              Continue
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}