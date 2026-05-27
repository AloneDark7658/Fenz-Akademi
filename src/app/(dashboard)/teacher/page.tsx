import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, ClipboardList, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export const metadata: Metadata = { title: "Öğretmen Paneli" };

// ─── İstatistik Kartı ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delta,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  delta?: string;
}) {
  return (
    <Card className="bg-white/5 border border-white/10 rounded-3xl hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{label}</p>
          <p className="text-4xl font-black text-white mt-1 ">{value}</p>
          {delta && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> {delta}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} border border-white/5`}>
          <Icon className="w-7 h-7" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function TeacherDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // İstatistikleri getir
  const [totalQuestions, totalLessons, totalStudents, recentQuestions] =
    await Promise.all([
      prisma.question.count(),
      prisma.videoLesson.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.question.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { lesson: { select: { title: true } } },
      }),
    ]);

  return (
    <div className="space-y-10">
      {/* Karşılama */}
      <div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight pb-1">
          Hoş geldin! 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-semibold">
          {new Date().toLocaleDateString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Toplam Soru"
          value={totalQuestions}
          icon={BookOpen}
          color="bg-cyan-500/10 text-cyan-400"
          delta="+3 bu hafta"
        />
        <StatCard
          label="Video Ders"
          value={totalLessons}
          icon={ClipboardList}
          color="bg-orange-500/10 text-orange-400"
        />
        <StatCard
          label="Aktif Öğrenci"
          value={totalStudents}
          icon={Users}
          color="bg-purple-500/10 text-purple-400"
          delta="+12 bu ay"
        />
      </div>

      {/* Hızlı Erişim + Son Sorular */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hızlı İşlemler */}
        <Card className="bg-white/5 border border-white/10 rounded-3xl">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-slate-300 mb-5 uppercase tracking-wider">Hızlı İşlemler</h2>
            <div className="space-y-3">
              <Link
                href="/teacher/questions"
                className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all group"
              >
                <Plus className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-white font-semibold">Soru Ekle</span>
              </Link>
              <Link
                href="/teacher/exams"
                className="flex items-center gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all"
              >
                <ClipboardList className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-white font-semibold">Sınav Oluştur</span>
              </Link>
              <Link
                href="/teacher/students"
                className="flex items-center gap-4 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all"
              >
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-white font-semibold">Öğrencileri Gör</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Son Eklenen Sorular */}
        <Card className="bg-white/5 border border-white/10 rounded-3xl lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-slate-300 mb-5 uppercase tracking-wider">Son Eklenen Sorular</h2>
            {recentQuestions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">
                Henüz soru eklenmemiş.
              </p>
            ) : (
              <div className="space-y-2">
                {recentQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/20 hover:bg-white/5 border border-white/5 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-base text-white font-semibold truncate">{q.content}</p>
                      <p className="text-sm text-cyan-400 mt-1">{q.lesson.title}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        q.status === "PUBLISHED"
                          ? "border-green-500/30 bg-green-500/10 text-green-400 text-xs flex-shrink-0 px-3 py-1 rounded-full"
                          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs flex-shrink-0 px-3 py-1 rounded-full"
                      }
                    >
                      {q.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                    </Badge>
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
