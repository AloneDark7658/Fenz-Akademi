"use client";

import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Rocket, Gamepad2, Film, Users, Sparkles, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  // Animasyon varyantları
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const features = [
    {
      icon: <Gamepad2 className="w-10 h-10 text-edu-cyan" />,
      title: "Oyunlaştırılmış Eğitim",
      description: "Soru çözdükçe rozetler kazanın, serinizi (streak) koruyun ve konfeti yağmurları eşliğinde öğrenmeyi eğlenceye dönüştürün.",
      glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] border-cyan-500/20 group-hover:border-cyan-500/50"
    },
    {
      icon: <Film className="w-10 h-10 text-purple-400" />,
      title: "Sinema Kalitesinde Dersler",
      description: "Netflix altyapısı (HLS) ile internet hızınıza adapte olan, kesintisiz ve korsana karşı korumalı video dersleri deneyimleyin.",
      glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] border-purple-500/20 group-hover:border-purple-500/50"
    },
    {
      icon: <Users className="w-10 h-10 text-orange-400" />,
      title: "Akıllı Veli Takibi",
      description: "Gerçek zamanlı grafikler ve özel davet kodu sistemiyle çocuğunuzun gelişimini saniye saniye şık panellerden izleyin.",
      glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] border-orange-500/20 group-hover:border-orange-500/50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      
      {/* ─── Arka Plan Süslemeleri (Radial Gradients) ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/0 to-transparent blur-3xl" />
        <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950/0 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vh] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-slate-950/0 to-transparent blur-3xl" />
        
        {/* Zarif ızgara (Grid) */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 pt-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Fenz Logo/İkon */}
          <motion.div variants={fadeInUp} className="mb-6 relative group">
            <div className="absolute inset-0 bg-edu-cyan blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-700" />
            <Rocket className="w-16 h-16 text-edu-cyan relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
          </motion.div>

          {/* Dev Başlık */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
          >
            Fen Bilimlerinde <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              Yeni Boyuta
            </span>{" "}
            Geçiş Yapın
          </motion.h1>

          {/* Slogan / Açıklama */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-2xl text-slate-400 mb-10 font-medium max-w-2xl leading-relaxed"
          >
            Ortaokul fen bilimleri artık çok daha eğlenceli. Fenz Akademi ile ezberci eğitime son verin, konfeti yağmurları ve interaktif deneylerle başarıya uçun.
            <Sparkles className="inline-block w-6 h-6 ml-2 text-yellow-400 animate-pulse" />
          </motion.p>

          {/* CTA Butonları */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg px-10 py-7 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] hover:-translate-y-1"
              onClick={() => router.push("/register")}
            >
              Hemen Ücretsiz Başla
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold text-lg px-10 py-7 rounded-full transition-all duration-300 hover:-translate-y-1"
              onClick={() => router.push("/login")}
            >
              Giriş Yap
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Özellikler (Features) Section ─── */}
      <section className="relative z-10 py-24 px-4 bg-slate-900/30 backdrop-blur-md border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Fen Bilimlerinin <span className="text-edu-cyan">Geleceği</span> Burada
            </h2>
            <p className="text-slate-400 text-lg">Sıradan platformları unutun, tamamen size özel bir teknoloji.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className={`group relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 overflow-hidden ${feature.glow}`}
              >
                {/* Kart Arkası Dekoratif Işık */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="mb-6 p-4 inline-block bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm font-medium tracking-wide">
          <p>© {new Date().getFullYear()} Fenz Akademi. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <span className="hover:text-edu-cyan cursor-pointer transition-colors">Gizlilik Politikası</span>
            <span className="hover:text-edu-cyan cursor-pointer transition-colors">Kullanım Şartları</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
