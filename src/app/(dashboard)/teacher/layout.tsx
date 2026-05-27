import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { TeacherTopbar } from "@/components/teacher/TeacherTopbar";

// ─── Öğretmen Paneli Layout ───────────────────────────────────────────────────

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // RBAC: Sadece TEACHER ve ADMIN girebilir
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
    <div className="flex h-screen bg-[#0b1120] overflow-hidden">
      {/* Sidebar — masaüstünde her zaman görünür */}
      <div className="hidden md:flex flex-shrink-0">
        <TeacherSidebar />
      </div>

      {/* Ana içerik alanı */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TeacherTopbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
