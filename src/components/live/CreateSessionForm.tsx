"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarDays, BookOpen, Radio } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const scheduledForValue = (form.elements.namedItem("scheduledFor") as HTMLInputElement).value;
    const scheduledFor = new Date(scheduledForValue).toISOString(); // Yerel saati UTC ISO formatına çevir
    const courseId = (form.elements.namedItem("courseId") as HTMLSelectElement).value;

    startTransition(async () => {
      try {
        const res = await fetch("/api/live/create-room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, scheduledFor, courseId: courseId || null }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Ders oluşturulamadı.");
          return;
        }
        router.push(`/teacher/live/${data.sessionId}`);
        router.refresh();
      } catch {
        setError("Sunucu hatası. Lütfen tekrar deneyin.");
      }
    });
  };

  // Varsayılan tarih: 1 saat sonra (Yerel saate göre)
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
        {isPending ? "Oda Oluşturuluyor..." : "Canlı Ders Oluştur"}
      </button>
    </form>
  );
}
