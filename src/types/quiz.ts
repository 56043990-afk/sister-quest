export type Difficulty = "easy" | "medium" | "hard";
export type Level = "A" | "B";
export type QuestionType = "multiple_choice" | "short_answer" | "reading_comprehension" | "visual_analysis";

export interface Question {
  id: string;
  subject: string;
  level: Level;
  question: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: Difficulty;
  difficultyLevel?: number;
  points: number;
  BebrasCategory?: "IL" | "DL" | "AL" | "CB" | "RG";
  imageUrl?: string;
  passage?: string;
  tags?: string[];
}

export interface QuizState {
  currentQuestionIndex: number;
  questions: Question[];
  answers: (number | string | null)[];
  score: number;
  streak: number;
  difficultyLevel: number;
  timeSpent: number;
  isComplete: boolean;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  dailyMinutes: number;
  dailyQuestionsAnswered: number;
  streak: number;
  badges: Badge[];
  subjectProgress: Record<string, SubjectProgress>;
}

export interface SubjectProgress {
  questionsAnswered: number;
  correctAnswers: number;
  averageDifficulty: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface DailySession {
  date: string;
  userId: string;
  subject: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  pointsEarned: number;
}
