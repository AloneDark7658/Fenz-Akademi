"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarDays, BookOpen, Radio, Users } from "lucide-react";

interface Course {
  id: string;
  title: string;
  gradeLevel: number;
}

interface CreateSessionFormProps {
  courses: Course[];
}

export function CreateSessionForm({ courses }: CreateSessionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [groupMode, setGroupMode] = useState<"none" | "5" | "10" | "15" | "20" | "custom">("none");
  const [customGroupSize, setCustomGroupSize] = useState("15");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const scheduledForValue = (form.elements.namedItem("scheduledFor") as HTMLInputElement).value;
    const scheduledFor = new Date(scheduledForValue).toISOString();
    
    let groupSize = 0;
    if (selectedCourseId && groupMode !== "none") {
      groupSize = groupMode === "custom" ? parseInt(customGroupSize) : parseInt(groupMode);
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/live/create-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title, 
            scheduledFor, 
            courseId: selectedCourseId || null,
            groupSize 
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Ders oluşturulamadı.");
          return;
        }
        
        // Eğer gruplandıysa, parent id döner, oraya yönlendir
        router.push(`/teacher/live/${data.sessionId}`);
        router.refresh();
      } catch {
        setError("Sunucu hatası. Lütfen tekrar deneyin.");
      }
    });
  };

  const now = new Date(Date.now() + 60 * 60 * 1000);
  const offset = now.getTimezoneOffset() * 60000;
  const defaultDate = new Date(now.getTime() - offset).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ders Başlığı */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Ders Başlığı *
          </label>
          <div className="relative">
            <Radio className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              name="title"
              type="text"
              required
              placeholder="Örn: 7. Sınıf - Hücre ve Yapısı"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] transition-all"
            />
          </div>
        </div>

        {/* Tarih & Saat */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Tarih & Saat *
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              name="scheduledFor"
              type="datetime-local"
              required
              defaultValue={defaultDate}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Kurs Seçimi */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Bağlı Kurs (Opsiyonel)
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              name="courseId"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                if (!e.target.value) setGroupMode("none");
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition-all appearance-none [color-scheme:dark]"
            >
              <option value="">-- Seçilmedi --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.gradeLevel}. Sınıf — {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gruplama Seçenekleri (Sadece kurs seçiliyse görünür) */}
        {selectedCourseId && (
          <div className="md:col-span-2 mt-2 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Grup Ayarları
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(["none", "5", "10", "15", "20", "custom"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGroupMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    groupMode === mode 
                      ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                      : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {mode === "none" && "Tüm Sınıf (Grup Yok)"}
                  {mode === "5" && "5'li Gruplar"}
                  {mode === "10" && "10'lu Gruplar"}
                  {mode === "15" && "15'li Gruplar"}
                  {mode === "20" && "20'li Gruplar"}
                  {mode === "custom" && "Özel Sayı"}
                </button>
              ))}
            </div>

            {groupMode === "custom" && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-400">Her grupta en fazla</span>
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={customGroupSize}
                  onChange={(e) => setCustomGroupSize(e.target.value)}
                  className="w-16 px-2 py-1 rounded-xl bg-slate-900 border border-white/10 text-white text-center text-sm focus:outline-none focus:border-cyan-500/50"
                />
                <span className="text-sm text-slate-400">öğrenci olsun.</span>
              </div>
            )}
            
            {groupMode !== "none" && (
              <p className="text-xs text-cyan-400/80 italic mt-2">
                Sınıftaki öğrenciler seçilen boyuta göre rastgele gruplara ayrılır ve her grup için ayrı oda açılır.
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Radio className="w-4 h-4" />
        )}
        {isPending ? "Oluşturuluyor..." : "Canlı Ders Oluştur"}
      </button>
    </form>
  );
}
