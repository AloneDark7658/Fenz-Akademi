// Öğrenci paneli yüklenirken gösterilen skeleton UI
// Next.js bu dosyayı veri gelene kadar otomatik gösterir — sayfa anında açılır gibi hissettirır

export default function StudentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-10 space-y-12">

        {/* Hero karşılama skeleton */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-14 w-80 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-4 w-56 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="flex-shrink-0 bg-white/5 rounded-3xl px-8 py-5 border border-white/10 w-64 h-28 animate-pulse" />
        </section>

        {/* İstatistik kartları skeleton */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="w-8 h-8 bg-white/10 rounded-xl" />
              </div>
              <div className="h-10 w-24 bg-white/10 rounded-lg" />
              <div className="h-3 w-28 bg-white/5 rounded" />
            </div>
          ))}
        </section>

        {/* Grafikler skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 animate-pulse">
              <div className="h-4 w-32 bg-white/10 rounded mb-6" />
              <div className="h-40 bg-white/5 rounded-xl" />
            </div>
          ))}
        </section>

        {/* Ders kartları skeleton */}
        <section>
          <div className="h-6 w-48 bg-white/10 rounded-lg mb-5 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-48 animate-pulse">
                <div className="h-3 w-16 bg-white/10 rounded mb-3" />
                <div className="h-5 w-full bg-white/10 rounded mb-2" />
                <div className="h-5 w-3/4 bg-white/10 rounded mb-6" />
                <div className="h-2 w-full bg-white/5 rounded-full mt-auto" />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
