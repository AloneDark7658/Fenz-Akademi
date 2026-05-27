// Öğretmen ana paneli yüklenirken skeleton
export default function TeacherLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-white/10 rounded-xl animate-pulse" />
        </div>

        {/* Stat kartları skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="w-10 h-10 bg-white/10 rounded-2xl" />
              </div>
              <div className="h-9 w-16 bg-white/10 rounded-lg mb-1" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* İçerik alanı skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-80 animate-pulse">
              <div className="h-5 w-40 bg-white/10 rounded-lg mb-6" />
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-12 bg-white/5 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
