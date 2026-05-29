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
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = { title: "Panelim" };

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function StudentDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Tüm verileri paralel çek
  const [dbUser, allBadges] = await Promise.all([
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
  ]);

  if (!dbUser) redirect("/login");

  const ownedBadgeIds = dbUser.userBadges.map((ub: any) => ub.badgeId);

  // İstatistik hesapla
  const totalQuizzes = dbUser.quizResults.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          dbUser.quizResults.reduce((acc: number, r: any) => acc + r.score, 0) / totalQuizzes
        )
      : 0;
  const completedLessons = dbUser.progresses.filter(
    (p: any) => p.watchPercentage >= 90
  ).length;
  const xpToNext = 1000 - (dbUser.points % 1000);
  const level = Math.floor(dbUser.points / 1000) + 1;

  const inProgress = dbUser.progresses.filter((p: any) => p.watchPercentage < 90);
  const firstName = dbUser.name.split(" ")[0];

  // --- Analitik Grafikler İçin Gerçek Veriler ---
  
  // 1. Konu Bazlı Başarı (Radar Chart)
  const courseScores: Record<string, { totalScore: number; count: number }> = {};
  dbUser.quizResults.forEach((qr: any) => {
    const courseTitle = qr.lesson.course.title;
    if (!courseScores[courseTitle]) {
      courseScores[courseTitle] = { totalScore: 0, count: 0 };
    }
    courseScores[courseTitle].totalScore += qr.score;
    courseScores[courseTitle].count += 1;
  });

  let subjectPerformanceData = Object.entries(courseScores).map(([subject, stats]: [string, any]) => ({
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

  const weeklyActivityData = last7Days.map((date: Date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const quizzesOnDay = dbUser.quizResults.filter(
      (qr: any) => qr.createdAt >= date && qr.createdAt < nextDay
    );

    const questionCount = quizzesOnDay.reduce(
      (acc: number, qr: any) => acc + qr.correctCount + qr.wrongCount,
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
              Analizlerini takip et, yeni rozetler kazan ve hedeflerine ulaş.
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


      </div>
    </div>
  );
}
