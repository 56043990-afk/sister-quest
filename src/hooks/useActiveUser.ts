"use client";

import { useEffect, useState, useCallback } from "react";
import { USERS } from "@/types/user";
import {
  getCurrentUser,
  setCurrentUser,
  getErrorBookCount,
  isWeekend,
  getWeekendLabel,
  getUserProgressDoc,
  fetchErrorBookBySubject,
} from "@/lib/dataService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function useActiveUser() {
  const [userId, setUserId] = useState<string>("pink");
  const [userData, setUserData] = useState<{
    streak: number;
    dailyMinutes: number;
    dailyGoalMinutes: number;
    totalPoints: number;
    smartScores: Record<string, number>;
    errorBookCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback((id: string) => {
    setUserId(id);
    setCurrentUser(id);
  }, []);

  useEffect(() => {
    const stored = getCurrentUser();
    setUserId(stored);

    // Subscribe to Firestore real-time updates for the active user
    const userRef = doc(db, "users", stored);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserData({
            streak: data.streak ?? 0,
            dailyMinutes: data.dailyMinutes ?? 0,
            dailyGoalMinutes: 30,
            totalPoints: data.totalPoints ?? 0,
            smartScores: data.smartScores ?? {},
            errorBookCount: (data.errorBook ?? []).length,
          });
        } else {
          // Fallback to static USERS data
          const staticUser = USERS.find((u) => u.id === stored) || USERS[0];
          setUserData({
            streak: staticUser.streak,
            dailyMinutes: staticUser.dailyMinutes,
            dailyGoalMinutes: staticUser.dailyGoalMinutes,
            totalPoints: 0,
            smartScores: {},
            errorBookCount: 0,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
        const staticUser = USERS.find((u) => u.id === stored) || USERS[0];
        setUserData({
          streak: staticUser.streak,
          dailyMinutes: staticUser.dailyMinutes,
          dailyGoalMinutes: staticUser.dailyGoalMinutes,
          totalPoints: 0,
          smartScores: {},
          errorBookCount: 0,
        });
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const switchUser = useCallback(
    (newUserId: string) => {
      setUserId(newUserId);
      setCurrentUser(newUserId);
      router.push(`/${newUserId}`);
    },
    [router]
  );

  const currentUser = USERS.find((u) => u.id === userId) || USERS[0];

  return { userId, currentUser, userData, loading, switchUser, loadUser };
}