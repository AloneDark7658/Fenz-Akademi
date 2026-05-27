"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addCourseAction,
  addLessonAction,
  type CourseActionResult,
  type LessonActionResult,
} from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Video,
  Layers,
  ChevronRight,
} from "lucide-react";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type CourseOption = { id: string; title: string; gradeLevel: number };

interface LessonManagementFormsProps {
  courses: CourseOption[];
}

// ─── Yardımcı ─────────────────────────────────────────────────────────────────

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {errors[0]}
    </p>
  );
}

function getErrors<T extends { success: boolean; fieldErrors?: Record<string, string[]> } | null>(
  state: T
) {
  if (state && !state.success) return (state as { fieldErrors?: Record<string, string[]> }).fieldErrors;
  return undefined;
}

function StatusBanner({
  state,
}: {
  state: { success: boolean; message?: string; error?: string } | null;
}) {
  if (!state) return null;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.success ? "ok" : "err"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm ${
          state.success
            ? "bg-green-500/10 border border-green-500/30 text-green-400"
            : "bg-red-500/10 border border-red-500/30 text-red-400"
        }`}
      >
        {state.success ? (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
        )}
        {state.success ? state.message : state.error}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Tab Butonu ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active ? "text-white" : "text-slate-400 hover:text-slate-300"
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-bg"
          className={`absolute inset-0 rounded-xl ${color}`}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        />
      )}
      <Icon className={`relative w-4 h-4 ${active ? "" : ""}`} />
      <span className="relative">{label}</span>
    </button>
  );
}

// ─── Kurs (Ünite) Ekleme Formu ────────────────────────────────────────────────

function AddCourseForm() {
  const [state, formAction, isPending] = useActionState<CourseActionResult | null, FormData>(
    addCourseAction,
    null
  );
  const errors = getErrors(state);

  return (
    <form action={formAction} className="space-y-4">
      <StatusBanner state={state} />

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">Ünite / Konu Adı</Label>
        <Input
          name="title"
          placeholder="örn: Hücre ve Yapısı, DNA ve Kalıtım..."
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl h-11"
        />
        <FieldError errors={errors?.title} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">Sınıf Seviyesi</Label>
        <Select name="gradeLevel">
          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11">
            <SelectValue placeholder="Sınıf seçin..." />
          </SelectTrigger>
          <SelectContent className="bg-edu-navy border-white/10 text-white">
            {[5, 6, 7, 8].map((g) => (
              <SelectItem key={g} value={String(g)} className="focus:bg-edu-cyan/10">
                {g}. Sınıf
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={errors?.gradeLevel} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">
          Açıklama{" "}
          <span className="text-slate-500 text-xs font-normal">(opsiyonel)</span>
        </Label>
        <Textarea
          name="description"
          placeholder="Bu ünitenin kısa açıklaması..."
          rows={2}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl text-sm resize-none"
        />
        <FieldError errors={errors?.description} />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-xl font-bold bg-edu-orange hover:bg-edu-orange-dark text-white shadow-lg shadow-edu-orange/20 hover:shadow-edu-orange/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Oluşturuluyor...</>
        ) : (
          <><Plus className="w-4 h-4 mr-2" />Ünite Oluştur</>
        )}
      </Button>
    </form>
  );
}

// ─── Video Ders Ekleme Formu ──────────────────────────────────────────────────

function AddLessonForm({ courses }: { courses: CourseOption[] }) {
  const [state, formAction, isPending] = useActionState<LessonActionResult | null, FormData>(
    addLessonAction,
    null
  );
  const errors = getErrors(state);

  return (
    <form action={formAction} className="space-y-4">
      <StatusBanner state={state} />

      {/* Kurs Seçimi */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">Ünite / Konu</Label>
        {courses.length === 0 ? (
          <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
            ⚠️ Önce bir Ünite (Kurs) oluşturun, ardından ders ekleyebilirsiniz.
          </p>
        ) : (
          <>
            <Select name="courseId">
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11">
                <SelectValue placeholder="Dersin bağlı olduğu üniteyi seçin..." />
              </SelectTrigger>
              <SelectContent className="bg-edu-navy border-white/10 text-white">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="focus:bg-edu-cyan/10">
                    <span className="text-slate-400 text-xs">{c.gradeLevel}. Sınıf › </span>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors?.courseId} />
          </>
        )}
      </div>

      {/* Ders Adı */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">Video Ders Adı</Label>
        <Input
          name="title"
          placeholder="örn: Hücre Zarının Yapısı ve Fonksiyonları"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl h-11"
        />
        <FieldError errors={errors?.title} />
      </div>

      {/* Video URL */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">
          Video URL{" "}
          <span className="text-slate-500 text-xs font-normal">(YouTube, MP4 vb.)</span>
        </Label>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            name="videoUrl"
            type="url"
            placeholder="https://..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl h-11"
          />
        </div>
        <FieldError errors={errors?.videoUrl} />
      </div>

      {/* Süre */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">
          Video Süresi{" "}
          <span className="text-slate-500 text-xs font-normal">(saniye, opsiyonel)</span>
        </Label>
        <Input
          name="duration"
          type="number"
          min={0}
          placeholder="örn: 480 (8 dakika)"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl h-11"
        />
        <FieldError errors={errors?.duration} />
      </div>

      {/* Açıklama */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">
          Kısa Açıklama{" "}
          <span className="text-slate-500 text-xs font-normal">(opsiyonel)</span>
        </Label>
        <Textarea
          name="description"
          placeholder="Bu derste öğrenciler ne öğrenecek?"
          rows={2}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl text-sm resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || courses.length === 0}
        className="w-full h-11 rounded-xl font-bold bg-edu-cyan hover:bg-edu-cyan-dark text-edu-navy shadow-lg shadow-edu-cyan/20 hover:shadow-edu-cyan/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ekleniyor...</>
        ) : (
          <><Video className="w-4 h-4 mr-2" />Video Ders Ekle</>
        )}
      </Button>
    </form>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export function LessonManagementForms({ courses }: LessonManagementFormsProps) {
  const [tab, setTab] = useState<"lesson" | "course">("lesson");

  return (
    <div>
      {/* Tab Seçici */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl mb-6">
        <TabButton
          active={tab === "lesson"}
          onClick={() => setTab("lesson")}
          icon={Video}
          label="Video Ders Ekle"
          color="bg-edu-cyan/15 border border-edu-cyan/20"
        />
        <TabButton
          active={tab === "course"}
          onClick={() => setTab("course")}
          icon={Layers}
          label="Ünite Oluştur"
          color="bg-edu-orange/15 border border-edu-orange/20"
        />
      </div>

      {/* Form İçeriği */}
      <AnimatePresence mode="wait">
        {tab === "lesson" ? (
          <motion.div
            key="lesson"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AddLessonForm courses={courses} />
          </motion.div>
        ) : (
          <motion.div
            key="course"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AddCourseForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
