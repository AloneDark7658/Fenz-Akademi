"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Mail, ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { forgotPasswordAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (email) {
      startTransition(async () => {
        const result = await forgotPasswordAction(email);
        if (result.success) {
          setIsSubmitted(true);
        } else {
          setErrorMsg(result.error || "Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.");
        }
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden selection:bg-cyan-500/30">
      
      {/* ─── SOL SÜTUN (BRANDING) ─── */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-[55%] items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-900/0 to-transparent opacity-70" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-900/0 to-transparent opacity-70" />
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative z-10 max-w-lg"
        >
          <Link href="/" className="flex items-center gap-4 mb-8 group/logo w-fit cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-40 rounded-full group-hover/logo:opacity-60 transition-opacity" />
              <div className="relative bg-white/10 border border-white/20 rounded-2xl p-4">
                <Rocket className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter">
              Fenz <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 ">Akademi</span>
            </h1>
          </Link>
          <p className="text-xl text-slate-300 font-medium leading-relaxed mb-6">
            Şifrenizi mi unuttunuz? Sorun değil, hemen yenileyip öğrenme yolculuğuna devam edebilirsiniz.
          </p>
        </motion.div>
      </div>

      {/* ─── SAĞ SÜTUN (FORM) ─── */}
      <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-950">
        {/* Mobil Arka plan dekorasyon */}
        <div className="md:hidden absolute top-0 right-0 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-900/0 to-transparent opacity-60 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-white/[0.03] rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <Link href="/" className="md:hidden flex flex-col items-center mb-8 cursor-pointer group/logo">
              <div className="relative bg-white/10 border border-white/20 rounded-2xl p-3 mb-4">
                <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-0 group-hover/logo:opacity-40 transition-opacity rounded-full" />
                <Rocket className="w-8 h-8 text-cyan-400 relative z-10" />
              </div>
              <h2 className="text-3xl font-black text-white">Fenz <span className="text-cyan-400">Akademi</span></h2>
            </Link>

            {!isSubmitted ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Şifre Sıfırlama</h2>
                  <p className="text-slate-400 text-sm">Hesabınıza kayıtlı e-posta adresini girin, size şifre sıfırlama bağlantısı gönderelim.</p>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-6"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* E-posta */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 text-sm font-semibold ml-1">E-posta</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@mail.com"
                        required
                        disabled={isPending}
                        className="pl-12 bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-2xl h-14 transition-all"
                      />
                    </div>
                  </div>

                  {/* Gönder butonu */}
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0 group"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        Bağlantı Gönder
                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
                  <Send className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">E-posta Gönderildi</h2>
                <p className="text-slate-400 text-sm mb-8">
                  <strong>{email}</strong> adresine şifre sıfırlama bağlantısını gönderdik. Lütfen gelen kutunuzu kontrol edin.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl">
                  Tekrar Gönder
                </Button>
              </div>
            )}

            {/* Geri dön linki */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <Link href="/login" className="flex items-center justify-center text-sm text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
