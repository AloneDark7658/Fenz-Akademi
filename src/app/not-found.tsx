"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Rocket, Home, ArrowLeft, Wrench } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 overflow-hidden relative">
      
      {/* Arka Plan Efektleri */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute top-[-15%] left-[10%] w-[50vw] h-[50vh] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(22,78,99,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[5%] w-[45vw] h-[45vh] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(88,28,135,0.18) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* İçerik */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        {/* İkon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-10 rounded-full scale-150" />
          <div className="relative flex items-center justify-center w-28 h-28 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
            <Wrench className="w-12 h-12 text-cyan-400" style={{ animation: "float 3s ease-in-out infinite" }} />
          </div>
        </motion.div>

        {/* 404 Yazısı */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-7xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-2"
        >
          404
        </motion.p>

        {/* Başlık */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight"
        >
          Bu Sayfa Yapım Aşamasında
        </motion.h1>

        {/* Açıklama */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-sm"
        >
          Aradığınız sayfa henüz hazır değil ya da taşınmış olabilir. Ekibimiz bu bölümü
          en kısa sürede kullanıma açmak için çalışıyor. 🚀
        </motion.p>

        {/* Durum Etiketi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          Bakım / Geliştirme Aşamasında
        </motion.div>

        {/* Butonlar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Ana Sayfaya Dön
          </button>
        </motion.div>

        {/* Alt Not */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-slate-600 text-xs flex items-center gap-2"
        >
          <Rocket className="w-3 h-3" />
          Fenz Akademi — Fen Bilimlerinin Geleceği
        </motion.p>
      </motion.div>

      {/* Float animasyonu */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
