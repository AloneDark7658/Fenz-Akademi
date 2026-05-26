import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar ve Header bileşenleri buraya eklenecek */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)] glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-edu-navy">🚀 Fenz</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-edu-orange font-semibold animate-glow-pulse inline-block px-2 py-0.5 rounded-full">
                🔥 Streak
              </span>
              <span className="text-edu-cyan font-semibold">
                ⭐ Puan
              </span>
            </div>
            <span className="text-sm text-[var(--muted-foreground)]">
              {user.email}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
