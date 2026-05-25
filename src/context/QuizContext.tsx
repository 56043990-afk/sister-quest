"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { Question, QuizState, UserProgress } from "@/types/quiz";
import { USERS } from "@/types/user";

interface QuizContextType {
  state: QuizState;
  userProgress: UserProgress;
  startQuiz: (questions: Question[], userId: string) => void;
  answerQuestion: (answer: number | string) => boolean;
  nextQuestion: () => void;
  resetQuiz: () => void;
  addTime: (seconds: number) => void;
}

const initialQuizState: QuizState = {
  currentQuestionIndex: 0,
  questions: [],
  answers: [],
  score: 0,
  streak: 0,
  difficultyLevel: 2,
  timeSpent: 0,
  isComplete: false,
  showFeedback: false,
  lastAnswerCorrect: null,
};

const initialUserProgress: UserProgress = {
  userId: "pink",
  totalPoints: 0,
  dailyMinutes: 0,
  dailyQuestionsAnswered: 0,
  streak: 7,
  badges: [],
  subjectProgress: {},
};

type QuizAction =
  | { type: "START_QUIZ"; payload: { questions: Question[]; userId: string } }
  | { type: "ANSWER_QUESTION"; payload: { answer: number | string; isCorrect: boolean } }
  | { type: "NEXT_QUESTION" }
  | { type: "RESET_QUIZ" }
  | { type: "ADD_TIME"; payload: number }
  | { type: "SHOW_FEEDBACK"; payload: boolean };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "START_QUIZ":
      return {
        ...initialQuizState,
        questions: action.payload.questions,
        answers: new Array(action.payload.questions.length).fill(null),
      };
    case "ANSWER_QUESTION": {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const newAnswers = [...state.answers];
      newAnswers[state.currentQuestionIndex] = action.payload.answer;
      return {
        ...state,
        answers: newAnswers,
        showFeedback: true,
        lastAnswerCorrect: action.payload.isCorrect,
        score: action.payload.isCorrect
          ? state.score + calculatePoints(currentQuestion, state.difficultyLevel)
          : state.score,
        streak: action.payload.isCorrect ? state.streak + 1 : 0,
        difficultyLevel: action.payload.isCorrect
          ? Math.min(5, state.difficultyLevel + 1)
          : Math.max(1, state.difficultyLevel - 1),
      };
    }
    case "NEXT_QUESTION": {
      const nextIndex = state.currentQuestionIndex + 1;
      const isComplete = nextIndex >= state.questions.length;
      return {
        ...state,
        currentQuestionIndex: isComplete ? state.currentQuestionIndex : nextIndex,
        isComplete,
        showFeedback: false,
        lastAnswerCorrect: null,
      };
    }
    case "RESET_QUIZ":
      return initialQuizState;
    case "ADD_TIME":
      return { ...state, timeSpent: state.timeSpent + action.payload };
    case "SHOW_FEEDBACK":
      return { ...state, showFeedback: action.payload };
    default:
      return state;
  }
}

function calculatePoints(question: Question, difficultyLevel: number): number {
  const basePoints = question.points;
  const difficultyMultiplier = difficultyLevel / 3;
  return Math.round(basePoints * difficultyMultiplier);
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [userProgress, setUserProgress] = React.useState<UserProgress>(initialUserProgress);

  const startQuiz = useCallback((questions: Question[], userId: string) => {
    dispatch({ type: "START_QUIZ", payload: { questions, userId } });
    setUserProgress((prev) => ({ ...prev, userId }));
  }, []);

  const answerQuestion = useCallback((answer: number | string): boolean => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return false;

    let isCorrect = false;
    if (currentQuestion.questionType === "multiple_choice") {
      isCorrect = answer === currentQuestion.correctAnswer;
    } else {
      isCorrect = String(answer).toLowerCase().trim() === String(currentQuestion.correctAnswer).toLowerCase().trim();
    }

    dispatch({ type: "ANSWER_QUESTION", payload: { answer, isCorrect } });

    setUserProgress((prev) => ({
      ...prev,
      dailyQuestionsAnswered: prev.dailyQuestionsAnswered + 1,
      totalPoints: isCorrect
        ? prev.totalPoints + calculatePoints(currentQuestion, state.difficultyLevel)
        : prev.totalPoints,
      subjectProgress: {
        ...prev.subjectProgress,
        [currentQuestion.subject]: {
          questionsAnswered: (prev.subjectProgress[currentQuestion.subject]?.questionsAnswered || 0) + 1,
          correctAnswers: (prev.subjectProgress[currentQuestion.subject]?.correctAnswers || 0) + (isCorrect ? 1 : 0),
          averageDifficulty: state.difficultyLevel,
        },
      },
    }));

    return isCorrect;
  }, [state.questions, state.currentQuestionIndex, state.difficultyLevel]);

  const nextQuestion = useCallback(() => {
    dispatch({ type: "NEXT_QUESTION" });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: "RESET_QUIZ" });
  }, []);

  const addTime = useCallback((seconds: number) => {
    dispatch({ type: "ADD_TIME", payload: seconds });
  }, []);

  return (
    <QuizContext.Provider
      value={{
        state,
        userProgress,
        startQuiz,
        answerQuestion,
        nextQuestion,
        resetQuiz,
        addTime,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
