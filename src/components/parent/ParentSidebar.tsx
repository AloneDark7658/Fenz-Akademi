"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LineChart,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

// ─── Navigasyon öğeleri ───────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/parent", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/parent/analytics", label: "Detaylı Analiz", icon: LineChart },
];

// ─── Sidebar bileşeni ─────────────────────────────────────────────────────────

export function ParentSidebar() {
  const pathname = usePathname();

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-edu-navy border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="bg-edu-cyan/10 border border-edu-cyan/30 rounded-xl p-2">
          <GraduationCap className="w-5 h-5 text-edu-cyan" />
        </div>
        <div>
          <p className="font-black text-white text-base leading-tight">Fenz Akademi</p>
          <p className="text-edu-cyan/70 text-xs font-medium">Veli Paneli</p>
        </div>
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="parent-sidebar-active"
                    className="absolute inset-0 bg-edu-cyan/10 border border-edu-cyan/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative w-4 h-4 flex-shrink-0",
                    active ? "text-edu-cyan" : ""
                  )}
                />
                <span className="relative">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Çıkış */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </aside>
  );
}
