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

  // Öğrenci, Öğretmen, Veli vb. tüm roller kendi layout'larına sahip olacak
  // Bu yüzden global dashboard layout'unu sadece auth wrap'i olarak tutuyoruz.
  return <>{children}</>;
}
