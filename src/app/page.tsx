export const metadata = {
  title: 'SisterQuest',
  description: 'sister quest',
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {/* Profile Selection */}
        <div className="w-full max-w-4xl bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">Select Your Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sister Profile */}
            <button className="flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-transparent hover:border-pink-500/50">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="text-3xl">👩</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sister</h3>
              <p className="text-sm text-gray-400 text-center">Manage tasks, set rewards, and track progress</p>
            </button>

            {/* Brother Profile */}
            <button className="flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-transparent hover:border-blue-500/50">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="text-3xl">👦</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Brother</h3>
              <p className="text-sm text-gray-400 text-center">Complete tasks and earn rewards</p>
            </button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* Footer content if any */}
      </footer>
    </div>
  );
}