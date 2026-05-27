import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

/**
 * Dashboard Layout — Auth korumalı alan.
 * Oturum açmamış kullanıcılar login sayfasına yönlendirilir.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, points: true, streak: true }
  });

  const role = dbUser?.role || user.user_metadata?.role || "STUDENT";

  // Öğretmen ve Veli panelleri kendi layout'larında arka plan ve navbar barındırıyor.
  // Bu yüzden onları ekstra bir container veya bg ile kısıtlamıyoruz.
  if (role === "TEACHER" || role === "PARENT" || role === "ADMIN") {
    return <>{children}</>;
  }

  // Öğrenci Paneli Layout'u
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500/30">
      {/* Öğrenci Üst Bar (Header) */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/50 ">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight ">Fenz Akademi</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                🔥 {dbUser?.streak || 0} Seri
              </span>
              <span className="text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                ⭐ {dbUser?.points || 0} XP
              </span>
            </div>
            <LogoutButton variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10" showText={false} />
          </div>
        </div>
      </header>

      {/* Ana İçerik - Width kısıtlaması yok, sayfa içi bileşenler kendi container'larını yönetecek */}
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
