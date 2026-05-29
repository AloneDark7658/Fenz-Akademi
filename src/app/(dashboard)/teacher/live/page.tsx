import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CreateSessionForm } from "@/components/live/CreateSessionForm";
import { SessionActions } from "@/components/live/SessionActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, Users, CalendarDays, ChevronRight, PlusCircle, LayoutGrid } from "lucide-react";

export const metadata: Metadata = { title: "Canlı Dersler | Fenz Akademi" };

const STATUS_MAP = {
  SCHEDULED: { label: "Planlandı", color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
  LIVE: { label: "Canlı", color: "border-red-500/30 text-red-400 bg-red-500/10" },
  ENDED: { label: "Sona Erdi", color: "border-slate-500/30 text-slate-400 bg-slate-500/10" },
};

export default async function TeacherLivePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!dbUser || !["TEACHER", "ADMIN"].includes(dbUser.role)) redirect("/student");

  // Yalnızca ana (parent) veya normal oturumları getir
  const parentSessions = await prisma.liveSession.findMany({
    where: { teacherId: user.id, parentSessionId: null },
    orderBy: { scheduledFor: "desc" },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { polls: true } },
      childSessions: {
        orderBy: { groupIndex: 'asc' },
        include: {
          _count: { select: { members: true } }
        }
      }
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
          <p className="text-slate-400 text-sm mt-1">WebRTC tabanlı gerçek zamanlı ders oturumları</p>
        </div>
      </div>

      {/* Oluşturma Formu */}
      <Card className="bg-white/5 border border-white/10 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Yeni Canlı Ders Oluştur</h2>
              <p className="text-xs text-slate-400">Oturum oluşturulunca Daily.co odası otomatik açılır. Alt gruplar oluşturabilirsiniz.</p>
            </div>
          </div>
          <CreateSessionForm courses={courses} />
        </CardContent>
      </Card>

      {/* Oturum Listesi */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Oturumlar
        </h2>

        {parentSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 rounded-3xl border border-dashed border-white/10">
            <Radio className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Henüz canlı ders oluşturulmadı</p>
            <p className="text-xs mt-1">Yukarıdaki formu kullanarak başlayın</p>
          </div>
        ) : (
          parentSessions.map((parent) => {
            const hasChildren = parent.childSessions.length > 0;
            const status = STATUS_MAP[parent.status as keyof typeof STATUS_MAP];
            
            // Eğer alt grupları varsa (Gruplu mod)
            if (hasChildren) {
              return (
                <div key={parent.id} className="rounded-2xl bg-slate-900/50 border border-white/10 p-5 space-y-4">
                  {/* Parent Başlık Alanı */}
                  <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                      <LayoutGrid className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white text-sm">{parent.title}</p>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full font-bold border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                          Gruplu Ders ({parent.childSessions.length} Grup)
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(parent.scheduledFor).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {parent.course && <span className="text-slate-500">•</span>}
                        {parent.course && <span>{parent.course.title}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Alt Gruplar */}
                  <div className="space-y-2 pl-4 border-l-2 border-white/5 ml-4">
                    {parent.childSessions.map((child) => {
                      const childStatus = STATUS_MAP[child.status as keyof typeof STATUS_MAP];
                      return (
                        <div key={child.id} className="rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/20 transition-all p-4">
                          <Link href={`/teacher/live/${child.id}`} className="group flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Radio className={`w-4 h-4 ${child.status === "LIVE" ? "text-red-400 animate-pulse" : "text-slate-400"}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-white text-sm">{child.title}</p>
                                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${childStatus.color}`}>
                                    {childStatus.label}
                                  </Badge>
                                </div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {child._count.members} Öğrenci Atandı
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                          </Link>
                          
                          <SessionActions
                            sessionId={child.id}
                            currentTitle={child.title}
                            currentScheduledFor={child.scheduledFor.toISOString()}
                            currentCourseId={child.courseId ?? null}
                            status={child.status}
                            courses={courses}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            }

            // Normal Oturum
            return (
              <div
                key={parent.id}
                className="rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/20 transition-all duration-300 p-5"
              >
                <Link href={`/teacher/live/${parent.id}`} className="group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-white/5">
                      <Radio className={`w-5 h-5 ${parent.status === "LIVE" ? "text-red-400 animate-pulse" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-white text-sm">{parent.title}</p>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(parent.scheduledFor).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {parent.course && <span className="text-slate-500">•</span>}
                        {parent.course && <span>{parent.course.title}</span>}
                        <span className="text-slate-500">•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {parent._count.polls} anket
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <SessionActions
                  sessionId={parent.id}
                  currentTitle={parent.title}
                  currentScheduledFor={parent.scheduledFor.toISOString()}
                  currentCourseId={parent.course?.id ?? null}
                  status={parent.status}
                  courses={courses}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
