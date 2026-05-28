import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklyActivityChart } from "@/components/analytics/WeeklyActivityChart";
import { SubjectPerformanceChart } from "@/components/analytics/SubjectPerformanceChart";
import { ParentProgressChart } from "@/components/parent/ParentProgressChart";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  BarChart2,
  Clock,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const metadata: Metadata = { title: "Detaylı Analiz | Fenz Akademi" };

export default async function ParentAnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      children: {
        select: {
          id: true,
          name: true,
          classLevel: true,
          points: true,
          streak: true,
          quizResults: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true,
                  duration: true,
                  course: { select: { title: true } },
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          progresses: {
            include: {
              lesson: { select: { duration: true } },
            },
          },
        },
      },
    },
  });

  if (!dbUser || !["PARENT", "ADMIN"].includes(dbUser.role)) {
    redirect("/login");
  }

  const student = dbUser.children[0];

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 space-y-4">
        <Users className="w-16 h-16 opacity-20" />
        <h2 className="text-xl font-bold text-white">Henüz Öğrenci Eklenmemiş</h2>
        <p className="text-sm">Lütfen önce veli panonuzdan öğrenci ekleyin.</p>
      </div>
    );
  }

  // ── Analitik Hesaplamaları ──────────────────────────────────────────────

  const allQuizzes = student.quizResults;
  const totalQuizzes = allQuizzes.length;
  const totalCorrect = allQuizzes.reduce((a: number, q: any) => a + q.correctCount, 0);
  const totalWrong = allQuizzes.reduce((a: number, q: any) => a + q.wrongCount, 0);
  const totalQuestions = totalCorrect + totalWrong;
  const overallRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Son 7 güne göre aktivite (çözülen soru sayısı)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const weeklyActivityData = last7Days.map((d) => {
    const dayLabel = d.toLocaleDateString("tr-TR", { weekday: "short" });
    const count = allQuizzes
      .filter((q: any) => {
        const qd = new Date(q.createdAt);
        return (
          qd.getDate() === d.getDate() &&
          qd.getMonth() === d.getMonth() &&
          qd.getFullYear() === d.getFullYear()
        );
      })
      .reduce((acc: number, q: any) => acc + q.correctCount + q.wrongCount, 0);
    return { day: dayLabel, count };
  });

  // Son 10 quiz skoru trendi
  const trendData = allQuizzes.slice(-10).map((q: any, i: number) => ({
    date: new Date(q.createdAt).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    }),
    score: q.score,
  }));

  // Konu bazlı başarı (ders adına göre grupla)
  const courseMap: Record<string, { correct: number; wrong: number }> = {};
  for (const q of allQuizzes as any[]) {
    const course = q.lesson?.course?.title ?? "Diğer";
    if (!courseMap[course]) courseMap[course] = { correct: 0, wrong: 0 };
    courseMap[course].correct += q.correctCount;
    courseMap[course].wrong += q.wrongCount;
  }
  const subjectData = Object.entries(courseMap).map(([subject, val]) => {
    const total = val.correct + val.wrong;
    return {
      subject,
      A: total > 0 ? Math.round((val.correct / total) * 100) : 0,
    };
  });

  // İzlenen ders süresi
  const totalWatchedSeconds = student.progresses
    .filter((p: any) => p.watchPercentage >= 90)
    .reduce((acc: number, p: any) => acc + (p.lesson.duration || 0), 0);
  const totalWatchedHours = (totalWatchedSeconds / 3600).toFixed(1);

  // En iyi 3 konu
  const bestSubjects = [...Object.entries(courseMap)]
    .map(([subject, val]) => {
      const total = val.correct + val.wrong;
      return { subject, rate: total > 0 ? Math.round((val.correct / total) * 100) : 0 };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);

  // En zor 3 konu
  const hardestSubjects = [...Object.entries(courseMap)]
    .map(([subject, val]) => {
      const total = val.correct + val.wrong;
      return { subject, rate: total > 0 ? Math.round((val.correct / total) * 100) : 0, wrong: val.wrong };
    })
    .filter(s => s.wrong > 0)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight pb-1">
            Detaylı Analiz
          </h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-semibold">
            <strong className="text-cyan-400">{student.name}</strong> adlı öğrencinin kapsamlı performans raporu
          </p>
        </div>
        <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto">
          {student.classLevel}. Sınıf
        </Badge>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Toplam Quiz",
            value: totalQuizzes,
            sub: "tamamlandı",
            icon: BookOpen,
            color: "cyan",
            glow: "hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]",
            iconBg: "bg-cyan-500/10 border-cyan-500/20",
            iconColor: "text-cyan-400",
          },
          {
            label: "Genel Başarı",
            value: `%${overallRate}`,
            sub: `${totalCorrect} doğru / ${totalWrong} yanlış`,
            icon: Target,
            color: "green",
            glow: "hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]",
            iconBg: "bg-green-500/10 border-green-500/20",
            iconColor: "text-green-400",
          },
          {
            label: "İzlenen Süre",
            value: `${totalWatchedHours}s`,
            sub: "tamamlanan dersler",
            icon: Clock,
            color: "purple",
            glow: "hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]",
            iconBg: "bg-purple-500/10 border-purple-500/20",
            iconColor: "text-purple-400",
          },
          {
            label: "Güncel Seri",
            value: `${student.streak} gün`,
            sub: `${student.points} puan kazanıldı`,
            icon: Zap,
            color: "orange",
            glow: "hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]",
            iconBg: "bg-orange-500/10 border-orange-500/20",
            iconColor: "text-orange-400",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className={`bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${item.glow}`}
          >
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex justify-between items-start mb-3">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider leading-tight">
                  {item.label}
                </p>
                <div className={`p-2 sm:p-3 border rounded-xl sm:rounded-2xl ${item.iconBg}`}>
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{item.value}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1 leading-tight">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafik Satırı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklyActivityChart data={weeklyActivityData} />
        <SubjectPerformanceChart data={subjectData} />
      </div>

      {/* Quiz Skoru Trendi */}
      <Card className="bg-white/5 border border-white/10 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            Quiz Skoru Trendi (Son 10 Test)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ParentProgressChart data={trendData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
              Henüz yeterli test verisi bulunmuyor.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Güçlü / Zayıf Konular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* En İyi Konular */}
        <Card className="bg-white/5 border border-white/10 rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              En Başarılı Konular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestSubjects.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Henüz veri yok.</p>
            ) : (
              bestSubjects.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-black text-lg">#{i + 1}</span>
                    <span className="text-slate-200 font-semibold text-sm">{s.subject}</span>
                  </div>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10 rounded-full px-3 text-xs font-bold">
                    %{s.rate} başarı
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Gelişim Gereken Konular */}
        <Card className="bg-white/5 border border-white/10 rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              Gelişim Gereken Konular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hardestSubjects.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40 text-green-400" />
                <p className="text-sm">Harika! Belirgin bir eksik yok.</p>
              </div>
            ) : (
              hardestSubjects.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 font-black text-lg">#{i + 1}</span>
                    <span className="text-slate-200 font-semibold text-sm">{s.subject}</span>
                  </div>
                  <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 rounded-full px-3 text-xs font-bold">
                    %{s.rate} başarı
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
