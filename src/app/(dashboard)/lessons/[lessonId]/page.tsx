import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoPlayerWithTracking } from "@/components/VideoPlayerWithTracking";
import {
  ChevronRight,
  BookOpen,
  HelpCircle,
  Play,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Zap,
} from "lucide-react";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await prisma.videoLesson.findUnique({
    where: { id: lessonId },
    select: { title: true },
  });
  return { title: lesson?.title ?? "Ders" };
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Dersi, kursunu ve ünite derslerini paralel çek
  const [lesson, progress] = await Promise.all([
    prisma.videoLesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            videoLessons: {
              orderBy: { orderIndex: "asc" },
              select: { id: true, title: true, duration: true },
            },
          },
        },
        _count: { select: { questions: true } },
      },
    }),
    prisma.progress.findUnique({
      where: {
        studentId_lessonId: { studentId: user.id, lessonId },
      },
      select: { watchPercentage: true, isCompleted: true },
    }),
  ]);

  if (!lesson) notFound();

  const hasQuiz = lesson._count.questions > 0;
  const isCompleted = (progress?.watchPercentage ?? 0) >= 90;
  const videoUrl =
    lesson.bunnyVideoId ??
    "mock-bunny-id-placeholder";

  // Sonraki ve önceki dersleri bul
  const siblings = lesson.course.videoLessons;
  const currentIdx = siblings.findIndex((l) => l.id === lessonId);
  const nextLesson = siblings[currentIdx + 1] ?? null;
  const prevLesson = siblings[currentIdx - 1] ?? null;

  function formatDuration(s: number | null) {
    if (!s) return null;
    return `${Math.floor(s / 60)} dk`;
  }

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Arka plan parlamalar */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-edu-cyan/5 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/student" className="flex items-center gap-1 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Panelim
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-slate-500">{lesson.course.title}</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-white font-medium line-clamp-1">{lesson.title}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Sol/Ana: Video + Başlık + Quize Git ── */}
          <div className="xl:col-span-2 space-y-5">
            {/* Video Oynatıcı */}
            <VideoPlayerWithTracking
              lessonId={lessonId}
              videoUrl={videoUrl}
            />

            {/* Başlık ve Tamamlanma Durumu */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-start gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-edu-cyan/80 text-sm font-medium mb-1">
                    {lesson.course.title}
                  </p>
                  <h1 className="text-2xl font-black text-white leading-tight">
                    {lesson.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {lesson.duration && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(lesson.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {lesson._count.questions} soru
                    </span>
                    {isCompleted && (
                      <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Tamamlandı
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Quiz'e Git Butonu */}
              {hasQuiz ? (
                <Link href={`/dashboard/lessons/${lessonId}/quiz`}>
                  <div className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-edu-orange/20 to-edu-cyan/20 border border-edu-orange/30 p-5 hover:border-edu-orange/60 hover:shadow-lg hover:shadow-edu-orange/10 transition-all group cursor-pointer">
                    {/* Parlama efekti */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-edu-orange/5 to-edu-cyan/5" />

                    <div className="relative flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-edu-orange" />
                          <span className="text-sm font-bold text-white">Testi Çöz</span>
                          <Badge className="bg-edu-orange/20 text-edu-orange border-edu-orange/30 text-xs">
                            {lesson._count.questions} Soru
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          Bu dersi ne kadar anladığını test et ve XP kazan
                        </p>
                      </div>
                      <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-edu-orange/20 border border-edu-orange/30 flex items-center justify-center group-hover:bg-edu-orange/30 group-hover:scale-110 transition-all">
                        <Play className="w-5 h-5 text-edu-orange fill-edu-orange ml-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4 text-center text-slate-500">
                  <HelpCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Bu ders için henüz soru eklenmemiş.</p>
                </div>
              )}
            </div>

            {/* Önceki / Sonraki Ders */}
            <div className="grid grid-cols-2 gap-3">
              {prevLesson ? (
                <Link href={`/dashboard/lessons/${prevLesson.id}`}>
                  <div className="glass rounded-xl p-4 border border-white/10 hover:border-edu-cyan/30 transition-all group h-full">
                    <p className="text-xs text-slate-500 mb-1">← Önceki</p>
                    <p className="text-sm text-white font-medium line-clamp-2 group-hover:text-edu-cyan transition-colors">
                      {prevLesson.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextLesson ? (
                <Link href={`/dashboard/lessons/${nextLesson.id}`}>
                  <div className="glass rounded-xl p-4 border border-white/10 hover:border-edu-cyan/30 transition-all group h-full text-right">
                    <p className="text-xs text-slate-500 mb-1">Sonraki →</p>
                    <p className="text-sm text-white font-medium line-clamp-2 group-hover:text-edu-cyan transition-colors">
                      {nextLesson.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* ── Sağ Panel: Ünite Ders Listesi ── */}
          <div>
            <Card className="bg-white/5 border-white/10 sticky top-6">
              <CardContent className="p-0">
                <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-edu-cyan" />
                  <h2 className="text-sm font-semibold text-white">{lesson.course.title}</h2>
                </div>
                <div className="divide-y divide-white/5 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {siblings.map((sib, idx) => {
                    const isCurrent = sib.id === lessonId;
                    return (
                      <Link key={sib.id} href={`/dashboard/lessons/${sib.id}`}>
                        <div
                          className={`flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors ${
                            isCurrent ? "bg-edu-cyan/10" : ""
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isCurrent
                                ? "bg-edu-cyan text-edu-navy"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm line-clamp-2 leading-snug ${
                                isCurrent ? "text-edu-cyan font-semibold" : "text-slate-300"
                              }`}
                            >
                              {sib.title}
                            </p>
                            {sib.duration && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatDuration(sib.duration)}
                              </p>
                            )}
                          </div>
                          {isCurrent && (
                            <Play className="w-3.5 h-3.5 text-edu-cyan fill-edu-cyan flex-shrink-0" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
