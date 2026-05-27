"use client";

import { motion, Variants } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import type { BadgeType } from "@/app/actions/gamification";

interface BadgeCollectionProps {
  allBadges: BadgeType[];
  ownedBadgeIds: string[];
}

export function BadgeCollection({ allBadges, ownedBadgeIds }: BadgeCollectionProps) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      {allBadges.map((badge) => {
        const isOwned = ownedBadgeIds.includes(badge.id);

        return (
          <motion.div
            key={badge.id}
            variants={item}
            className={`relative rounded-2xl p-5 border flex flex-col items-center text-center transition-all duration-300 ${
              isOwned
                ? "glass border-edu-cyan/30 hover:border-edu-cyan/60 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                : "bg-white/5 border-white/5 grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
            }`}
          >
            {/* Glow / Parlama efekti arka plan (Sadece sahipler için) */}
            {isOwned && (
              <div className="absolute inset-0 bg-gradient-to-br from-edu-cyan/10 to-edu-orange/5 rounded-2xl -z-10 blur-xl opacity-50" />
            )}

            {/* Kilit İkonu */}
            {!isOwned && (
              <div className="absolute top-3 right-3 text-slate-500">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}
            
            {/* Sahip İkonu */}
            {isOwned && (
              <div className="absolute top-3 right-3 text-edu-orange">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            )}

            {/* Rozet İkonu */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 drop-shadow-md ${
                isOwned
                  ? "bg-gradient-to-br from-edu-cyan/20 to-edu-navy border border-edu-cyan/40"
                  : "bg-slate-800/50 border border-slate-700/50"
              }`}
            >
              {badge.icon}
            </div>

            {/* Rozet Bilgileri */}
            <h4
              className={`text-sm font-bold leading-tight mb-1 ${
                isOwned ? "text-white" : "text-slate-400"
              }`}
            >
              {badge.name}
            </h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              {badge.description}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
