import { Question, Difficulty } from "@/types/quiz";

export interface SmartScoreState {
  score: number;
  streak: number;
  difficultyLevel: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface AdaptiveQuestion {
  question: Question;
  smartScore: number;
  hint?: string;
  conceptualFocus?: string;
}

const INITIAL_SMART_SCORE = 50;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;
const SCORE_INCREMENT = 10;
const SCORE_DECREMENT = 5;
const STREAK_BONUS_THRESHOLD = 3;
const STREAK_BONUS_MULTIPLIER = 1.5;

export class AdaptiveEngine {
  private questions: Question[];
  private state: SmartScoreState;
  private userLevel: "A" | "B";
  private subject: string;

  constructor(questions: Question[], initialLevel: "A" | "B" = "A", subject: string = "math") {
    this.questions = questions;
    this.userLevel = initialLevel;
    this.subject = subject;
    this.state = {
      score: INITIAL_SMART_SCORE,
      streak: 0,
      difficultyLevel: 3,
      questionsAnswered: 0,
      correctAnswers: 0,
    };
  }

  getState(): SmartScoreState {
    return { ...this.state };
  }

  getSmartScore(): number {
    return this.state.score;
  }

  getDifficultyLevel(): number {
    return this.state.difficultyLevel;
  }

  getQuestionsByDifficulty(difficulty: number): Question[] {
    const difficultyMap: Record<number, Difficulty> = {
      1: "easy",
      2: "easy",
      3: "medium",
      4: "medium",
      5: "medium",
      6: "hard",
      7: "hard",
      8: "hard",
      9: "hard",
      10: "hard",
    };

    const targetDifficulty = difficultyMap[Math.min(Math.max(1, difficulty), 10)] || "medium";

    return this.questions.filter((q) => q.difficulty === targetDifficulty);
  }

  selectNextQuestion(forceLowerDifficulty = false): AdaptiveQuestion | null {
    let targetDifficulty = this.state.difficultyLevel;

    if (forceLowerDifficulty) {
      targetDifficulty = Math.max(MIN_DIFFICULTY, targetDifficulty - 1);
    }

    const availableQuestions = this.getQuestionsByDifficulty(targetDifficulty);

    const unusedQuestions = availableQuestions.filter(
      (q) => !this.wasRecentlyAnswered(q.id)
    );

    if (unusedQuestions.length === 0) {
      const fallbackQuestions = this.questions.filter(
        (q) => !this.wasRecentlyAnswered(q.id)
      );
      if (fallbackQuestions.length === 0) {
        return this.generateAdaptiveQuestion(targetDifficulty);
      }
      const randomFallback = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      return {
        question: randomFallback,
        smartScore: this.state.score,
        conceptualFocus: this.getConceptualFocus(randomFallback),
      };
    }

    const selected = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];

    return {
      question: selected,
      smartScore: this.state.score,
      conceptualFocus: this.getConceptualFocus(selected),
    };
  }

  private generateAdaptiveQuestion(difficulty: number): AdaptiveQuestion | null {
    const targetDifficulty = difficulty <= 3 ? "easy" : difficulty <= 6 ? "medium" : "hard";

    const similarQuestions = this.questions.filter(
      (q) =>
        q.difficulty === targetDifficulty &&
        q.subject === this.subject &&
        q.level === this.userLevel
    );

    if (similarQuestions.length === 0) {
      return null;
    }

    const selected = similarQuestions[Math.floor(Math.random() * similarQuestions.length)];

    return {
      question: selected,
      smartScore: this.state.score,
      conceptualFocus: this.getConceptualFocus(selected),
    };
  }

  private getConceptualFocus(question: Question): string {
    const conceptualMap: Record<string, Record<string, string>> = {
      math: {
        algebra: "Linear equations and unknown variables",
        arithmetic: "Basic operations and number sense",
        geometry: "Shapes, areas, and spatial reasoning",
        sequences: "Number patterns and Fibonacci",
      },
      logic: {
        IL: "Information Literacy and pattern recognition",
        DL: "Data Literacy and binary structures",
        AL: "Algorithmic thinking and step-by-step logic",
        CB: "Computational thinking and abstraction",
        RG: "Regularities and rule discovery",
      },
      physics: {
        mechanics: "Forces, motion, and energy transfer",
        waves: "Sound, light, and wave behavior",
        electricity: "Circuits, current, and resistance",
      },
      chemistry: {
        "atomic-structure": "Electrons, protons, and periodic trends",
        bonding: "Ionic, covalent, and metallic bonds",
        reactions: "Chemical changes and equations",
      },
      english: {
        grammar: "Sentence structure and parts of speech",
        vocabulary: "Word meanings and context clues",
        "figure-of-speech": "Metaphors, similes, and personification",
      },
      science: {
        biology: "Living things and ecosystems",
        earth: "Weather, geology, and environment",
        chemistry: "Materials and their properties",
      },
    };

    if (question.BebrasCategory && conceptualMap.logic) {
      return conceptualMap.logic[question.BebrasCategory] || "Computational thinking";
    }

    const subjectConcepts = conceptualMap[question.subject];
    if (subjectConcepts) {
      for (const [concept, description] of Object.entries(subjectConcepts)) {
        if (question.question.toLowerCase().includes(concept)) {
          return description;
        }
      }
    }

    return "Core concepts and fundamentals";
  }

  private recentQuestionIds: string[] = [];
  private maxRecentQuestions = 5;

  private wasRecentlyAnswered(questionId: string): boolean {
    return this.recentQuestionIds.includes(questionId);
  }

  recordAnswer(questionId: string, isCorrect: boolean): {
    newSmartScore: number;
    newDifficultyLevel: number;
    newStreak: number;
    hint?: string;
    streakBonus?: boolean;
  } {
    this.recentQuestionIds.push(questionId);
    if (this.recentQuestionIds.length > this.maxRecentQuestions) {
      this.recentQuestionIds.shift();
    }

    this.state.questionsAnswered++;

    if (isCorrect) {
      this.state.correctAnswers++;
      this.state.streak++;

      const streakBonus =
        this.state.streak >= STREAK_BONUS_THRESHOLD
          ? STREAK_BONUS_MULTIPLIER
          : 1;

      const previousScore = this.state.score;
      this.state.score = Math.min(
        100,
        this.state.score + Math.round(SCORE_INCREMENT * streakBonus)
      );

      this.state.difficultyLevel = Math.min(
        MAX_DIFFICULTY,
        this.state.difficultyLevel + 1
      );

      return {
        newSmartScore: this.state.score,
        newDifficultyLevel: this.state.difficultyLevel,
        newStreak: this.state.streak,
        streakBonus: this.state.streak >= STREAK_BONUS_THRESHOLD,
      };
    } else {
      const previousStreak = this.state.streak;
      this.state.streak = 0;

      const previousScore = this.state.score;
      this.state.score = Math.max(0, this.state.score - SCORE_DECREMENT);

      this.state.difficultyLevel = Math.max(
        MIN_DIFFICULTY,
        this.state.difficultyLevel - 1
      );

      const hint = this.generateHint(questionId);

      return {
        newSmartScore: this.state.score,
        newDifficultyLevel: this.state.difficultyLevel,
        newStreak: 0,
        hint,
      };
    }
  }

  private generateHint(questionId: string): string {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) {
      return "Review the foundational concepts before attempting this problem.";
    }

    const hintTemplates: Record<Difficulty, string[]> = {
      easy: [
        "Let's break this down into smaller steps.",
        "Try drawing a picture or diagram to visualize the problem.",
        "Count carefully and take your time.",
      ],
      medium: [
        "Look for patterns in the numbers or words.",
        "Try working backwards from the answer choices.",
        "Review the key concept this question is testing.",
      ],
      hard: [
        "Focus on understanding the core principle first.",
        "Try identifying what makes this problem challenging.",
        "Consider breaking this into simpler sub-problems.",
      ],
    };

    const hints = hintTemplates[question.difficulty] || hintTemplates.medium;
    return hints[Math.floor(Math.random() * hints.length)];
  }

  getHintForQuestion(questionId: string): string {
    return this.generateHint(questionId);
  }

  getConceptualStrengths(): Record<string, number> {
    const strengths: Record<string, { correct: number; total: number }> = {};

    this.questions.forEach((q) => {
      const subject = q.subject;
      if (!strengths[subject]) {
        strengths[subject] = { correct: 0, total: 0 };
      }
    });

    return Object.fromEntries(
      Object.entries(strengths).map(([subject, data]) => [
        subject,
        data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      ])
    );
  }

  reset(): void {
    this.state = {
      score: INITIAL_SMART_SCORE,
      streak: 0,
      difficultyLevel: 3,
      questionsAnswered: 0,
      correctAnswers: 0,
    };
    this.recentQuestionIds = [];
  }
}

export function createAdaptiveEngine(
  questions: Question[],
  level: "A" | "B",
  subject: string
): AdaptiveEngine {
  return new AdaptiveEngine(questions, level, subject);
}
