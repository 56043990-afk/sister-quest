"use client";

import { useEffect, useState, useCallback } from "react";
import { USERS } from "@/types/user";
import {
  getErrorBookCount,
  isWeekend,
  getWeekendLabel,
  getUserProgressDoc,
} from "@/lib/dataService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  switchUser,
  getActiveUserId,
  subscribeActiveUser,
} from "@/lib/activeUser";
import {
  ChevronDown,
  User,
  Users,
  Flame,
  BookOpen,
  Calendar,
  Shield,
  PlusCircle,
} from "lucide-react";

export function NavBar() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string>(getActiveUserId());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const [streak, setStreak] = useState(7);
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [dailyGoalMinutes] = useState(30);
  const [totalPoints, setTotalPoints] = useState(0);
  const [smartScores, setSmartScores] = useState<Record<string, number>>({});
  const [errorBookCount, setErrorBookCount] = useState(0);
  const [showWeekendBanner, setShowWeekendBanner] = useState(false);

  // Keep currentUserId in sync with the singleton
  const syncUser = useCallback((id: string) => {
    setCurrentUserId(id);
  }, []);

  useEffect(() => {
    const stored = getActiveUserId();
    setCurrentUserId(stored);

    const unsub = subscribeActiveUser(syncUser);
    return unsub;
  }, [syncUser]);

  // Real-time Firestore listener for active user — auto-updates on user switch
  useEffect(() => {
    const userRef = doc(db, "users", currentUserId);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setStreak(data.streak ?? 0);
          setDailyMinutes(data.dailyMinutes ?? 0);
          setTotalPoints(data.totalPoints ?? 0);
          setSmartScores(data.smartScores ?? {});
          setErrorBookCount((data.errorBook ?? []).length);
        } else {
          const staticUser = USERS.find((u) => u.id === currentUserId) || USERS[0];
          setStreak(staticUser.streak);
          setDailyMinutes(staticUser.dailyMinutes);
          setTotalPoints(0);
          setSmartScores({});
          setErrorBookCount(0);
        }
        setShowWeekendBanner(isWeekend());
      },
      (err) => {
        console.error("Firestore snapshot error:", err);
        const staticUser = USERS.find((u) => u.id === currentUserId) || USERS[0];
        setStreak(staticUser.streak);
      }
    );

    return () => unsub();
  }, [currentUserId]);

  const handleSwitchUser = (userId: string) => {
    if (userId === currentUserId) {
      setIsDropdownOpen(false);
      return;
    }
    switchUser(userId);
    setCurrentUserId(userId);
    setIsDropdownOpen(false);
    router.push(`/${userId}`);
  };

  const currentUser = USERS.find((u) => u.id === currentUserId) || USERS[0];
  const progressPercent = Math.min(100, (dailyMinutes / dailyGoalMinutes) * 100);
  const topEntry = Object.entries(smartScores).sort(([, a], [, b]) => b - a)[0];
  const topScore = topEntry ? topEntry[1] : 50;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-3">
            
            {/* ====== 修改的部分在这里：加入 Logo 并完美居中对齐 ====== */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img 
                src="/logo.png" 
                alt="SisterQuest Logo" 
                className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                SisterQuest
              </span>
            </Link>
            {/* ========================================================= */}

            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-200"
            >
              <Shield className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-600 hidden sm:inline">Admin</span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {showWeekendBanner && (
              <Link
                href="/review"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full hover:from-amber-100 hover:to-orange-100 transition-all duration-200"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  {getWeekendLabel()} Review
                </span>
              </Link>
            )}

            {errorBookCount > 0 && (
              <Link
                href="/review"
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-all duration-200"
              >
                <BookOpen className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-red-600">
                  {errorBookCount} to review
                </span>
              </Link>
            )}

            {/* Switch Profile Dropdown — prominent */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={() => setIsHoveringDropdown(true)}
                onMouseLeave={() => setIsHoveringDropdown(false)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-2 border-cyan-400 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/30"
              >
                <Users className="w-4 h-4 text-white" />
                <span className="font-bold text-white text-xs sm:text-sm hidden md:inline">Switch Profile</span>
                <span className="text-xl">{currentUser.avatar}</span>
                <span className="font-semibold text-white text-xs sm:text-sm hidden sm:inline">{currentUser.name}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/80 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {(isDropdownOpen || isHoveringDropdown) && (
                <div
                  className="absolute right-0 sm:mt-2 mt-1 w-[calc(100vw-2rem)] sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl shadow-black/10 overflow-hidden z-50"
                  onMouseEnter={() => setIsHoveringDropdown(true)}
                  onMouseLeave={() => setIsHoveringDropdown(false)}
                >
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Switch Profile</p>
                  </div>

                  <div className="p-2">
                    {USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          user.id === currentUserId
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <span className="text-2xl">{user.avatar}</span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.title}</p>
                        </div>
                        {user.id === currentUserId && (
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        )}
                      </button>
                    ))}

                    {/* Add Student — inside the dropdown */}
                    <div className="mt-1 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/admin?action=add");
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-purple-50 border border-transparent"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <PlusCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-800">Add New Student</p>
                          <p className="text-xs text-gray-500">Create a profile</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>Signed in as {currentUser.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200/50 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-orange-600">{streak}</span>
            </div>

            {/* SmartScore */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200/50 rounded-full">
              <span className={`text-xs font-bold ${topScore >= 70 ? "text-green-600" : topScore >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                {topScore}
              </span>
              <span className="text-xs text-blue-500">Score</span>
            </div>

            {/* Daily progress */}
            <div className="hidden md:flex items-center gap-2 min-w-[120px]">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                {dailyMinutes}/{dailyGoalMinutes}m
              </span>
            </div>
          </div>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
      )}
    </nav>
  );
}