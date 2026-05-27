import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParentProgressChart } from "@/components/parent/ParentProgressChart";
import {
  Users,
  Target,
  Clock,
  AlertTriangle,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Veli Paneli | Fenz Akademi" };

export default async function ParentDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Veli ve öğrencilerini getir
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
              lesson: { select: { id: true, title: true, course: { select: { title: true } } } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
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

  const student = dbUser.children[0]; // Şimdilik ilk öğrenciyi alıyoruz

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Users className="w-16 h-16 opacity-20 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Henüz Öğrenci Eklenmemiş</h2>
        <p className="text-sm">Hesabınıza bağlı bir öğrenci bulunmuyor.</p>
      </div>
    );
  }

  // --- Analitik Hesaplamaları ---
  
  // 1. Haftalık Çözülen Soru & Başarı Oranı
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyQuizzes = student.quizResults.filter(q => q.createdAt >= oneWeekAgo);
  const weeklyTotalQuestions = weeklyQuizzes.reduce((acc, q) => acc + q.correctCount + q.wrongCount, 0);
  const weeklyCorrects = weeklyQuizzes.reduce((acc, q) => acc + q.correctCount, 0);
  const weeklySuccessRate = weeklyTotalQuestions > 0 ? Math.round((weeklyCorrects / weeklyTotalQuestions) * 100) : 0;

  const totalSuccessRate = student.quizResults.length > 0 
    ? Math.round(student.quizResults.reduce((acc, q) => acc + q.score, 0) / student.quizResults.length) 
    : 0;

  // 2. İzlenen Ders Süresi (Tamamlananlar üzerinden)
  const totalWatchedSeconds = student.progresses
    .filter(p => p.watchPercentage >= 90)
    .reduce((acc, p) => acc + (p.lesson.duration || 0), 0);
  const totalWatchedHours = (totalWatchedSeconds / 3600).toFixed(1);

  // 3. Zayıf Noktalar (Son quizlerde yanlış yapılan dersler)
  const weakPoints = student.quizResults
    .filter(q => q.wrongCount > 0)
    .map(q => ({
      lessonId: q.lesson.id,
      lessonTitle: q.lesson.title,
      courseTitle: q.lesson.course.title,
      wrongCount: q.wrongCount,
      date: q.createdAt,
    }))
    .reduce((acc, curr) => {
      // Aynı dersten olan yanlışları birleştir (en son tarihi al)
      const existing = acc.find(item => item.lessonId === curr.lessonId);
      if (existing) {
        existing.wrongCount += curr.wrongCount;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 5); // En çok yanlış yapılan 5 konu

  // 4. Grafik Verisi (Son 7 quiz skoru)
  const chartData = [...student.quizResults]
    .reverse()
    .slice(-7)
    .map((q, i) => ({
      date: q.createdAt.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      score: q.score,
    }));

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Veli Paneli</h1>
          <p className="text-slate-400 text-sm mt-1">
            <strong className="text-edu-cyan">{student.name}</strong> adlı öğrencinin gelişim raporu
          </p>
        </div>
        <Badge variant="outline" className="border-edu-cyan/30 text-edu-cyan bg-edu-cyan/10">
          {student.classLevel}. Sınıf
        </Badge>
      </div>

      {/* Üst Analitik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-white/10 relative overflow-hidden group hover:border-edu-cyan/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-edu-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-sm font-medium">Haftalık Soru Çözümü</p>
              <div className="p-2 bg-edu-cyan/10 rounded-lg">
                <Target className="w-5 h-5 text-edu-cyan" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{weeklyTotalQuestions}</p>
            <p className="text-xs text-slate-500 mt-2">
              <span className="text-edu-cyan font-bold">%{weeklySuccessRate}</span> haftalık başarı oranı
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10 relative overflow-hidden group hover:border-edu-orange/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-edu-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-sm font-medium">Genel Başarı Oranı</p>
              <div className="p-2 bg-edu-orange/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-edu-orange" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">%{totalSuccessRate}</p>
            <p className="text-xs text-slate-500 mt-2">
              Toplam {student.quizResults.length} deneme üzerinden
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-sm font-medium">İzlenen Ders Süresi</p>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{totalWatchedHours} <span className="text-lg font-semibold text-slate-400">saat</span></p>
            <p className="text-xs text-slate-500 mt-2">
              Güncel seri: <strong className="text-edu-orange">{student.streak} gün 🔥</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Alanı */}
        <Card className="glass border-white/10 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base font-semibold">Gelişim Grafiği (Son Testler)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ParentProgressChart data={chartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl mt-4">
                Yeterli veri bulunmuyor.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zayıf Noktalar Tablosu */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-edu-orange" />
              Gelişim Alanları (Eksikler)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakPoints.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-40 text-green-400" />
                <p className="text-sm">Harika! Belirgin bir eksik yok.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {weakPoints.map((wp: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 mb-0.5">{wp.courseTitle}</p>
                        <p className="text-sm text-slate-200 font-medium leading-snug line-clamp-2">
                          {wp.lessonTitle}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-red-500/20 text-red-400 bg-red-500/10 ml-2 whitespace-nowrap">
                        {wp.wrongCount} Yanlış
                      </Badge>
                    </div>
                    {/* Yönlendirme (Opsiyonel - Öğrenci hesabıyla giriş yapılması gerektiği için sadece bilgi verilebilir) */}
                    <div className="flex items-center gap-1 text-xs text-edu-cyan font-medium pt-1">
                      <PlayCircle className="w-3 h-3" /> Sistem tekrar önerdi
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
