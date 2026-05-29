import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, HelpCircle, ChevronRight, BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Eğitim Videoları" };

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  return `${m} dk`;
}

export default async function StudentLessonsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [dbUser, recommendedLessons] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        progresses: {
          where: { watchPercentage: { gt: 0 } },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                duration: true,
                course: { select: { title: true } },
                _count: { select: { questions: true } },
              },
            },
          },
          orderBy: { lastWatchedAt: "desc" },
          take: 8,
        },
      },
    }),
    prisma.videoLesson.findMany({
      where: {
        course: {
          isPublished: true,
          gradeLevel: { gte: 5, lte: 8 },
        },
      },
      include: {
        course: { select: { title: true, gradeLevel: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { orderIndex: "asc" },
      take: 12,
    }),
  ]);

  if (!dbUser) redirect("/login");

  const inProgress = dbUser.progresses.filter((p: any) => p.watchPercentage < 90);

  return (
    <div className="space-y-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight pb-2">
          Eğitim Videoları
        </h1>
        <p className="text-slate-400">Yeni konular öğren ve başarıya ulaş.</p>
      </div>

      {/* ── Kaldığın Yerden Devam Et ── */}
      {inProgress.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-edu-orange fill-edu-orange" />
              Kaldığın Yerden Devam Et
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {inProgress.map((prog: any) => (
              <Link key={prog.id} href={`/lessons/${prog.lesson.id}`}>
                <div className="group bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full flex flex-col">
                  <p className="text-xs text-cyan-400 font-bold tracking-wider uppercase mb-2">{prog.lesson.course.title}</p>
                  <h3 className="text-white font-bold text-base leading-snug line-clamp-2 flex-1 group-hover:text-cyan-50 transition-colors">
                    {prog.lesson.title}
                  </h3>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>İlerleme</span>
                      <span className="text-cyan-400 font-black ">%{Math.round(prog.watchPercentage)}</span>
                    </div>
                    <Progress
                      value={prog.watchPercentage}
                      className="h-2 bg-black/40 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {prog.lesson.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(prog.lesson.duration)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        {prog.lesson._count.questions} soru
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-edu-cyan group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Önerilen Dersler ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-edu-cyan" />
            Sana Özel Dersler
          </h2>
          <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
            {recommendedLessons.length} ders
          </Badge>
        </div>

        {recommendedLessons.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Henüz yayınlanmış ders yok.</p>
              <p className="text-xs mt-1 opacity-60">Öğretmenler içerik ekledikçe burada görünecek.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {recommendedLessons.map((lesson: any, i: number) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <div className="group relative bg-white/5 rounded-3xl border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full flex flex-col">
                  <div
                    className="h-1.5 w-full opacity-80"
                    style={{
                      background: `linear-gradient(to right, hsl(${(i * 47) % 360}, 70%, 60%), hsl(${((i * 47) + 30) % 360}, 70%, 60%))`,
                    }}
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                        {lesson.course.gradeLevel}. Sınıf
                      </Badge>
                      {lesson._count.questions > 0 && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <HelpCircle className="w-3 h-3" />
                          {lesson._count.questions}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">{lesson.course.title}</p>
                    <h3 className="text-white font-bold text-base leading-snug line-clamp-2 flex-1 group-hover:text-cyan-50 transition-colors">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      {lesson.duration ? (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatDuration(lesson.duration)}
                        </span>
                      ) : (
                        <span />
                      )}
                      <div className="w-8 h-8 rounded-xl bg-edu-cyan/10 border border-edu-cyan/20 flex items-center justify-center group-hover:bg-edu-cyan/20 transition-colors">
                        <Play className="w-3.5 h-3.5 text-edu-cyan fill-edu-cyan" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
