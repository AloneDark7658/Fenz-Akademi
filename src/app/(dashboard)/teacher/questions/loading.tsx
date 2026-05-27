// Öğretmen - sorular sayfası yüklenirken skeleton
export default function QuestionsLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-10 w-36 bg-white/10 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[480px] animate-pulse" />
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
            <div className="h-5 w-32 bg-white/10 rounded mb-5" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
