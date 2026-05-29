import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Admin kontrolü
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/student"); // Yetkisizse öğrenci paneline yolla
  }

  return (
    <div className="flex h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden selection:bg-red-500/30">
      {/* Yan Menü (Masaüstü) / Alt Menü (Mobil) */}
      <AdminSidebar />

      {/* Ana İçerik */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
