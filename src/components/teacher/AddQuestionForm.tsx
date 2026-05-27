"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addQuestionAction, type AddQuestionResult } from "@/app/actions/teacher";
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
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type Lesson = { id: string; title: string; courseTitle: string };

interface AddQuestionFormProps {
  lessons: Lesson[];
}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {errors[0]}
    </p>
  );
}

function getFieldErrors(state: AddQuestionResult | null) {
  if (state && !state.success) return state.fieldErrors;
  return undefined;
}

// ─── Şık Input ────────────────────────────────────────────────────────────────

function OptionInput({
  letter,
  name,
  errors,
}: {
  letter: string;
  name: string;
  errors?: string[];
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 flex-shrink-0 rounded-lg bg-edu-cyan/10 border border-edu-cyan/20 flex items-center justify-center text-edu-cyan text-xs font-black">
          {letter}
        </span>
        <Input
          name={name}
          placeholder={`${letter} şıkkını girin...`}
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl h-10 text-sm"
        />
      </div>
      <FieldError errors={errors} />
    </div>
  );
}

// ─── Form Bileşeni ────────────────────────────────────────────────────────────

export function AddQuestionForm({ lessons }: AddQuestionFormProps) {
  const [state, formAction, isPending] = useActionState<
    AddQuestionResult | null,
    FormData
  >(addQuestionAction, null);

  const fieldErrors = getFieldErrors(state);

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
    >
      {/* Durum bildirimleri */}
      <AnimatePresence mode="wait">
        {state?.success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{state.message}</p>
          </motion.div>
        )}
        {state && !state.success && !fieldErrors && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{state.error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form action={formAction} className="space-y-6">
        {/* Ders Seçimi */}
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Ders / Video
          </Label>
          {lessons.length > 0 ? (
            <>
              <Select name="lessonId">
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11">
                  <SelectValue placeholder="Sorunun ait olacağı dersi seçin..." />
                </SelectTrigger>
                <SelectContent className="bg-edu-navy border-white/10 text-white">
                  {lessons.map((l) => (
                    <SelectItem
                      key={l.id}
                      value={l.id}
                      className="focus:bg-edu-cyan/10 focus:text-white"
                    >
                      <span className="text-slate-400 text-xs">{l.courseTitle} › </span>
                      {l.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={fieldErrors?.lessonId} />
            </>
          ) : (
            <p className="text-xs text-slate-500 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              Henüz ders eklenmemiş. Önce bir kurs ve video ders oluşturun.
            </p>
          )}
        </div>

        {/* Soru Metni */}
        <div className="space-y-1.5">
          <Label
            htmlFor="content"
            className="text-slate-300 text-sm font-medium flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Soru Metni
          </Label>
          <Textarea
            id="content"
            name="content"
            placeholder="Soruyu buraya yazın... (örn: Hücre zarının temel görevi nedir?)"
            rows={3}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl text-sm resize-none"
          />
          <FieldError errors={fieldErrors?.content} />
        </div>

        {/* Şıklar */}
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm font-medium">Şıklar</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <OptionInput letter="A" name="optionA" errors={fieldErrors?.optionA} />
            <OptionInput letter="B" name="optionB" errors={fieldErrors?.optionB} />
            <OptionInput letter="C" name="optionC" errors={fieldErrors?.optionC} />
            <OptionInput letter="D" name="optionD" errors={fieldErrors?.optionD} />
          </div>
        </div>

        {/* Doğru Cevap + Zorluk (yan yana) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Doğru Cevap</Label>
            <Select name="correctAnswer">
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11">
                <SelectValue placeholder="Seçiniz..." />
              </SelectTrigger>
              <SelectContent className="bg-edu-navy border-white/10 text-white">
                {["A", "B", "C", "D"].map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    className="focus:bg-green-500/10 focus:text-green-400"
                  >
                    Şık {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors?.correctAnswer} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm font-medium">Zorluk Seviyesi</Label>
            <Select name="difficulty">
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-edu-cyan rounded-xl h-11">
                <SelectValue placeholder="Seçiniz..." />
              </SelectTrigger>
              <SelectContent className="bg-edu-navy border-white/10 text-white">
                <SelectItem value="EASY" className="focus:bg-green-500/10 focus:text-green-400">
                  🟢 Kolay
                </SelectItem>
                <SelectItem value="MEDIUM" className="focus:bg-yellow-500/10 focus:text-yellow-400">
                  🟡 Orta
                </SelectItem>
                <SelectItem value="HARD" className="focus:bg-red-500/10 focus:text-red-400">
                  🔴 Zor
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors?.difficulty} />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending || lessons.length === 0}
          className={cn(
            "w-full h-11 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5",
            "bg-edu-cyan hover:bg-edu-cyan-dark text-edu-navy",
            "shadow-lg shadow-edu-cyan/20 hover:shadow-edu-cyan/40",
            "disabled:opacity-50 disabled:translate-y-0"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Soruyu Kaydet ✓"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
