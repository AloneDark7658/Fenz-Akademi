import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { StudentTopbar } from "@/components/student/StudentTopbar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, points: true, streak: true, name: true }
  });

  const role = dbUser?.role || user.user_metadata?.role || "STUDENT";
  
  // Eğer yetkisi yoksa, başka bir yere yönlendir (örneğin teacher ise /teacher paneline)
  if (role === "TEACHER" || role === "ADMIN") {
    redirect("/teacher");
  }

  const displayName = dbUser?.name ?? user.email ?? "Öğrenci";

  return (
    <div className="flex h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden selection:bg-cyan-500/30">
      <StudentSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <StudentTopbar 
          streak={dbUser?.streak || 0} 
          points={dbUser?.points || 0}
          displayName={displayName}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
