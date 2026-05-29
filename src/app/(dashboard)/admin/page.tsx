import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/components/admin/UsersTable";
import { Users, GraduationCap, Video, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Komuta Merkezi",
};

export default async function AdminDashboardPage() {
  // Verileri paralel çek
  const [
    totalStudents,
    totalTeachers,
    totalLessons,
    totalQuestions,
    allUsers
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.videoLesson.count(),
    prisma.question.count(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        createdAt: true,
        parentId: true,
        parent: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-10">
      {/* ─── BAŞLIK ─── */}
      <section>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight pb-1">
          Komuta Merkezi
        </h1>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-semibold">
          Platform Genel İstatistikleri ve Kullanıcı Yönetimi
        </p>
      </section>

      {/* ─── ÖZET KARTLARI ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Öğrenci", value: totalStudents, icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Toplam Öğretmen", value: totalTeachers, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Video Dersler", value: totalLessons, icon: Video, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Soru Havuzu", value: totalQuestions, icon: HelpCircle, color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/5 border border-white/10 rounded-3xl hover:border-white/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <div className={`p-2.5 rounded-xl ${stat.bg} border border-white/5`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-4xl font-black text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ─── KULLANICI TABLOSU ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-white">Kullanıcı Yönetimi (CRUD)</h2>
        </div>
        <UsersTable initialUsers={allUsers} />
      </section>
    </div>
  );
}
