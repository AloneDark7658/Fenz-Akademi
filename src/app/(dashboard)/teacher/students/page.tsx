import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap } from "lucide-react";

export const metadata: Metadata = { title: "Öğrenciler" };

export default async function TeacherStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { points: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      classLevel: true,
      points: true,
      streak: true,
    },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Öğrenciler</h1>
        <p className="text-slate-400 text-sm mt-1">
          {students.length} kayıtlı öğrenci — puana göre sıralı
        </p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-slate-500 gap-3">
              <Users className="w-12 h-12 opacity-30" />
              <p className="text-sm">Henüz kayıtlı öğrenci yok</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {students.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors"
                >
                  {/* Sıra */}
                  <span className="w-6 text-center text-xs text-slate-500 font-mono flex-shrink-0">
                    {i + 1}
                  </span>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-edu-cyan/30 to-edu-navy border border-edu-cyan/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Bilgi */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{s.name}</p>
                    <p className="text-xs text-slate-500 truncate">{s.email}</p>
                  </div>
                  {/* Sınıf */}
                  {s.classLevel && (
                    <Badge
                      variant="outline"
                      className="border-white/10 text-slate-400 text-xs flex-shrink-0"
                    >
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {s.classLevel}. Sınıf
                    </Badge>
                  )}
                  {/* XP + Streak */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-edu-cyan">{s.points} XP</p>
                    <p className="text-xs text-edu-orange">🔥 {s.streak} Seri</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
