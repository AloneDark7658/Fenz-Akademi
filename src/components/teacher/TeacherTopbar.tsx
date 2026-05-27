import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// ─── Öğretmen Topbar ──────────────────────────────────────────────────────────

export async function TeacherTopbar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Prisma'dan adı çek
  const dbUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      })
    : null;

  const displayName = dbUser?.name ?? user?.email ?? "Öğretmen";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-edu-navy/80 backdrop-blur-md flex-shrink-0">
      {/* Arama */}
      <div className="relative max-w-xs w-full hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Soru veya konu ara..."
          className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan rounded-xl text-sm"
        />
      </div>

      {/* Sağ: Bildirim + Avatar */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-edu-orange rounded-full ring-2 ring-edu-navy" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-edu-cyan to-edu-navy border border-edu-cyan/30 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white leading-tight">{displayName}</p>
            <p className="text-xs text-slate-400">Öğretmen</p>
          </div>
        </div>
      </div>
    </header>
  );
}
