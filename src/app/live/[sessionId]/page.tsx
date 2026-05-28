import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { StudentLiveRoom } from "@/components/live/StudentLiveRoom";

export const metadata: Metadata = { title: "Canlı Derse Katıl | Fenz Akademi" };

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function StudentLiveRoomPage({ params }: Props) {
  const { sessionId } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, role: true },
  });
  if (!dbUser) redirect("/login");

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

  if (!session) notFound();

  if (session.status === "ENDED") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <p className="text-2xl font-black text-white">Ders Sona Erdi</p>
        <p className="text-sm">Bu oturum tamamlanmış. Yeni bir ders için öğretmeninize başvurun.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
      {/* Minimal başlık */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">{session.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Canlı Ders
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-hidden">
        <StudentLiveRoom
          sessionId={session.id}
          sessionTitle={session.title}
          roomName={session.roomName}
          userId={dbUser.id}
          userName={dbUser.name}
        />
      </div>
    </div>
  );
}
