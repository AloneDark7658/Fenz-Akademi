import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TeacherLiveRoom } from "@/components/live/TeacherLiveRoom";

export const metadata: Metadata = { title: "Canlı Ders Odası | Fenz Akademi" };

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function TeacherLiveRoomPage({ params }: Props) {
  const { sessionId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, name: true },
  });
  if (!dbUser || !["TEACHER", "ADMIN"].includes(dbUser.role)) {
    redirect("/student");
  }

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      title: true,
      roomName: true,
      status: true,
      teacherId: true,
    },
  });

  if (!session || session.teacherId !== user.id) {
    notFound();
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
      {/* Minimal başlık çubuğu */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Canlı</span>
          </div>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-sm font-bold text-white">{session.title}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">{session.roomName}</span>
      </div>

      {/* Oda içeriği */}
      <div className="flex-1 overflow-hidden">
        <TeacherLiveRoom
          sessionId={session.id}
          roomName={session.roomName}
          userName={dbUser.name}
        />
      </div>
    </div>
  );
}
