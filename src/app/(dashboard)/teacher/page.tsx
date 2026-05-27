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
    <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium">{label}</p>
          <p className="text-3xl font-black text-white mt-0.5">{value}</p>
          {delta && (
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {delta}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-6 h-6" />
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
    <div className="space-y-8 max-w-6xl">
      {/* Karşılama */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Hoş geldin! 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Toplam Soru"
          value={totalQuestions}
          icon={BookOpen}
          color="bg-edu-cyan/10 text-edu-cyan"
          delta="+3 bu hafta"
        />
        <StatCard
          label="Video Ders"
          value={totalLessons}
          icon={ClipboardList}
          color="bg-edu-orange/10 text-edu-orange"
        />
        <StatCard
          label="Aktif Öğrenci"
          value={totalStudents}
          icon={Users}
          color="bg-purple-400/10 text-purple-400"
          delta="+12 bu ay"
        />
      </div>

      {/* Hızlı Erişim + Son Sorular */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hızlı İşlemler */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Hızlı İşlemler</h2>
            <div className="space-y-2">
              <Link
                href="/teacher/questions"
                className="flex items-center gap-3 p-3 rounded-xl bg-edu-cyan/5 border border-edu-cyan/20 hover:bg-edu-cyan/10 transition-colors group"
              >
                <Plus className="w-4 h-4 text-edu-cyan" />
                <span className="text-sm text-white font-medium">Soru Ekle</span>
              </Link>
              <Link
                href="/teacher/exams"
                className="flex items-center gap-3 p-3 rounded-xl bg-edu-orange/5 border border-edu-orange/20 hover:bg-edu-orange/10 transition-colors"
              >
                <ClipboardList className="w-4 h-4 text-edu-orange" />
                <span className="text-sm text-white font-medium">Sınav Oluştur</span>
              </Link>
              <Link
                href="/teacher/students"
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-400/5 border border-purple-400/20 hover:bg-purple-400/10 transition-colors"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white font-medium">Öğrencileri Gör</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Son Eklenen Sorular */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Son Eklenen Sorular</h2>
            {recentQuestions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">
                Henüz soru eklenmemiş.
              </p>
            ) : (
              <div className="space-y-2">
                {recentQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{q.content}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{q.lesson.title}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        q.status === "PUBLISHED"
                          ? "border-green-500/30 text-green-400 text-xs flex-shrink-0"
                          : "border-yellow-500/30 text-yellow-400 text-xs flex-shrink-0"
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
