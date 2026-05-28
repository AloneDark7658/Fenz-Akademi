"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  LogOut,
  Rocket,
  Video,
  Radio,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/teacher", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/teacher/lessons", label: "Dersler", icon: Video },
  { href: "/teacher/questions", label: "Sorular", icon: BookOpen },
  { href: "/teacher/exams", label: "Sınavlar", icon: ClipboardList },
  { href: "/teacher/students", label: "Öğrenciler", icon: Users },
  { href: "/teacher/live", label: "Canlı Dersler", icon: Radio },
];

export function TeacherSidebar() {
  const pathname = usePathname();

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col h-full w-64 bg-slate-950/40 border-r border-white/10 z-50">
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
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300",
                  active ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}>
                  {active && (
                    <motion.span
                      layoutId="teacher-sidebar-desktop"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("relative w-5 h-5", active ? "text-cyan-400 " : "")} />
                  <span className="relative">{item.label}</span>
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
      </aside>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around px-1 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} className="relative flex-1 flex flex-col items-center justify-center py-2 px-1">
                {active && (
                  <motion.span
                    layoutId="teacher-mobile-nav"
                    className="absolute inset-0 bg-cyan-500/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("relative w-5 h-5 mb-1", active ? "text-cyan-400 " : "text-slate-400")} />
                <span className={cn("relative text-[10px] font-semibold truncate w-full text-center", active ? "text-cyan-400" : "text-slate-400")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Mobil Çıkış Butonu */}
          <form action={signOutAction} className="flex-1 flex">
            <button type="submit" className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="relative w-5 h-5 mb-1" />
              <span className="relative text-[10px] font-semibold truncate w-full text-center">Çıkış</span>
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
