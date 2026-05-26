"use client";

import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  // Animasyon varyantları
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  return (
    <div className="relative min-h-screen bg-edu-navy text-white overflow-hidden flex flex-col items-center justify-center selection:bg-edu-cyan selection:text-edu-navy">
      {/* Arka plan süslemeleri (Opsiyonel estetik dokunuşlar) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-edu-cyan/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-edu-orange/10 blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* İkon */}
        <motion.div variants={itemVariants} className="mb-6 relative">
          <div className="absolute inset-0 bg-edu-cyan blur-2xl opacity-20 rounded-full" />
          <Rocket className="w-20 h-20 text-edu-cyan relative z-10" />
        </motion.div>

        {/* Ana Başlık */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-4"
        >
          Fenz <span className="text-edu-cyan">Akademi</span>
        </motion.h1>

        {/* Alt Slogan */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-3xl text-gray-300 mb-10 font-light"
        >
          Geleceğin Fen Bilimleri Platformu
          <Sparkles className="inline-block w-6 h-6 ml-2 text-edu-orange animate-pulse" />
        </motion.p>

        {/* Butonlar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button
            size="lg"
            className="bg-edu-orange hover:bg-edu-orange-dark text-white font-bold text-lg px-10 py-6 rounded-full shadow-lg shadow-edu-orange/20 transition-all hover:shadow-edu-orange/40 hover:-translate-y-1"
            onClick={() => router.push("/login")}
          >
            Giriş Yap
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-2 border-edu-cyan/50 text-edu-cyan hover:bg-edu-cyan hover:text-edu-navy font-bold text-lg px-10 py-6 rounded-full transition-all bg-transparent hover:shadow-lg hover:shadow-edu-cyan/40 hover:-translate-y-1"
            onClick={() => router.push("/register")}
          >
            Kayıt Ol
          </Button>
        </motion.div>
      </motion.div>

      {/* Alt Bilgi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 text-sm text-gray-500 font-medium tracking-wide z-10"
      >
        © {new Date().getFullYear()} Fenz Akademi. Tüm hakları saklıdır.
      </motion.div>
    </div>
  );
}
