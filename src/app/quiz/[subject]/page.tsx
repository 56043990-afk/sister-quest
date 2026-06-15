"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Question } from "@/types/quiz";
import { USERS } from "@/types/user";
import { AdaptiveEngine, createAdaptiveEngine } from "@/lib/adaptiveEngine";
import {
  fetchQuestions,
  updateSmartScore,
  addToErrorBook,
  initializeUser,
  getSmartScore,
  fetchErrorBookBySubject,
} from "@/lib/dataService";
import { getActiveUserId, subscribeActiveUser } from "@/lib/activeUser";
import { Timer } from "@/components/quiz/Timer";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import { ScoreDisplay } from "@/components/quiz/ScoreDisplay";
import {
  ArrowLeft,
  Brain,
  Zap,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const subjectEmojis: Record<string, string> = {
  math: "🔢",
  english: "📚",
  science: "🔬",
  physics: "⚡",
  chemistry: "🧪",
  logic: "🧠",
  history: "🏛️",
};

const subjectNames: Record<string, string> = {
  math: "Mathematics",
  english: "English",
  science: "Science",
  physics: "Physics",
  chemistry: "Chemistry",
  logic: "Computational Logic",
  history: "History Quest",
};

interface QuizSessionState {
  currentQuestion: Question | null;
  questionIndex: number;
  score: number;
  streak: number;
  smartScore: number;
  difficultyLevel: number;
  isComplete: boolean;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
  selectedAnswer: number | string | null;
  correctCount: number;
  totalAnswered: number;
  hint: string | null;
  streakBonus: boolean;
  addedToErrorBook: boolean;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const subject = (params.subject as string).toLowerCase();

  const [userId, setUserId] = useState<string>(getActiveUserId());
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [engine, setEngine] = useState<AdaptiveEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorBookCount, setErrorBookCount] = useState(0);
  const [sessionState, setSessionState] = useState<QuizSessionState>({
    currentQuestion: null,
    questionIndex: 0,
    score: 0,
    streak: 0,
    smartScore: 50,
    difficultyLevel: 3,
    isComplete: false,
    showFeedback: false,
    lastAnswerCorrect: null,
    selectedAnswer: null,
    correctCount: 0,
    totalAnswered: 0,
    hint: null,
    streakBonus: false,
    addedToErrorBook: false,
  });

  const totalQuestions = 5;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setUserId(getActiveUserId());
    const unsub = subscribeActiveUser((id) => setUserId(id));
    return unsub;
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await initializeUser(userId);
        const count = await fetchErrorBookBySubject(userId, subject);
        setErrorBookCount(count.length);
      } catch (err) {
        console.error("Failed to initialize:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) init();
  }, [userId, subject]);

  const initializeEngine = useCallback(
    async (questions: Question[]) => {
      const level = userId === "pink" ? "A" : "B";
      const subjectQuestions = questions.filter((q) => q.subject === subject);

      if (subjectQuestions.length === 0) {
        return null;
      }

      return createAdaptiveEngine(subjectQuestions, level, subject);
    },
    [userId, subject]
  );

  const startQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const level = userId === "pink" ? "A" : "B";
      let questions = await fetchQuestions(level, subject);

      if (questions.length === 0) {
        setLoading(false);
        return;
      }

      // ====== 终极手术：彻底粉碎“难度窄区间过滤限制”！让该学科下的所有定制新题目全部释放！ ======
      // 不再使用 targetDifficulty 和 difficultyBand 过滤，直接使用该学科的所有题目进行洗牌抽题
      
      // 全量随机洗牌，保证每次抽出的 5 道题绝不重复、顺序随机
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }

      let smartScore = 50;
      try {
        smartScore = await getSmartScore(userId, subject);
      } catch { /* use default */ }

      const newEngine = await initializeEngine(questions);
      if (!newEngine) {
        setLoading(false);
        return;
      }

      setEngine(newEngine);

      const firstQuestion = newEngine.selectNextQuestion();
      const initialDifficultyLevel = Math.max(1, Math.min(10, Math.round(smartScore / 10)));

      setSessionState({
        currentQuestion: firstQuestion?.question || null,
        questionIndex: 0,
        score: 0,
        streak: 0,
        smartScore: smartScore || initialDifficultyLevel * 10,
        difficultyLevel: initialDifficultyLevel,
        isComplete: false,
        showFeedback: false,
        lastAnswerCorrect: null,
        selectedAnswer: null,
        correctCount: 0,
        totalAnswered: 0,
        hint: firstQuestion?.question?.explanation || null, 
        streakBonus: false,
        addedToErrorBook: false,
      });

      setQuizStarted(true);
      setTimeSpent(0);

      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start quiz:", err);
    } finally {
      setLoading(false);
    }
  }, [initializeEngine, subject, userId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAnswer = useCallback(
    async (answer: number | string) => {
      if (!engine || !sessionState.currentQuestion || sessionState.showFeedback)
        return;

      let isCorrect = false;
      const question = sessionState.currentQuestion;

      if (question.questionType === "multiple_choice") {
        isCorrect = answer === question.correctAnswer;
      } else {
        isCorrect =
          String(answer).toLowerCase().trim() ===
          String(question.correctAnswer).toLowerCase().trim();
      }

      const result = engine.recordAnswer(question.id, isCorrect);

      const pointsEarned = isCorrect
        ? Math.round(question.points * (sessionState.difficultyLevel / 3))
        : 0;

      updateSmartScore(userId, subject, result.newSmartScore).catch(
        console.error
      );

      setSessionState((prev) => ({
        ...prev,
        showFeedback: true,
        lastAnswerCorrect: isCorrect,
        selectedAnswer: answer,
        score: prev.score + pointsEarned,
        streak: result.newStreak,
        smartScore: result.newSmartScore,
        difficultyLevel: result.newDifficultyLevel,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        totalAnswered: prev.totalAnswered + 1,
        hint: question.explanation || result.hint || null, 
        streakBonus: result.streakBonus || false,
        addedToErrorBook: false,
      }));

      if (!isCorrect && !sessionState.addedToErrorBook) {
        addToErrorBook(userId, question).catch(console.error);
        setSessionState((prev) => ({ ...prev, addedToErrorBook: true }));
      }
    },
    [
      engine,
      sessionState.currentQuestion,
      sessionState.showFeedback,
      sessionState.difficultyLevel,
      sessionState.addedToErrorBook,
      userId,
      subject,
    ]
  );

  const handleNext = useCallback(() => {
    if (!engine) return;

    const nextQuestion = engine.selectNextQuestion();
    const newIndex = sessionState.questionIndex + 1;

    if (newIndex >= totalQuestions || !nextQuestion) {
      setSessionState((prev) => ({
        ...prev,
        isComplete: true,
      }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    setSessionState((prev) => ({
      ...prev,
      currentQuestion: nextQuestion.question,
      questionIndex: newIndex,
      showFeedback: false,
      lastAnswerCorrect: null,
      selectedAnswer: null,
      hint: nextQuestion.question.explanation || null, 
      streakBonus: false,
      addedToErrorBook: false,
    }));
  }, [engine, sessionState.questionIndex]);

  const handleRetry = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setQuizStarted(false);
    setSessionState({
      currentQuestion: null,
      questionIndex: 0,
      score: 0,
      streak: 0,
      smartScore: 50,
      difficultyLevel: 3,
      isComplete: false,
      showFeedback: false,
      lastAnswerCorrect: null,
      selectedAnswer: null,
      correctCount: 0,
      totalAnswered: 0,
      hint: null,
      streakBonus: false,
      addedToErrorBook: false,
    });
    setTimeSpent(0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!quizStarted) {
    const user = USERS.find((u) => u.id === userId) || USERS[0];
    const level = userId === "pink" ? "A" : "B";

    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-md w-full text-center">
          <div className="text-8xl mb-6">{subjectEmojis[subject] || "📖"}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            {subjectNames[subject] || subject}
          </h1>
          <p className="text-gray-500 mb-8">Adaptive Learning Quest</p>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200/50 p-8 mb-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-4xl">{user.avatar}</span>
              <div className="text-left">
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Level {level}</p>
              </div>
            </div>

            {errorBookCount > 0 && (
              <Link
                href="/review"
                className="flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  You have {errorBookCount} questions to review!
                </span>
              </Link>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Questions</span>
                <span className="font-bold text-indigo-600">5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Daily Goal</span>
                <span className="font-bold text-indigo-600">30 min</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  <span className="text-gray-600">SmartScore</span>
                </div>
                <span className="font-bold text-indigo-600">Adaptive</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    How SmartScore Works
                  </p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>• Correct answers increase difficulty</li>
                    <li>• Wrong answers go to your Error Book</li>
                    <li>• Build streaks for bonus points</li>
                    <li>• Review mistakes on weekends</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-lg"
            >
              Start Adaptive Quiz
            </button>
          </div>

          <Link
            href={`/${userId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (sessionState.isComplete || !sessionState.currentQuestion) {
    return (
      <QuizComplete
        score={sessionState.score}
        totalQuestions={totalQuestions}
        correctAnswers={sessionState.correctCount}
        timeSpent={timeSpent}
        subject={subject}
        userId={userId}
        onRetry={handleRetry}
      />
    );
  }

  const smartScoreColor =
    sessionState.smartScore >= 70
      ? "text-green-500"
      : sessionState.smartScore >= 40
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/${userId}`}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Quiz
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-gray-200/50">
              <Brain className={`w-5 h-5 ${smartScoreColor}`} />
              <span className={`font-bold ${smartScoreColor}`}>
                {sessionState.smartScore}
              </span>
              <span className="text-sm text-gray-500">SmartScore</span>
            </div>
          </div>

          <Timer
            seconds={timeSpent}
            onTick={(t) => setTimeSpent(t)}
            isRunning={!sessionState.isComplete && !sessionState.showFeedback}
            dailyGoalSeconds={1800}
          />
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <ScoreDisplay
            score={sessionState.score}
            streak={sessionState.streak}
            difficultyLevel={sessionState.difficultyLevel}
          />
        </div>

        {sessionState.streakBonus && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold animate-pulse">
              <Zap className="w-4 h-4" />
              Streak Bonus Active! 1.5x Points
            </span>
          </div>
        )}

        <QuestionCard
          question={sessionState.currentQuestion}
          questionNumber={sessionState.questionIndex + 1}
          totalQuestions={totalQuestions}
          onAnswer={handleAnswer}
          showFeedback={sessionState.showFeedback}
          selectedAnswer={sessionState.selectedAnswer}
        />

        {sessionState.showFeedback && sessionState.hint && (
          <div className={`mt-4 p-5 rounded-2xl border transition-all duration-300 ${
            sessionState.lastAnswerCorrect 
              ? "bg-emerald-50/80 border-emerald-200/60" 
              : "bg-indigo-50/80 border-indigo-200/60"
          }`}>
            <div className="flex items-start gap-3">
              <BookOpen className={`w-5 h-5 mt-0.5 ${sessionState.lastAnswerCorrect ? "text-emerald-500" : "text-indigo-500"}`} />
              <div>
                <p className={`font-bold text-base ${sessionState.lastAnswerCorrect ? "text-emerald-800" : "text-indigo-800"}`}>
                  {sessionState.lastAnswerCorrect ? "Excellent! Explanation" : "Learning Moment: Explanation"}
                </p>
                <p className={`text-sm mt-1 leading-relaxed ${sessionState.lastAnswerCorrect ? "text-emerald-700" : "text-indigo-700"}`}>
                  {sessionState.hint}
                </p>
                {!sessionState.lastAnswerCorrect && (
                  <p className="text-xs text-indigo-400 mt-3 font-medium">
                    📍 This question has been safely added to your Error Book for weekend review.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {sessionState.showFeedback && (
          <div className="mt-8 text-center">
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-lg"
            >
              {sessionState.questionIndex < totalQuestions - 1
                ? "Next Question"
                : "See Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

async function fetchErrorBookCount(userId: string): Promise<number> {
  const { fetchErrorBook } = await import("@/lib/dataService");
  const book = await fetchErrorBook(userId);
  return book.length;
}
