export const metadata = {
  title: 'SisterQuest',
  description: 'sister quest',
}

export default function Home() {
  return (
    // 这里把原来的 grid 换成了 flex 居中，彻底消灭顶部空白
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-black">
      <main className="w-full max-w-4xl bg-white/5 p-10 rounded-2xl backdrop-blur-sm border border-white/10 flex flex-col items-center shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">Select Your Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Pink Rosie Profile */}
          <button className="flex flex-col items-center p-8 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-transparent hover:border-pink-500/50">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
              <span className="text-5xl">👩</span>
            </div>
            <h3 className="text-2xl font-bold text-pink-400 mb-3">Pink Rosie</h3>
            <p className="text-base text-gray-400 text-center">Manage tasks, set rewards, and track progress</p>
          </button>

          {/* Brother Profile */}
          <button className="flex flex-col items-center p-8 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-transparent hover:border-blue-500/50">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              <span className="text-5xl">👦</span>
            </div>
            <h3 className="text-2xl font-bold text-blue-400 mb-3">Brother</h3>
            <p className="text-base text-gray-400 text-center">Complete tasks and earn rewards</p>
          </button>
        </div>
      </main>
    </div>
  );
}