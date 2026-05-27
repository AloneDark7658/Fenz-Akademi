// Öğretmen - ders yönetimi sayfası yüklenirken skeleton
export default function TeacherLessonsLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-10 w-40 bg-white/10 rounded-xl animate-pulse" />
        </div>

        {/* İki kolon layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol panel - form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-96 animate-pulse">
            <div className="h-5 w-36 bg-white/10 rounded-lg mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-20 bg-white/10 rounded mb-2" />
                  <div className="h-10 bg-white/5 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Sağ panel - ders listesi */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
            <div className="h-5 w-32 bg-white/10 rounded-lg mb-6" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
