"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, Rocket, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TEACHER_NAV_ITEMS } from "./TeacherSidebar";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions/auth";

interface TeacherTopbarProps {
  displayName: string;
}

export function TeacherTopbar({ displayName }: TeacherTopbarProps) {
  const pathname = usePathname();

  function isActive(item: (typeof TEACHER_NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/10 bg-edu-navy flex-shrink-0 sticky top-0 z-40">
      
      {/* Mobil Hamburger Menü */}
      <div className="flex items-center gap-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] bg-slate-950 border-r border-white/10 p-0 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-2 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                  <Rocket className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-black text-white text-base leading-tight tracking-wide">Fenz Akademi</p>
                  <p className="text-cyan-400 text-xs font-semibold">Öğretmen Paneli</p>
                </div>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {TEACHER_NAV_ITEMS.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link key={item.href} href={item.href}>
                      <span className={cn(
                        "relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
                        active ? "text-white bg-white/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      )}>
                        <item.icon className={cn("w-5 h-5", active ? "text-cyan-400 " : "")} />
                        <span>{item.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="px-4 py-4 border-t border-white/5">
                <form action={signOutAction}>
                  <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Çıkış Yap
                  </button>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Fenz
        </span>
      </div>

      {/* Arama (Sadece Masaüstü) */}
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
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-white leading-tight">{displayName}</p>
            <p className="text-xs text-slate-400">Öğretmen</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-edu-cyan to-edu-navy border border-edu-cyan/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
