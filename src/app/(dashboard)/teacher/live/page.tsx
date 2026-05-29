import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CreateSessionForm } from "@/components/live/CreateSessionForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Radio,
  Clock,
  Users,
  CalendarDays,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

export const metadata: Metadata = { title: "Canlı Dersler | Fenz Akademi" };

const STATUS_MAP = {
  SCHEDULED: { label: "Planlandı", color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  LIVE: { label: "Canlı", color: "border-red-500/30 text-red-400 bg-red-500/10" },
  ENDED: { label: "Sona Erdi", color: "border-slate-500/30 text-slate-400 bg-slate-500/10" },
};

export default async function TeacherLivePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser || !["TEACHER", "ADMIN"].includes(dbUser.role)) {
    redirect("/student");
  }

  const sessions = await prisma.liveSession.findMany({
    where: { teacherId: user.id },
    orderBy: { scheduledFor: "desc" },
    include: {
      course: { select: { title: true } },
      _count: { select: { polls: true } },
    },
  });

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, gradeLevel: true },
    orderBy: { gradeLevel: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight pb-1">
            Canlı Dersler
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            WebRTC tabanlı gerçek zamanlı ders oturumları
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
            {sessions.filter((s) => s.status === "LIVE").length} Aktif
          </span>
        </div>
      </div>

      {/* Yeni Ders Oluşturma Formu */}
      <Card className="bg-white/5 border border-white/10 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Yeni Canlı Ders Oluştur</h2>
              <p className="text-xs text-slate-400">Oturum oluşturulunca Daily.co odası otomatik açılır</p>
            </div>
          </div>
          <CreateSessionForm courses={courses} />
        </CardContent>
      </Card>

      {/* Oturum Listesi */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Oturumlar ({sessions.length})
        </h2>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 rounded-3xl border border-dashed border-white/10">
            <Radio className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Henüz canlı ders oluşturulmadı</p>
            <p className="text-xs mt-1">Yukarıdaki formu kullanarak başlayın</p>
          </div>
        ) : (
          sessions.map((session) => {
            const status = STATUS_MAP[session.status as keyof typeof STATUS_MAP];
            return (
              <Link
                key={session.id}
                href={`/teacher/live/${session.id}`}
                className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/8 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-white/5">
                    <Radio
                      className={`w-5 h-5 ${
                        session.status === "LIVE" ? "text-red-400 animate-pulse" : "text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white text-sm">{session.title}</p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${status.color}`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(session.scheduledFor).toLocaleString("tr-TR", {
                          timeZone: "Europe/Istanbul",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {session.course && (
                        <span className="text-slate-500">•</span>
                      )}
                      {session.course && (
                        <span>{session.course.title}</span>
                      )}
                      <span className="text-slate-500">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {session._count.polls} anket
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
