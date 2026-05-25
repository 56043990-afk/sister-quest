"use client";

import Link from "next/link";
import { USERS } from "@/types/user";
import { useEffect, useState } from "react";
import {
  Star,
  Flame,
  Trophy,
  BookOpen,
  Zap,
  Target,
  Award,
  ChevronRight,
  Brain,
  Atom,
  Calculator,
  Languages,
  AlertCircle,
} from "lucide-react";
import { getCurrentUser, getErrorBookCount, getErrorBookCountBySubject, isWeekend, getWeekendLabel } from "@/lib/dataService";
import { getActiveUserId, subscribeActiveUser } from "@/lib/activeUser";

const subjectCards = [
  {
    name: "Mathematics",
    emoji: "🔢",
    color: "from-blue-400 to-cyan-400",
    href: "/quiz/math",
    icon: Calculator,
    achievements: ["IMTA Olympiad Prep", "Algebra Master"],
  },
  {
    name: "English",
    emoji: "📚",
    color: "from-emerald-400 to-green-400",
    href: "/quiz/english",
    icon: Languages,
    achievements: ["Literary Analyst", "Grammar Pro"],
  },
  {
    name: "Science",
    emoji: "🔬",
    color: "from-violet-400 to-purple-400",
    href: "/quiz/science",
    icon: Atom,
    achievements: ["Junior Cycle Ready", "Lab Expert"],
  },
  {
    name: "Physics",
    emoji: "⚡",
    color: "from-amber-400 to-orange-400",
    href: "/quiz/physics",
    icon: Zap,
    achievements: ["Mechanics Guru", "Energy Master"],
  },
  {
    name: "Chemistry",
    emoji: "🧪",
    color: "from-rose-400 to-pink-400",
    href: "/quiz/chemistry",
    icon: Atom,
    achievements: ["Element Hunter", "Reaction Expert"],
  },
  {
    name: "Logic",
    emoji: "🧠",
    color: "from-indigo-400 to-blue-400",
    href: "/quiz/logic",
    icon: Brain,
    achievements: ["Bebras Brain", "Algorithmic Thinker"],
  },
];

const achievements = [
  {
    id: "imta-master",
    name: "IMTA Logic Master",
    description: "Top 10% in national mathematics competition",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    earned: true,
  },
  {
    id: "bebras-brain",
    name: "Bebras Brain",
    description: "Solved 50 Bebras-style computational thinking puzzles",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    earned: true,
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "7-day learning streak achieved",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    earned: true,
  },
  {
    id: "physics-pro",
    name: "Physics Pro",
    description: "Complete 20 physics challenges",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    earned: false,
    progress: 75,
  },
];

export default function PinkDashboard() {
  const [isActive, setIsActive] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("pink");
  const [xp, setXp] = useState(2450);
  const [level, setLevel] = useState(12);
  const [errorBookCount, setErrorBookCount] = useState(0);
  const [errorBookBySubject, setErrorBookBySubject] = useState<Record<string, number>>({});
  const [showWeekendBanner, setShowWeekendBanner] = useState(false);

  useEffect(() => {
    setIsActive(true);

    const userId = getActiveUserId();
    setCurrentUserId(userId);

    async function loadData(uid: string) {
      try {
        const count = await getErrorBookCount(uid);
        setErrorBookCount(count);
        const bySubject = await getErrorBookCountBySubject(uid);
        setErrorBookBySubject(bySubject);
      } catch (err) {
        console.error("Failed to load error book count:", err);
      }
      setShowWeekendBanner(isWeekend());
    }

    loadData(userId);

    const unsub = subscribeActiveUser((id) => {
      setCurrentUserId(id);
      loadData(id);
    });

    return unsub;
  }, []);

  const user = USERS.find((u) => u.id === currentUserId) || USERS[0];

  const errorBookSubjects = Object.entries(errorBookBySubject)
    .filter(([, count]) => count > 0)
    .map(([subject, count]) => `${count} ${subject}`)
    .join(", ");

  const progress = (user.dailyMinutes / user.dailyGoalMinutes) * 100;
  const xpToNextLevel = 500;
  const currentLevelXp = xp % xpToNextLevel;

  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-4 shadow-lg">
            <span className="text-5xl">{user.avatar}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{user.name}</h1>
          <p className="text-slate-500 mt-1 font-medium">{user.title}</p>
          <p className="text-xs text-slate-400 mt-1">Level A — Junior Cycle</p>

          <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border border-slate-100">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-slate-800">{xp.toLocaleString()} XP</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-slate-800">Level {level}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-600">{user.streak} day streak</span>
            </div>
          </div>
        </header>

        {showWeekendBanner && (
          <section className="mb-8">
            <Link
              href="/review"
              className="flex items-center justify-center gap-4 px-6 py-4 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl hover:from-amber-100 hover:via-orange-100 hover:to-yellow-100 transition-all shadow-md"
            >
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div className="text-left">
                <p className="font-bold text-amber-800">{getWeekendLabel()} Review Time!</p>
                <p className="text-sm text-amber-600">
                  You have {errorBookCount} question{errorBookCount !== 1 ? "s" : ""} to reinforce
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600" />
            </Link>
          </section>
        )}

        {!showWeekendBanner && errorBookCount > 0 && (
          <section className="mb-8">
            <Link
              href="/review"
              className="group relative flex items-center gap-5 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200/60 rounded-2xl hover:from-red-100 hover:to-orange-100 hover:border-red-300/80 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center shadow-sm">
                <BookOpen className="w-7 h-7 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-lg">Pending Reviews</p>
                <p className="text-sm text-slate-600 mt-0.5">
                  {errorBookCount} incorrect question{errorBookCount !== 1 ? "s" : ""} to reinforce
                </p>
                {errorBookSubjects && (
                  <p className="text-xs text-slate-500 mt-1">{errorBookSubjects}</p>
                )}
              </div>
              <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg group-hover:shadow-xl transition-all">
                Start Review
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-500" />
            Today&apos;s Progress
          </h2>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Daily Goal: 30 minutes</span>
              <span className="text-sm font-bold text-pink-600">
                {user.dailyMinutes}/{user.dailyGoalMinutes} min
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{Math.round(progress)}% complete</span>
              <span>{30 - user.dailyMinutes} minutes remaining</span>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-500" />
            Error Book (Review)
          </h2>
          <Link
            href="/review"
            className="group flex items-center gap-5 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200/60 rounded-2xl hover:from-red-100 hover:to-orange-100 hover:border-red-300/80 transition-all shadow-md hover:shadow-lg"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center shadow-sm">
              <BookOpen className="w-7 h-7 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-lg">Review Mistakes</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {errorBookCount > 0
                  ? `${errorBookCount} incorrect question${errorBookCount !== 1 ? "s" : ""} to reinforce`
                  : "All caught up! No pending reviews."}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <span className="font-bold text-red-600">{errorBookCount}</span>
              {errorBookCount > 0 && <ChevronRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />}
            </div>
          </Link>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-500" />
            Choose Your Quest
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subjectCards.map((subject) => {
              const IconComponent = subject.icon;
              return (
                <Link
                  key={subject.name}
                  href={subject.href}
                  className="group relative overflow-hidden rounded-2xl p-5 bg-white border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{subject.emoji}</span>
                      <IconComponent className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors`} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">{subject.name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {subject.achievements.map((ach) => (
                        <span key={ach} className="text-xs text-slate-400">
                          {ach}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-pink-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Quest
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`relative overflow-hidden rounded-2xl p-5 ${
                    achievement.earned ? achievement.bgColor : "bg-slate-50"
                  } border ${achievement.earned ? "border-transparent" : "border-slate-200"}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        achievement.earned ? achievement.bgColor : "bg-slate-100"
                      }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${
                          achievement.earned ? achievement.color : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${achievement.earned ? "text-slate-800" : "text-slate-500"}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{achievement.description}</p>
                      {!achievement.earned && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-400 rounded-full"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{achievement.progress}% complete</p>
                        </div>
                      )}
                    </div>
                    {achievement.earned && (
                      <div className="absolute top-3 right-3">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-12 text-center">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
            ← Switch Profile
          </Link>
        </footer>
      </div>
    </div>
  );
}
