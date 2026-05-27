"use client";

import { useActionState, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateLessonAction, type LessonActionResult } from "@/app/actions/teacher";
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
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import type { CourseOption } from "./LessonManagementForms";

interface LessonData {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  durationHours?: number;
  durationMinutes?: number;
}

interface EditLessonModalProps {
  lesson: LessonData;
  courses: CourseOption[];
  onClose: () => void;
}

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

export function EditLessonModal({ lesson, courses, onClose }: EditLessonModalProps) {
  const [state, formAction, isPending] = useActionState<LessonActionResult | null, FormData>(
    updateLessonAction,
    null
  );
  const errors = getErrors(state);

  // Başarılı olduğunda kapatmak için
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
          <h2 className="text-lg font-bold text-white">Dersi Düzenle</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white h-8 w-8 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form action={formAction} className="p-5 space-y-4">
          <input type="hidden" name="lessonId" value={lesson.id} />

          {state && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              state.success
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              {state.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {state.success ? state.message : state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Bağlı Olduğu Ünite</Label>
            <Select name="courseId" defaultValue={lesson.courseId}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11">
                <SelectValue placeholder="Ünite seçin..." />
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Video Ders Adı</Label>
            <Input
              name="title"
              defaultValue={lesson.title}
              placeholder="örn: Hücre Zarının Yapısı"
              className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11"
            />
            <FieldError errors={errors?.title} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Video Süresi</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  name="durationHours"
                  type="number"
                  min={0}
                  defaultValue={lesson.durationHours}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">Saat</span>
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="flex-1 relative">
                <Input
                  name="durationMinutes"
                  type="number"
                  min={0}
                  max={59}
                  defaultValue={lesson.durationMinutes}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11 pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">Dakika</span>
              </div>
            </div>
            <FieldError errors={errors?.durationHours || errors?.durationMinutes} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Kısa Açıklama <span className="text-slate-500 text-xs font-normal">(opsiyonel)</span></Label>
            <Textarea
              name="description"
              defaultValue={lesson.description}
              rows={2}
              className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl text-sm resize-none"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl font-bold bg-edu-cyan hover:bg-edu-cyan-dark text-edu-navy transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            >
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Kaydediliyor...</> : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
