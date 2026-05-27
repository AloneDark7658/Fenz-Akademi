// Veli paneli yüklenirken skeleton
export default function ParentLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Stat kartları skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="w-8 h-8 bg-white/10 rounded-xl" />
              </div>
              <div className="h-9 w-20 bg-white/10 rounded-lg" />
              <div className="h-3 w-24 bg-white/5 rounded mt-2" />
            </div>
          ))}
        </div>

        {/* Grafikler skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 animate-pulse">
              <div className="h-4 w-36 bg-white/10 rounded mb-6" />
              <div className="h-44 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Öğrenci listesi skeleton */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
          <div className="h-5 w-40 bg-white/10 rounded-lg mb-6" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
