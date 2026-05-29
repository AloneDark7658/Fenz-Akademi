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

export const TEACHER_NAV_ITEMS = [
  { href: "/teacher", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/teacher/lessons", label: "Dersler", icon: Video },
  { href: "/teacher/questions", label: "Sorular", icon: BookOpen },
  { href: "/teacher/exams", label: "Sınavlar", icon: ClipboardList },
  { href: "/teacher/students", label: "Öğrenciler", icon: Users },
  { href: "/teacher/live", label: "Canlı Dersler", icon: Radio },
];

export function TeacherSidebar() {
  const pathname = usePathname();

  function isActive(item: (typeof TEACHER_NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex flex-col h-full w-[88px] hover:w-64 transition-all duration-300 ease-in-out bg-slate-950/40 border-r border-white/10 z-50 overflow-hidden group">
        <div className="flex items-center p-6 border-b border-white/5 whitespace-nowrap overflow-hidden relative min-h-[88px]">
          {/* Icon & Collapsed Text */}
          <div className="flex flex-col items-center justify-center shrink-0 w-10 group-hover:mr-4 transition-all duration-300">
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-2.5 shadow-[0_0_15px_rgba(34,211,238,0.15)] w-10 h-10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-cyan-400 shrink-0" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1.5 tracking-widest group-hover:opacity-0 transition-opacity duration-200 absolute bottom-2">FenZ</span>
          </div>

          {/* Expanded Text */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 flex flex-col justify-center">
            <p className="font-black text-white text-base leading-tight tracking-wide">Fenz Akademi</p>
            <p className="text-cyan-400 text-xs font-semibold">Öğretmen Paneli</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {TEACHER_NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden",
                active ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}>
                {active && (
                  <motion.span
                    layoutId="teacher-sidebar-desktop"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("relative w-6 h-6 shrink-0", active ? "text-cyan-400 " : "")} />
                <span className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{item.label}</span>
              </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/5">
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap overflow-hidden">
              <LogOut className="w-6 h-6 shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Çıkış Yap</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
