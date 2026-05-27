import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BadgeCollection } from "@/components/student/BadgeCollection";
import {
  Flame,
  Star,
  BookOpen,
  Trophy,
  Play,
  ChevronRight,
  Sparkles,
  Clock,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = { title: "Panelim" };

// ─── Yardımcı ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  return `${m} dk`;
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function StudentDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Tüm verileri paralel çek
  const [dbUser, allBadges, recommendedLessons, allLessons] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        points: true,
        streak: true,
        classLevel: true,
        quizResults: { select: { score: true, correctCount: true, wrongCount: true } },
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
          take: 6,
        },
        userBadges: { select: { badgeId: true } },
      },
    }),

    // Sistemdeki tüm rozetler
    prisma.badge.findMany({ orderBy: { requirementValue: "asc" } }),

    // Sınıf seviyesine göre önerilen dersler
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
      take: 8,
    }),

    // Toplam ders sayısı
    prisma.videoLesson.count({
      where: { course: { isPublished: true } },
    }),
  ]);

  if (!dbUser) redirect("/login");

  const ownedBadgeIds = dbUser.userBadges.map((ub) => ub.badgeId);

  // İstatistik hesapla
  const totalQuizzes = dbUser.quizResults.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          dbUser.quizResults.reduce((acc, r) => acc + r.score, 0) / totalQuizzes
        )
      : 0;
  const completedLessons = dbUser.progresses.filter(
    (p) => p.watchPercentage >= 90
  ).length;
  const xpToNext = 1000 - (dbUser.points % 1000);
  const level = Math.floor(dbUser.points / 1000) + 1;

  // Devam eden ve tamamlanan dersler
  const inProgress = dbUser.progresses.filter((p) => p.watchPercentage < 90);
  const firstName = dbUser.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Arka plan dekorasyon */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-edu-cyan/5 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-edu-orange/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* ── Hero Karşılama ── */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Merhaba, <span className="text-edu-cyan">{firstName}</span>! 👋
            </h1>
            <p className="text-slate-400 mt-2">
              Öğrenmeye kaldığın yerden devam et. {allLessons} ders seni bekliyor.
            </p>
          </div>

          {/* Seviye Rozeti */}
          <div className="flex-shrink-0 glass rounded-2xl px-6 py-4 border border-white/10 flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-edu-cyan to-edu-navy border border-edu-cyan/30 flex items-center justify-center text-2xl font-black text-white">
                {level}
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-edu-orange animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Seviye {level}</p>
              <p className="text-white font-bold text-sm mt-0.5">{dbUser.points} XP</p>
              <div className="w-28 mt-1.5">
                <Progress value={((1000 - xpToNext) / 1000) * 100} className="h-1.5 bg-white/10 [&>div]:bg-edu-cyan" />
              </div>
              <p className="text-xs text-slate-500 mt-1">{xpToNext} XP → Seviye {level + 1}</p>
            </div>
          </div>
        </section>

        {/* ── İstatistik Kartları ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Günlük Seri",
              value: `${dbUser.streak} Gün`,
              icon: Flame,
              color: "text-edu-orange",
              bg: "bg-edu-orange/10 border-edu-orange/20",
              sub: dbUser.streak > 0 ? "Harika! Seriyi koru 🔥" : "Bugün başla!",
            },
            {
              label: "Çözülen Quiz",
              value: totalQuizzes,
              icon: Trophy,
              color: "text-yellow-400",
              bg: "bg-yellow-400/10 border-yellow-400/20",
              sub: `${completedLessons} ders tamamlandı`,
            },
            {
              label: "Başarı Oranı",
              value: `%${avgScore}`,
              icon: Star,
              color: "text-edu-cyan",
              bg: "bg-edu-cyan/10 border-edu-cyan/20",
              sub: totalQuizzes > 0 ? "Ortalama skor" : "Henüz quiz yok",
            },
            {
              label: "Tamamlanan",
              value: completedLessons,
              icon: BookOpen,
              color: "text-purple-400",
              bg: "bg-purple-400/10 border-purple-400/20",
              sub: "Video ders",
            },
          ].map(({ label, value, icon: Icon, color, bg, sub }) => (
            <Card key={label} className={`border ${bg} bg-transparent hover:scale-[1.02] transition-transform`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-400 text-xs font-medium">{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Başarılarım / Koleksiyonum ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-edu-cyan" />
              Başarılarım
            </h2>
            <Badge variant="outline" className="border-edu-cyan/30 text-edu-cyan bg-edu-cyan/10">
              {ownedBadgeIds.length} / {allBadges.length} Kazanıldı
            </Badge>
          </div>
          <BadgeCollection allBadges={allBadges} ownedBadgeIds={ownedBadgeIds} />
        </section>

        {/* ── Kaldığın Yerden Devam Et ── */}
        {inProgress.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-edu-orange fill-edu-orange" />
                Kaldığın Yerden Devam Et
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgress.map((prog) => (
                <Link key={prog.id} href={`/dashboard/lessons/${prog.lesson.id}`}>
                  <div className="group glass rounded-2xl p-5 border border-white/10 hover:border-edu-cyan/30 hover:shadow-lg hover:shadow-edu-cyan/10 transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                    <p className="text-xs text-edu-cyan/80 font-medium mb-1">{prog.lesson.course.title}</p>
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 flex-1">
                      {prog.lesson.title}
                    </h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>İlerleme</span>
                        <span className="text-edu-cyan font-bold">%{Math.round(prog.watchPercentage)}</span>
                      </div>
                      <Progress
                        value={prog.watchPercentage}
                        className="h-1.5 bg-white/10 [&>div]:bg-edu-cyan"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
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

        {/* ── Önerilen Dersler (Grid) ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-edu-cyan" />
              {inProgress.length > 0 ? "Keşfet" : "Sana Özel Dersler"}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedLessons.map((lesson, i) => (
                <Link key={lesson.id} href={`/dashboard/lessons/${lesson.id}`}>
                  <div className="group relative glass rounded-2xl border border-white/10 hover:border-edu-cyan/40 hover:shadow-xl hover:shadow-edu-cyan/10 transition-all hover:-translate-y-1.5 cursor-pointer overflow-hidden h-full flex flex-col">
                    {/* Renk şeridi üstte */}
                    <div
                      className="h-1 w-full"
                      style={{
                        background: `hsl(${(i * 47) % 360}, 70%, 60%)`,
                      }}
                    />
                    <div className="p-5 flex flex-col flex-1">
                      {/* Sınıf rozeti */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className="border-white/10 text-slate-400 text-xs"
                        >
                          {lesson.course.gradeLevel}. Sınıf
                        </Badge>
                        {lesson._count.questions > 0 && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <HelpCircle className="w-3 h-3" />
                            {lesson._count.questions}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mb-1">{lesson.course.title}</p>
                      <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 flex-1">
                        {lesson.title}
                      </h3>

                      <div className="flex items-center justify-between mt-4">
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
    </div>
  );
}
