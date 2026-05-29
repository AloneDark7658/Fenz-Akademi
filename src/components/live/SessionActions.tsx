"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, Check, Loader2, AlertTriangle } from "lucide-react";
import { updateSessionAction, deleteSessionAction } from "@/app/actions/live";

interface Course {
  id: string;
  title: string;
  gradeLevel: number;
}

interface SessionActionsProps {
  sessionId: string;
  currentTitle: string;
  currentScheduledFor: string; // ISO string
  currentCourseId: string | null;
  status: string;
  courses: Course[];
}

export function SessionActions({
  sessionId,
  currentTitle,
  currentScheduledFor,
  currentCourseId,
  status,
  courses,
}: SessionActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Formu yerel saate çevir
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState(currentTitle);
  const [scheduledFor, setScheduledFor] = useState(toLocalInput(currentScheduledFor));
  const [courseId, setCourseId] = useState(currentCourseId ?? "");

  const isEnded = status === "ENDED";

  const handleSave = () => {
    if (!title.trim()) {
      setError("Başlık boş olamaz.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateSessionAction(sessionId, {
        title,
        scheduledFor: new Date(scheduledFor).toISOString(),
        courseId: courseId || null,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSessionAction(sessionId);
      if (result.error) {
        setError(result.error);
        setIsDeleteConfirm(false);
      } else {
        router.refresh();
      }
    });
  };

  if (isEnded) return null;

  // Silme onay modu
  if (isDeleteConfirm) {
    return (
      <div className="flex items-center gap-2 mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-300 flex-1">Bu oturumu silmek istediğinize emin misiniz?</p>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/30 text-red-300 hover:bg-red-500/50 border border-red-500/30 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Evet, Sil
        </button>
        <button
          onClick={() => setIsDeleteConfirm(false)}
          className="p-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Düzenleme modu
  if (isEditing) {
    return (
      <div
        className="mt-3 p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-3"
        onClick={(e) => e.preventDefault()}
      >
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Başlık</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarih & Saat</label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all [color-scheme:dark]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bağlı Kurs</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all appearance-none [color-scheme:dark]"
          >
            <option value="">-- Seçilmedi --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.gradeLevel}. Sınıf — {c.title}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Kaydet
          </button>
          <button
            onClick={() => { setIsEditing(false); setError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" /> İptal
          </button>
        </div>
      </div>
    );
  }

  // Normal mod — küçük aksiyon butonları
  return (
    <div className="flex items-center gap-1 mt-2" onClick={(e) => e.preventDefault()}>
      <button
        onClick={() => { setIsEditing(true); setError(null); }}
        title="Düzenle"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
      >
        <Pencil className="w-3 h-3" /> Düzenle
      </button>
      <button
        onClick={() => setIsDeleteConfirm(true)}
        title="Sil"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
      >
        <Trash2 className="w-3 h-3" /> Sil
      </button>
    </div>
  );
}
