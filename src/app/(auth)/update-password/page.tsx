"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Şifreniz en az 8 karakter olmalıdır.");
      return;
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMsg(error.message || "Şifre güncellenirken bir hata oluştu.");
      } else {
        setSuccessMsg("Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    });
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
          <div className="flex items-center gap-4 mb-8 group/logo w-fit">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-40 rounded-full group-hover/logo:opacity-60 transition-opacity" />
              <div className="relative bg-white/10 border border-white/20 rounded-2xl p-4">
                <Rocket className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter">
              Fenz <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 ">Akademi</span>
            </h1>
          </div>
          <p className="text-xl text-slate-300 font-medium leading-relaxed mb-6">
            Lütfen hesabınız için yeni ve güvenli bir şifre belirleyin.
          </p>
        </motion.div>
      </div>

      {/* ─── SAĞ SÜTUN (FORM) ─── */}
      <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-950">
        <div className="md:hidden absolute top-0 right-0 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-900/0 to-transparent opacity-60 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-white/[0.03] rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Yeni Şifre Belirle</h2>
              <p className="text-slate-400 text-sm">Hesabınızın güvenliği için güçlü bir şifre oluşturun.</p>
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

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 mb-6"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm font-medium">{successMsg}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Şifre */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm font-semibold ml-1">Yeni Şifre</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isPending || !!successMsg}
                    className="pl-12 pr-12 bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-2xl h-14 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Şifre Tekrar */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-semibold ml-1">Yeni Şifre (Tekrar)</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isPending || !!successMsg}
                    className="pl-12 pr-12 bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-2xl h-14 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Güncelle butonu */}
              <Button
                type="submit"
                disabled={isPending || !!successMsg}
                className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0 group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    Şifreyi Güncelle
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
}
