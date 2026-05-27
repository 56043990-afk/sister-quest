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
          5