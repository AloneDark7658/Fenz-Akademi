import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BadgeCollection } from "@/components/student/BadgeCollection";
import { InviteCodeCard } from "@/components/student/InviteCodeCard";
import { WeeklyActivityChart } from "@/components/analytics/WeeklyActivityChart";
import { SubjectPerformanceChart } from "@/components/analytics/SubjectPerformanceChart";
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
        inviteCode: true,
        quizResults: { 
          select: { 
            score: true, 
            correctCount: true, 
            wrongCount: true,
            createdAt: true,
            lesson: {
              select: {
                course: { select: { title: true } }
              }
            }
          } 
        },
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

  const inProgress = dbUser.progresses.filter((p) => p.watchPercentage < 90);
  const firstName = dbUser.name.split(" ")[0];

  // --- Analitik Grafikler İçin Gerçek Veriler ---
  
  // 1. Konu Bazlı Başarı (Radar Chart)
  const courseScores: Record<string, { totalScore: number; count: number }> = {};
  dbUser.quizResults.forEach((qr) => {
    const courseTitle = qr.lesson.course.title;
    if (!courseScores[courseTitle]) {
      courseScores[courseTitle] = { totalScore: 0, count: 0 };
    }
    courseScores[courseTitle].totalScore += qr.score;
    courseScores[courseTitle].count += 1;
  });

  let subjectPerformanceData = Object.entries(courseScores).map(([subject, stats]) => ({
    subject: subject.length > 12 ? subject.substring(0, 10) + ".." : subject,
    A: Math.round(stats.totalScore / stats.count),
    fullMark: 100
  }));
  
  // Radar grafiğinin düzgün çizilebilmesi için en az 3 nokta olması iyidir. 
  // Eğer hiç veri yoksa boş liste, varsa olanları gösterir.

  // 2. Haftalık Soru Aktivitesi (Area Chart)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const daysOfWeek = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  const weeklyActivityData = last7Days.map((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const quizzesOnDay = dbUser.quizResults.filter(
      (qr) => qr.createdAt >= date && qr.createdAt < nextDay
    );

    const questionCount = quizzesOnDay.reduce(
      (acc, qr) => acc + qr.correctCount + qr.wrongCount,
      0
    );

    return {
      day: daysOfWeek[date.getDay()],
      count: questionCount,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 selection:bg-edu-cyan/30">
      {/* Arka plan dekorasyon (Performans Optimizasyonlu) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-900/0 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-900/0 to-transparent opacity-60" />
      </div>

      <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-10 space-y-12">

        {/* ── Hero Karşılama ── */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2 tracking-wide uppercase">
              {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight pb-2">
              Merhaba, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 ">{firstName}</span>! 👋
            </h1>
            <p className="text-slate-400 mt-2">
              Öğrenmeye kaldığın yerden devam et. {allLessons} ders seni bekliyor.
            </p>
          </div>

          {/* Seviye Rozeti */}
          <div className="flex-shrink-0 bg-white/5 rounded-3xl px-8 py-5 border border-white/10 shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-300 flex items-center gap-5">
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
            <Card key={label} className={`bg-white/5 border border-white/10 rounded-2xl hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] hover:border-white/20 hover:scale-[1.02] transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{label}</p>
                  <div className={`p-2 rounded-xl ${bg.split(" ")[0]} border border-white/5`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
                <p className={`text-4xl font-black ${color} `}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Analitik Raporlar (Grafikler) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyActivityChart data={weeklyActivityData} />
          <SubjectPerformanceChart data={subjectPerformanceData.length > 0 ? subjectPerformanceData : undefined} />
        </section>

        {/* ── Davet Kodu & Eşleştirme ── */}
        <section>
          <InviteCodeCard initialCode={dbUser.inviteCode} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inProgress.map((prog) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedLessons.map((lesson, i) => (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <div className="group relative bg-white/5 rounded-3xl border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full flex flex-col">
                    {/* Renk şeridi üstte */}
                    <div
                      className="h-1.5 w-full opacity-80"
                      style={{
                        background: `linear-gradient(to right, hsl(${(i * 47) % 360}, 70%, 60%), hsl(${((i * 47) + 30) % 360}, 70%, 60%))`,
                      }}
                    />
                    <div className="p-6 flex flex-col flex-1">
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
    </div>
  );
}
