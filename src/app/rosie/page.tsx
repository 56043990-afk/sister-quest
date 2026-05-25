"use client";

import Link from "next/link";
import { USERS } from "@/types/user";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Flame,
  Gamepad2,
  Code,
  Music,
  FlaskConical,
  Palette,
  Save,
  Trophy,
  ChevronRight,
  Star,
  Zap,
  Mic,
  Piano,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { getCurrentUser, getErrorBookCount, getErrorBookCountBySubject, isWeekend, getWeekendLabel } from "@/lib/dataService";
import { getActiveUserId, subscribeActiveUser } from "@/lib/activeUser";

const rosieSubjectCards = [
  {
    name: "Math Quest",
    emoji: "🎮",
    color: "from-cyan-400 to-blue-500",
    href: "/quiz/math",
    icon: Gamepad2,
    badge: "Game Dev Math",
    description: "HP percentages & X/Y coordinates",
  },
  {
    name: "Word World",
    emoji: "✨",
    color: "from-pink-400 to-rose-500",
    href: "/quiz/english",
    icon: Sparkles,
    badge: "Story Coder",
    description: "Build creative stories",
  },
  {
    name: "Sound Lab",
    emoji: "🎵",
    color: "from-violet-400 to-purple-500",
    href: "/quiz/science",
    icon: Music,
    badge: "Music Science",
    description: "Piano to Sax frequencies",
  },
];

const creatorBadges = [
  {
    id: "python-pioneer",
    name: "Python Pioneer",
    description: "Completed first Python project",
    icon: Code,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
    earned: true,
    glowColor: "shadow-cyan-500/50",
  },
  {
    id: "sound-master",
    name: "Acoustics Master",
    description: "Explored sound wave frequencies",
    icon: Mic,
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    borderColor: "border-violet-500/50",
    earned: true,
    glowColor: "shadow-violet-500/50",
  },
  {
    id: "scratch-pro",
    name: "Scratch Superstar",
    description: "Created 10 interactive games",
    icon: Gamepad2,
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/50",
    earned: true,
    glowColor: "shadow-pink-500/50",
  },
  {
    id: "music-math",
    name: "Math Musician",
    description: "Used math ratios in music",
    icon: Piano,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/50",
    earned: false,
    progress: 60,
    glowColor: "shadow-amber-500/50",
  },
  {
    id: "code-creator",
    name: "Code Creator",
    description: "Wrote first algorithm",
    icon: Sparkles,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/50",
    earned: false,
    progress: 30,
    glowColor: "shadow-emerald-500/50",
  },
];

const globalProjects = [
  { name: "Code Combat 2026", progress: 75, participants: 1247 },
  { name: "Game Jam Summer", progress: 45, participants: 892 },
  { name: "Music Makers Club", progress: 90, participants: 2341 },
];

export default function RosieDashboard() {
  const [isActive, setIsActive] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("rosie");
  const [scratchpad, setScratchpad] = useState("");
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(8);
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

      if (uid === "rosie") {
        const saved = localStorage.getItem("rosie-scratchpad");
        if (saved) setScratchpad(saved);
      }
    }

    loadData(userId);

    const unsub = subscribeActiveUser((id) => {
      setCurrentUserId(id);
      loadData(id);
    });

    return unsub;
  }, []);

  const user = USERS.find((u) => u.id === currentUserId) || USERS[1];

  const errorBookSubjects = Object.entries(errorBookBySubject)
    .filter(([, count]) => count > 0)
    .map(([subject, count]) => `${count} ${subject}`)
    .join(", ");

  const saveScratchpad = () => {
    localStorage.setItem("rosie-scratchpad", scratchpad);
  };

  const progress = (user.dailyMinutes / user.dailyGoalMinutes) * 100;

  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 mb-4 shadow-2xl shadow-pink-500/30 animate-pulse">
            <span className="text-6xl">{user.avatar}</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">Rosie</span>!
          </h1>
          <p className="text-purple-300 mt-2 font-medium">{user.title}</p>
          <p className="text-xs text-purple-400/70 mt-1">Level B — 4th/5th Class</p>

          <div className="mt-6 inline-flex items-center gap-4 px-8 py-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/10">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-white text-lg">{xp.toLocaleString()} XP</span>
            </div>
            <div className="w-px h-8 bg-purple-500/40" />
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-white text-lg">Level {level}</span>
            </div>
            <div className="w-px h-8 bg-purple-500/40" />
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <span className="font-bold text-orange-400 text-lg">{user.streak}</span>
            </div>
          </div>
        </header>

        {showWeekendBanner && (
          <section className="mb-8">
            <Link
              href="/review"
              className="flex items-center justify-center gap-4 px-6 py-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 border border-amber-500/30 rounded-2xl hover:from-amber-500/30 hover:via-orange-500/30 hover:to-yellow-500/30 transition-all"
            >
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <div className="text-left">
                <p className="font-bold text-amber-300">{getWeekendLabel()} Review Time!</p>
                <p className="text-sm text-amber-400/80">
                  You have {errorBookCount} question{errorBookCount !== 1 ? "s" : ""} to reinforce
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400" />
            </Link>
          </section>
        )}

        {!showWeekendBanner && errorBookCount > 0 && (
          <section className="mb-8">
            <Link
              href="/review"
              className="group relative flex items-center gap-5 p-6 bg-gradient-to-r from-red-500/15 to-orange-500/15 border-2 border-red-500/30 rounded-2xl hover:from-red-500/25 hover:to-orange-500/25 hover:border-red-500/50 transition-all shadow-lg shadow-red-500/10"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-lg">Pending Reviews</p>
                <p className="text-sm text-red-300/80 mt-0.5">
                  {errorBookCount} incorrect question{errorBookCount !== 1 ? "s" : ""} to reinforce
                </p>
                {errorBookSubjects && (
                  <p className="text-xs text-red-400/60 mt-1">{errorBookSubjects}</p>
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
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Error Book (Review)</h2>
          </div>
          <Link
            href="/review"
            className="group flex items-center gap-5 p-5 bg-gradient-to-r from-red-500/15 to-orange-500/15 border-2 border-red-500/30 rounded-2xl hover:from-red-500/25 hover:to-orange-500/25 hover:border-red-500/50 transition-all shadow-lg shadow-red-500/10"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-lg">Review Mistakes</p>
              <p className="text-sm text-red-300/80 mt-0.5">
                {errorBookCount > 0
                  ? `${errorBookCount} incorrect question${errorBookCount !== 1 ? "s" : ""} to reinforce`
                  : "All caught up! No pending reviews."}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg group-hover:bg-red-500/30 transition-colors">
              <span className="font-bold text-red-300">{errorBookCount}</span>
              {errorBookCount > 0 && <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />}
            </div>
          </Link>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Today&apos;s Mission</h2>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-purple-300">Quest Goal: 30 minutes</span>
              <span className="text-sm font-bold text-cyan-400">
                {user.dailyMinutes}/{user.dailyGoalMinutes} min
              </span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-purple-400">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                {Math.round(progress)}% Complete
              </span>
              <span>{30 - user.dailyMinutes} min remaining</span>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="w-6 h-6 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Studio Quests</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rosieSubjectCards.map((subject) => {
              const IconComponent = subject.icon;
              return (
                <Link
                  key={subject.name}
                  href={subject.href}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/20"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{subject.emoji}</span>
                      <IconComponent className="w-8 h-8 text-purple-400 group-hover:text-pink-400 transition-colors" />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">{subject.name}</h3>
                    <p className="text-sm text-purple-300/80 mb-3">{subject.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/40">
                      <span className="text-xs text-purple-300 font-medium">{subject.badge}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-pink-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Quest
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Creator Badges</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {creatorBadges.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`relative overflow-hidden rounded-2xl p-5 ${
                    badge.earned
                      ? `bg-gradient-to-br ${badge.bgColor} border ${badge.borderColor} shadow-lg ${badge.glowColor}`
                      : "bg-slate-800/50 border border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        badge.earned ? badge.bgColor : "bg-slate-700"
                      }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${badge.earned ? badge.color : "text-slate-500"}`}
                      />
                    </div>
                    {badge.earned && (
                      <div className="absolute top-3 right-3">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold ${badge.earned ? "text-white" : "text-slate-400"}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                  {!badge.earned && badge.progress !== undefined && (
                    <div className="mt-3">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{badge.progress}%</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Coolest Projects Global 2026</h2>
          </div>
          <div className="space-y-3">
            {globalProjects.map((project) => (
              <div
                key={project.name}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{project.name}</span>
                  <span className="text-xs text-purple-400">{project.participants.toLocaleString()} makers</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{project.progress}% complete</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Creative Scratchpad</h2>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 overflow-hidden">
            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              onBlur={saveScratchpad}
              placeholder="Type your game ideas, map layouts, character stories, or anything creative here..."
              className="w-full h-48 p-5 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900/50 border-t border-slate-700/50">
              <span className="text-xs text-slate-500">
                Auto-saved to your browser
              </span>
              <button
                onClick={saveScratchpad}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center">
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
            ← Switch Profile
          </Link>
        </footer>
      </div>
    </div>
  );
}
