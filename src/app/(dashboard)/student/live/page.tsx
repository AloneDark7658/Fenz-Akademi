import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Calendar, Clock, Video, Users } from "lucide-react";

export const metadata: Metadata = { title: "Canlı Dersler" };

export default async function StudentLivePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Öğrencinin sınıf seviyesini al
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { classLevel: true }
  });

  if (!dbUser) redirect("/login");

  // Öğrencinin sınıfına uygun dersleri getir (eğer classLevel null ise tümünü getir veya filtreleme)
  // Şimdilik sistemdeki tüm canlı dersleri getiriyoruz, ancak course üzerinden gradeLevel filtresi uygulanabilir.
  const liveSessions = await prisma.liveSession.findMany({
    where: {
      status: {
        in: ["SCHEDULED", "LIVE"]
      },
      ...(dbUser.classLevel ? {
        OR: [
          { courseId: null },
          { course: { gradeLevel: dbUser.classLevel } }
        ]
      } : {})
    },
    include: {
      teacher: { select: { name: true } },
      course: { select: { title: true, gradeLevel: true } },
    },
    orderBy: { scheduledFor: "asc" }
  });

  const now = new Date();
  
  const activeSessions = liveSessions.filter(s => s.status === "LIVE");
  const upcomingSessions = liveSessions.filter(s => s.status === "SCHEDULED");

  return (
    <div className="space-y-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight pb-2">
          Canlı Dersler
        </h1>
        <p className="text-slate-400">Canlı soru çözümlerine katıl ve öğretmenlerine sorularını sor.</p>
      </div>

      {activeSessions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <h2 className="text-xl font-bold text-white">Şu An Devam Edenler</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((session: any) => (
              <Link key={session.id} href={`/live/${session.id}`}>
                <div className="group relative bg-red-500/10 rounded-3xl border border-red-500/30 hover:border-red-400 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] transition-all duration-300 cursor-pointer overflow-hidden p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">CANLI</Badge>
                    <span className="text-xs font-semibold text-slate-300">
                      {session.course?.gradeLevel}. Sınıf
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{session.title}</h3>
                  <p className="text-sm text-slate-400 mb-6">{session.course?.title}</p>
                  
                  <div className="mt-auto pt-4 border-t border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <Users className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{session.teacher.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-red-400 group-hover:text-red-300 transition-colors">
                      Katıl <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Yaklaşan Canlı Dersler
        </h2>

        {upcomingSessions.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-16 text-center text-slate-500">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Yaklaşan canlı ders bulunmuyor.</p>
              <p className="text-xs mt-1 opacity-60">Öğretmenler yeni ders planladığında burada görünecek.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map((session: any) => {
              const date = new Date(session.scheduledFor);
              return (
                <div key={session.id} className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col h-full opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      {session.course?.title}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {session.course?.gradeLevel}. Sınıf
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-4">{session.title}</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      {date.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                      <Clock className="w-4 h-4 text-orange-400" />
                      {date.toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour: '2-digit', minute:'2-digit' })}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">{session.teacher.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
