"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(item: (typeof NAV_ITEMS)[number]) {
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
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 shadow-[0_0_15px_rgba(239,68,68,0.15)] w-10 h-10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1.5 tracking-widest group-hover:opacity-0 transition-opacity duration-200 absolute bottom-2">FenZ</span>
          </div>

          {/* Expanded Text */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 flex flex-col justify-center">
            <p className="font-black text-white text-base leading-tight tracking-wide">Fenz Akademi</p>
            <p className="text-red-500 text-xs font-semibold">Komuta Merkezi</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}>
                <span className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden",
                active ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}>
                {active && (
                  <motion.span
                    layoutId="admin-sidebar-desktop"
                    className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("relative w-6 h-6 shrink-0", active ? "text-red-500 " : "")} />
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

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} className="relative flex-1 flex flex-col items-center justify-center p-2">
                {active && (
                  <motion.span
                    layoutId="admin-mobile-nav"
                    className="absolute inset-0 bg-red-500/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("relative w-5 h-5 mb-1", active ? "text-red-500 " : "text-slate-400")} />
                <span className={cn("relative text-[10px] font-semibold", active ? "text-red-500" : "text-slate-400")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          <form action={signOutAction} className="flex-1 flex">
            <button type="submit" className="relative flex-1 flex flex-col items-center justify-center p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="relative w-5 h-5 mb-1" />
              <span className="relative text-[10px] font-semibold w-full text-center">Çıkış</span>
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
