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
import { Progress } from "@/components/ui/progress";
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
  Link as LinkIcon,
  Youtube,
  FileVideo,
  UploadCloud,
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

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [bunnyVideoId, setBunnyVideoId] = useState("");
  const [videoMode, setVideoMode] = useState<"youtube" | "bunny">("youtube");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubePreviewId, setYoutubePreviewId] = useState("");
  const [youtubeError, setYoutubeError] = useState("");

  function extractYoutubeId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match?.[1] ?? null;
  }

  const handleYoutubeInput = (val: string) => {
    setYoutubeInput(val);
    setYoutubeError("");
    if (!val) { setYoutubePreviewId(""); setBunnyVideoId(""); return; }
    const id = extractYoutubeId(val);
    if (id) { setYoutubePreviewId(id); setBunnyVideoId(val); }
    else { setYoutubePreviewId(""); setBunnyVideoId(""); if (val.length > 10) setYoutubeError("Geçerli bir YouTube linki girin."); }
  };

  const switchMode = (mode: "youtube" | "bunny") => {
    setVideoMode(mode);
    setBunnyVideoId("");
    setYoutubeInput("");
    setYoutubePreviewId("");
    setYoutubeError("");
    setUploadProgress(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress(10);
      const res = await fetch("/api/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: file.name }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.isMock) {
        let p = 10;
        const interval = setInterval(() => {
          p += 20; setUploadProgress(p);
          if (p >= 100) { clearInterval(interval); setBunnyVideoId(data.videoId); setIsUploading(false); }
        }, 300);
      } else {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", data.uploadUrl, true);
          xhr.setRequestHeader("AccessKey", data.token);
          xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100)); };
          xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { setBunnyVideoId(data.videoId); setIsUploading(false); resolve(); } else reject(new Error("Yükleme başarısız")); };
          xhr.onerror = () => reject(new Error("İnternet hatası"));
          xhr.send(file);
        });
      }
    } catch (err) {
      console.error(err); alert("Video yüklenirken hata oluştu.");
      setIsUploading(false); setUploadProgress(0);
    }
  };



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

      {/* Video Yükleme — Mod Seçici */}
      <div className="space-y-3">
        <Label className="text-slate-300 text-sm font-medium">Ders Videosu</Label>
        <input type="hidden" name="bunnyVideoId" value={bunnyVideoId} />

        {/* Tab Toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5 p-1 gap-1">
          <button
            type="button"
            onClick={() => switchMode("youtube")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              videoMode === "youtube"
                ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Youtube className="w-4 h-4" />
            YouTube URL
          </button>
          <button
            type="button"
            onClick={() => switchMode("bunny")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              videoMode === "bunny"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Bunny.net Yükle
          </button>
        </div>

        {/* YouTube Modu */}
        {videoMode === "youtube" && (
          <div className="space-y-2">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={youtubeInput}
                onChange={(e) => handleYoutubeInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-red-400/50 rounded-xl h-11"
              />
              {youtubePreviewId && (
                <button type="button" onClick={() => { setYoutubeInput(""); setYoutubePreviewId(""); setBunnyVideoId(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 transition-colors text-xs">
                  Temizle
                </button>
              )}
            </div>
            {youtubeError && (
              <p className="flex items-center gap-1 text-red-400 text-xs">
                <AlertCircle className="w-3 h-3" />{youtubeError}
              </p>
            )}
            {youtubePreviewId && (
              <div className="rounded-2xl overflow-hidden border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-semibold">Video bulundu — ön izleme</span>
                </div>
                <div className="aspect-video">
                  <iframe src={`https://www.youtube.com/embed/${youtubePreviewId}?rel=0&modestbranding=1`}
                    className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media" allowFullScreen />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bunny.net Modu */}
        {videoMode === "bunny" && (
          <div className="space-y-2">
            {!bunnyVideoId ? (
              <div className="relative">
                <input type="file" accept="video/*" className="hidden" id="video-upload"
                  onChange={handleFileUpload} disabled={isUploading} />
                <Label htmlFor="video-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isUploading ? "border-edu-cyan/50 bg-edu-cyan/5" : "border-white/10 bg-white/5 hover:border-edu-cyan/50 hover:bg-white/10"
                  }`}>
                  {isUploading ? (
                    <div className="flex flex-col items-center w-full px-8">
                      <Loader2 className="w-8 h-8 text-edu-cyan animate-spin mb-3" />
                      <Progress value={uploadProgress} className="h-2 w-full bg-slate-800" />
                      <span className="text-edu-cyan text-sm mt-2 font-medium">%{uploadProgress} Yükleniyor...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <UploadCloud className="w-8 h-8 mb-2 text-slate-300" />
                      <span className="text-sm">Video seçmek için tıklayın</span>
                      <span className="text-xs opacity-70 mt-1">MP4, WebM — Sınırsız boyut</span>
                    </div>
                  )}
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                <FileVideo className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Video yüklendi — HLS'e dönüştürülüyor</p>
                  <p className="text-xs opacity-70 font-mono truncate">{bunnyVideoId}</p>
                </div>
                <Button type="button" variant="ghost" size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={() => { setBunnyVideoId(""); setUploadProgress(0); }}>
                  Kaldır
                </Button>
              </div>
            )}
          </div>
        )}

        <FieldError errors={errors?.bunnyVideoId} />
      </div>

      {/* Süre */}
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-sm font-medium">
          Video Süresi <span className="text-slate-500 text-xs font-normal">(opsiyonel)</span>
        </Label>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              name="durationHours"
              type="number"
              min={0}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl h-11 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">
              Saat
            </span>
          </div>
          <span className="text-slate-500 font-bold">:</span>
          <div className="flex-1 relative">
            <Input
              name="durationMinutes"
              type="number"
              min={0}
              max={59}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl h-11 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">
              Dakika
            </span>
          </div>
        </div>
        <FieldError errors={errors?.durationHours || errors?.durationMinutes} />
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
