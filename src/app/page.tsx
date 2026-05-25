"use client";

import { USERS } from "@/types/user";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, BookOpen, Zap, ChevronRight, Star, Flame, Brain } from "lucide-react";
import { switchUser } from "@/lib/activeUser";

function FloatingOrb({
  className,
  delay = 0,
  size = "lg",
}: {
  className: string;
  delay?: number;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "w-64 h-64",
    md: "w-96 h-96",
    lg: "w-[500px] h-[500px]",
    xl: "w-[700px] h-[700px]",
  };

  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-30 ${sizeClasses[size]} ${className}`}
      style={{
        animation: `float 20s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function ProfileCard({
  user,
  index,
}: {
  user: (typeof USERS)[0];
  index: number;
}) {
  const isPink = user.id === "pink";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    switchUser(user.id);
    window.location.href = `/${user.id}`;
  };

  const cardStyles = isPink
    ? {
        gradient: "from-indigo-500/20 via-purple-500/20 to-violet-500/20",
        accent: "text-indigo-600",
        accentBg: "bg-indigo-500/10",
        border: "border-indigo-200/50",
        hoverGradient: "from-indigo-400/30 via-purple-400/30 to-violet-400/30",
        iconBg: "bg-gradient-to-br from-indigo-100 to-purple-100",
        iconColor: "text-indigo-600",
        badgeBg: "bg-indigo-100/80",
        badgeText: "text-indigo-700",
        glowClass: "hover:shadow-indigo-200/50",
      }
    : {
        gradient: "from-teal-500/20 via-cyan-500/20 to-emerald-500/20",
        accent: "text-teal-600",
        accentBg: "bg-teal-500/10",
        border: "border-teal-200/50",
        hoverGradient: "from-teal-400/30 via-cyan-400/30 to-emerald-400/30",
        iconBg: "bg-gradient-to-br from-teal-100 to-cyan-100",
        iconColor: "text-teal-600",
        badgeBg: "bg-teal-100/80",
        badgeText: "text-teal-700",
        glowClass: "hover:shadow-teal-200/50",
      };

  const stats = isPink
    ? [
        { icon: BookOpen, label: "STEAM Scholar" },
        { icon: Brain, label: "Bebras Brain" },
        { icon: Zap, label: "Junior Cycle" },
      ]
    : [
        { icon: Sparkles, label: "Rising Star" },
        { icon: Star, label: "Creator" },
        { icon: Flame, label: "Level B" },
      ];

  return (
    <div
      onClick={handleClick}
      className="group block">
      <div
        className={`
          relative overflow-hidden rounded-3xl
          bg-white/40 backdrop-blur-xl
          border ${cardStyles.border}
          shadow-lg shadow-black/5
          transition-all duration-500 ease-out
          hover:shadow-2xl ${cardStyles.glowClass}
          hover:-translate-y-2
          hover:bg-white/60
          cursor-pointer
        `}
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <div
          className={`
            absolute inset-0 bg-gradient-to-br ${cardStyles.gradient}
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500
          `}
        />

        <div className="relative z-10 p-10">
          <div className="flex items-start justify-between mb-8">
            <div
              className={`
                w-20 h-20 rounded-2xl
                ${cardStyles.iconBg}
                flex items-center justify-center
                text-4xl
                transition-transform duration-300
                group-hover:scale-110
              `}
            >
              {user.avatar}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600">
                  {user.streak}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">{user.age} years old</p>
          </div>

          <div className="mb-6">
            <span
              className={`
                inline-flex items-center gap-1.5
                px-4 py-2 rounded-full
                ${cardStyles.badgeBg} ${cardStyles.badgeText}
                text-sm font-medium
              `}
            >
              <Star className="w-3.5 h-3.5" />
              {user.title}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {stats.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5
                  bg-white/50 rounded-lg
                  text-xs font-medium text-gray-600
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${cardStyles.iconColor}`} />
                {label}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${cardStyles.accent}`}>
                Continue Learning
              </span>
              <ChevronRight
                className={`
                  w-4 h-4 ${cardStyles.accent}
                  transition-transform duration-300
                  group-hover:translate-x-1
                `}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] relative overflow-hidden font-sans antialiased">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(-30px, -20px) scale(1.02); }
        }
      `}</style>

      <FloatingOrb
        className="bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 -top-64 -left-64"
        delay={0}
        size="xl"
      />
      <FloatingOrb
        className="bg-gradient-to-br from-teal-300 via-cyan-300 to-emerald-300 top-1/3 -right-64"
        delay={-5}
        size="lg"
      />
      <FloatingOrb
        className="bg-gradient-to-br from-violet-300 via-indigo-300 to-purple-300 -bottom-64 left-1/4"
        delay={-10}
        size="md"
      />
      <FloatingOrb
        className="bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300 bottom-0 right-1/4"
        delay={-15}
        size="sm"
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="pt-8 pb-8 px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-600">
                Daily Quests Available
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">
              Welcome to
            </h1>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                SisterQuest
              </span>
            </h1>
            <p className="mt-4 text-base text-gray-500 max-w-md mx-auto">
              Your personalized daily learning adventure awaits. Choose your profile to begin.
            </p>
          </div>
        </header>

        <main className="flex-1 px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            <section className="mb-10">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-6">
                Select Your Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {USERS.map((user, index) => (
                  <div
                    key={user.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <ProfileCard user={user} index={index} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 text-center">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Quick Start
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { emoji: "🔢", label: "Math" },
                  { emoji: "📚", label: "English" },
                  { emoji: "🔬", label: "Science" },
                  { emoji: "🧠", label: "Logic" },
                  { emoji: "⚡", label: "Physics" },
                  { emoji: "🧪", label: "Chemistry" },
                ].map((subject) => (
                  <Link
                    key={subject.label}
                    href={`/quiz/${subject.label.toLowerCase()}`}
                    className="
                      flex items-center gap-2
                      px-5 py-3
                      bg-white/50 backdrop-blur-sm
                      rounded-xl border border-gray-200/50
                      text-sm font-medium text-gray-600
                      hover:bg-white/80 hover:border-gray-300
                      transition-all duration-200
                      hover:-translate-y-0.5
                    "
                  >
                    <span>{subject.emoji}</span>
                    <span>{subject.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>

        <footer className="py-8 px-8 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-400">
              SisterQuest Learning Platform
            </p>
            <p className="text-sm text-gray-400">
              Built for curious minds in Ireland 🇮🇪
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
