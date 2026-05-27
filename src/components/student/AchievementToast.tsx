"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import type { BadgeType } from "@/app/actions/gamification";

interface AchievementToastProps {
  badges: BadgeType[];
}

export function AchievementToast({ badges }: AchievementToastProps) {
  const [visibleBadges, setVisibleBadges] = useState<BadgeType[]>([]);

  useEffect(() => {
    if (badges.length > 0) {
      // Confetti patlat
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#06b6d4", "#f97316", "#ffffff"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#06b6d4", "#f97316", "#ffffff"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Rozetleri sırayla göster
      setVisibleBadges(badges);

      // 5 saniye sonra gizle
      const timer = setTimeout(() => {
        setVisibleBadges([]);
      }, 5000 + badges.length * 1000);

      return () => clearTimeout(timer);
    }
  }, [badges]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {visibleBadges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", delay: idx * 0.4, duration: 0.5 }}
            className="glass rounded-2xl p-4 border border-edu-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-4 bg-[#0b1120]/90 pointer-events-auto"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-edu-cyan/20 to-edu-orange/20 border border-edu-cyan/30 flex items-center justify-center text-2xl ">
              {badge.icon}
            </div>
            <div>
              <p className="text-xs text-edu-cyan font-bold uppercase tracking-wider mb-0.5">
                Yeni Rozet Kazanıldı!
              </p>
              <h4 className="text-white font-bold text-sm">{badge.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] leading-tight">
                {badge.description}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
