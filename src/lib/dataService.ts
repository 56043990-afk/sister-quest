/**
 * Data Service - Unified data layer for SisterQuest
 *
 * This service abstracts all data fetching and state saving.
 * Uses Cloud Firestore for persistence.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import { Question } from "@/types/quiz";

export interface UserProgress {
  userId: string;
  totalPoints: number;
  dailyMinutes: number;
  dailyQuestionsAnswered: number;
  streak: number;
  lastActiveDate: string;
  nickname?: string;
  gradeLevel?: string;
  achievements?: string;
  targetSubjects?: string[];
  adaptiveLevel?: "A" | "B";
  smartScores?: Record<string, number>;
  errorBook?: ErrorBookEntry[];
}

export interface ErrorBookEntry {
  question: Question;
  timestamp: number;
  answeredAt: string;
  timesReviewed: number;
  lastReviewedAt: string | null;
}

export async function fetchQuestions(
  level?: "A" | "B",
  subject?: string
): Promise<Question[]> {
  const constraints: QueryConstraint[] = [];

  if (level) {
    constraints.push(where("level", "==", level));
  }
  if (subject) {
    constraints.push(where("subject", "==", subject));
  }

  const finalQuery =
    constraints.length > 0
      ? query(collection(db, "questions"), ...constraints)
      : query(collection(db, "questions"));

  const snapshot = await getDocs(finalQuery);
  return snapshot.docs.map((d) => d.data() as Question);
}

export async function getUserProgressDoc(userId: string): Promise<UserProgress | null> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserProgress) : null;
}

export async function initializeUser(userId: string): Promise<void> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      userId,
      totalPoints: 0,
      dailyMinutes: 0,
      dailyQuestionsAnswered: 0,
      streak: 0,
      lastActiveDate: new Date().toISOString().split("T")[0],
      smartScores: { math: 50, english: 50, science: 50, logic: 50, physics: 50, chemistry: 50 },
      errorBook: [],
    });
  }
}

export async function initializeUserWithData(userId: string, data: {
  nickname: string;
  gradeLevel: string;
  achievements?: string;
  targetSubjects: string[];
  adaptiveLevel: "A" | "B";
  streak?: number;
}): Promise<void> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      userId,
      nickname: data.nickname,
      gradeLevel: data.gradeLevel,
      achievements: data.achievements || "",
      targetSubjects: data.targetSubjects,
      adaptiveLevel: data.adaptiveLevel,
      totalPoints: 0,
      dailyMinutes: 0,
      dailyQuestionsAnswered: 0,
      streak: data.streak || 0,
      lastActiveDate: new Date().toISOString().split("T")[0],
      smartScores: { math: 50, english: 50, science: 50, logic: 50, physics: 50, chemistry: 50 },
      errorBook: [],
    });
  }
}

export async function updateSmartScore(
  userId: string,
  subject: string,
  newScore: number
): Promise<void> {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, {
    [`smartScores.${subject}`]: newScore,
  });
}

export async function getSmartScore(userId: string, subject: string): Promise<number> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return (data.smartScores && data.smartScores[subject]) || 50;
  }
  return 50;
}

export async function getAllSmartScores(userId: string): Promise<Record<string, number>> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.smartScores || { math: 50, english: 50, science: 50, logic: 50, physics: 50, chemistry: 50 };
  }
  return { math: 50, english: 50, science: 50, logic: 50, physics: 50, chemistry: 50 };
}
export async function addToErrorBook(
  userId: string,
  question: Question
): Promise<void> {
  const docRef = doc(db, "users", userId);

  await initializeUser(userId);

  const entry: ErrorBookEntry = {
    question,
    timestamp: Date.now(),
    answeredAt: new Date().toISOString(),
    timesReviewed: 0,
    lastReviewedAt: null,
  };

  await updateDoc(docRef, {
    errorBook: arrayUnion(entry),
  });
}

export async function fetchErrorBook(userId: string): Promise<ErrorBookEntry[]> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return (docSnap.data().errorBook as ErrorBookEntry[]) || [];
  }
  return [];
}

export async function removeFromErrorBook(
  userId: string,
  questionId: string
): Promise<void> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const filtered = (data.errorBook as ErrorBookEntry[]).filter(
      (entry: ErrorBookEntry) => entry.question.id !== questionId
    );
    await updateDoc(docRef, { errorBook: filtered });
  }
}

export async function markErrorReviewed(
  userId: string,
  questionId: string
): Promise<void> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const entries = data.errorBook as ErrorBookEntry[];
    const updated = entries.map((entry: ErrorBookEntry) =>
      entry.question.id === questionId
        ? { ...entry, timesReviewed: entry.timesReviewed + 1, lastReviewedAt: new Date().toISOString() }
        : entry
    );
    await updateDoc(docRef, { errorBook: updated });
  }
}

export async function getErrorBookCount(userId: string): Promise<number> {
  const book = await fetchErrorBook(userId);
  return book.length;
}

export async function fetchErrorBookBySubject(userId: string, subject: string): Promise<ErrorBookEntry[]> {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const allEntries = (data.errorBook as ErrorBookEntry[]) || [];
    // Strict filter: only entries for the exact subject
    return allEntries.filter((entry) => entry.question.subject === subject);
  }
  return [];
}

export async function getErrorBookCountBySubject(userId: string): Promise<Record<string, number>> {
  const book = await fetchErrorBook(userId);
  const counts: Record<string, number> = {};
  book.forEach((entry) => {
    const subject = entry.question.subject;
    counts[subject] = (counts[subject] || 0) + 1;
  });
  return counts;
}
export function getCurrentUser(): string {
  if (typeof window === "undefined") return "pink";
  try {
    const stored = localStorage.getItem("sisterquest_user");
    return stored || "pink";
  } catch {
    return "pink";
  }
}

export function setCurrentUser(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sisterquest_user", userId);
  } catch {}
}

export function getUserProgress(userId: string): UserProgress {
  if (typeof window === "undefined") {
    return { userId, totalPoints: 0, dailyMinutes: 0, dailyQuestionsAnswered: 0, streak: 0, lastActiveDate: new Date().toISOString().split("T")[0] };
  }
  try {
    const stored = localStorage.getItem(`sisterquest_progress_${userId}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { userId, totalPoints: 0, dailyMinutes: 0, dailyQuestionsAnswered: 0, streak: 0, lastActiveDate: new Date().toISOString().split("T")[0] };
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function getWeekendLabel(): string {
  const day = new Date().getDay();
  if (day === 0) return "Sunday";
  if (day === 6) return "Saturday";
  return "";
}

export function exportUserData(_userId: string): object {
  return { exportedAt: new Date().toISOString() };
}

export function importUserData(_userId: string, _data: object): void {
  // No-op
}