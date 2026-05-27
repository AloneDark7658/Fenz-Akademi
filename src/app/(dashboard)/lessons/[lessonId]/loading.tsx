// Ders izleme sayfası yüklenirken skeleton
export default function LessonLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-4 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Video player skeleton */}
        <div className="w-full aspect-video bg-black/40 rounded-3xl border border-white/10 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10" />
        </div>

        {/* Ders başlığı skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-3/4 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Alt sekmeler skeleton */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-white/10 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* İçerik alanı skeleton */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-48 animate-pulse">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${85 - i * 10}%` }} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
