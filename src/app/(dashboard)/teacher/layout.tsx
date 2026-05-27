import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

  const role = user.user_metadata?.role as string | undefined;
  if (role !== "TEACHER" && role !== "ADMIN") {
    redirect("/student");
  }

  return (
    <div className="flex h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden selection:bg-cyan-500/30">
      <TeacherSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden pb-16 md:pb-0">
        <TeacherTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
