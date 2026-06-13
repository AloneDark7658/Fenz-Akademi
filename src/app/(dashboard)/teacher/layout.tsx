import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherTopbar } from "@/components/teacher/TeacherTopbar";

export default async function TeacherLayout({
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
    select: { name: true, role: true }
  });

  const role = dbUser?.role || user.user_metadata?.role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    redirect("/student");
  }

  const displayName = dbUser?.name ?? user.email ?? "Öğretmen";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 selection:bg-cyan-500/30">
      <TeacherSidebar />
      {/* md:pb-0 removed since we don't have bottom nav anymore */}
      <div className="md:pl-[88px] flex flex-col min-h-screen">
        <TeacherTopbar displayName={displayName} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
