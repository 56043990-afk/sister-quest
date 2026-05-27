"use client";

import { USERS } from "@/types/user";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, BookOpen, Zap, ChevronRight, Star, Flame, Brain } from "lucide-react";
import { switchUser } from "@/lib/activeUser";

// ... (保持 FloatingOrb 和 ProfileCard 组件代码不变)

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
      {/* ... (keep style jsx global) ... */}

      {/* FloatingOrbs ... (keep as is) */}
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header 区域已简化，仅保留呼吸灯状态，移除大标题 */}
        <header className="pt-16 pb-8 px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-600">
                Daily Quests Available
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            {/* 用户选择区域 */}
            <section className="mb-10">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-8">
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
            
            {/* 如果你还需要 Quick Start 区域，可以保留这里；如果不需要，直接删除此 section */}
          </div>
        </main>

        <footer className="py-8 px-8 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
          {/* Footer ... (keep as is) */}
        </footer>
      </div>
    </div>
  );
}