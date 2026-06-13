"use client";

import { useActionState, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signUpAction, type AuthResult } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  BookOpen,
  Users,
  AlertCircle,
  Loader2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

// ─── Yardımcı ────────────────────────────────────────────────────────────────

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5 ml-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {errors[0]}
    </p>
  );
}

// ─── Rol Seçici ───────────────────────────────────────────────────────────────

const ROLES = [
  { value: "STUDENT", label: "Öğrenci", icon: BookOpen, color: "text-cyan-400" },
  { value: "PARENT", label: "Veli", icon: Users, color: "text-purple-400" },
];

function RoleSelector({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {ROLES.map(({ value, label, icon: Icon, color }) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border text-xs font-bold transition-all duration-300 ${
              active
                ? "border-cyan-400 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <Icon className={`w-6 h-6 transition-colors ${active ? color : "text-slate-500"}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

function getFieldErrors(state: AuthResult | null) {
  if (state && !state.success) return state.fieldErrors;
  return undefined;
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    signUpAction,
    null
  );
  const [role, setRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col md:flex-row-reverse overflow-hidden selection:bg-orange-500/30">
      
      {/* ─── SAĞ SÜTUN (BRANDING) ─── */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-[45%] items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-l border-white/5">
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/30 via-slate-900/0 to-transparent opacity-70" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/0 to-transparent opacity-70" />
        
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative z-10 max-w-lg text-right flex flex-col items-end"
        >
          <Link href="/" className="flex items-center gap-4 mb-8 flex-row-reverse group/logo cursor-pointer w-fit">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400 blur-xl opacity-40 rounded-full group-hover/logo:opacity-60 transition-opacity" />
              <div className="relative bg-white/10 border border-white/20 rounded-2xl p-4">
                <GraduationCap className="w-10 h-10 text-orange-400" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-400 tracking-tighter">
              Fenz <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-red-500 ">Akademi</span>
            </h1>
          </Link>
          <p className="text-xl text-slate-300 font-medium leading-relaxed mb-6">
            Eğitim dünyasına yeni bir adım at. Ücretsiz hesabını oluştur, potansiyelini keşfet.
          </p>
          <div className="flex items-center gap-3 text-orange-400 font-semibold bg-orange-950/30 border border-orange-500/20 px-5 py-3 rounded-2xl w-fit">
            <span>Hemen Başla</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* ─── SOL SÜTUN (FORM) ─── */}
      <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-950 overflow-y-auto min-h-screen">
        {/* Mobil Arka plan dekorasyon */}
        <div className="md:hidden absolute top-0 left-0 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-900/30 via-slate-900/0 to-transparent opacity-60 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative w-full max-w-md my-8"
        >
          <div className="bg-white/[0.03] rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            
            <Link href="/" className="md:hidden flex flex-col items-center mb-8 cursor-pointer group/logo">
              <div className="relative bg-white/10 border border-white/20 rounded-2xl p-3 mb-4">
                <div className="absolute inset-0 bg-orange-400 blur-xl opacity-0 group-hover/logo:opacity-40 transition-opacity rounded-full" />
                <GraduationCap className="w-8 h-8 text-orange-400 relative z-10" />
              </div>
              <h2 className="text-3xl font-black text-white">Fenz <span className="text-orange-400">Akademi</span></h2>
            </Link>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Kayıt Ol 🚀</h2>
              <p className="text-slate-400 text-sm">Ücretsiz hesap oluştur, hemen başla.</p>
            </div>

            {/* Genel hata bildirimi */}
            {state && !state.success && !state.fieldErrors && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm font-medium">{state.error}</p>
              </motion.div>
            )}

            <form action={formAction} className="space-y-6">
              <input type="hidden" name="role" value={role} />

              {/* Ad */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 text-sm font-semibold ml-1">Ad Soyad</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    autoComplete="name"
                    defaultValue={!state?.success && state?.data?.name ? (state.data.name as string) : ""}
                    className="pl-12 bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-2xl h-14 transition-all"
                  />
                </div>
                <FieldError errors={getFieldErrors(state)?.name} />
              </div>

              {/* E-posta */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-sm font-semibold ml-1">E-posta</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                    defaultValue={!state?.success && state?.data?.email ? (state.data.email as string) : ""}
                    className="pl-12 bg-black/20 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-2xl h-14 transition-all"
                  />
                </div>
                <FieldError errors={getFieldErrors(state)?.email} />
              </div>

              {/* Şifre */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm font-semibold ml-1">Şifre</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="En az 8 karakter, büyük harf ve rakam"
                    autoComplete="new-password"
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
                <FieldError errors={getFieldErrors(state)?.password} />
              </div>

              {/* Şifre Tekrarı */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-semibold ml-1">Şifre Tekrarı</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Şifrenizi tekrar girin"
                    autoComplete="new-password"
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
                <FieldError errors={getFieldErrors(state)?.confirmPassword} />
              </div>

              {/* Rol Seçimi */}
              <div className="space-y-2 pt-2">
                <Label className="text-slate-300 text-sm font-semibold ml-1">Rolünüz</Label>
                <RoleSelector selected={role} onChange={setRole} />
                <FieldError errors={getFieldErrors(state)?.role} />
              </div>

              {/* Sınıf Seviyesi (Sadece Öğrenci seçiliyse) */}
              <AnimatePresence>
                {role === "STUDENT" && (
                  <motion.div
                    key="classLevel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-4">
                      <Label htmlFor="classLevel" className="text-slate-300 text-sm font-semibold ml-1">
                        Sınıf Seviyesi
                      </Label>
                      <div className="relative group">
                        <select
                          id="classLevel"
                          name="classLevel"
                          defaultValue={!state?.success && state?.data?.classLevel ? String(state.data.classLevel) : ""}
                          className="w-full h-14 pl-4 pr-12 rounded-2xl bg-black/20 border border-white/10 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none appearance-none text-base transition-all group-hover:border-white/20"
                        >
                          <option value="" disabled className="bg-slate-900">Sınıf seçiniz...</option>
                          <option value="5" className="bg-slate-900">5. Sınıf</option>
                          <option value="6" className="bg-slate-900">6. Sınıf</option>
                          <option value="7" className="bg-slate-900">7. Sınıf</option>
                          <option value="8" className="bg-slate-900">8. Sınıf</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                      </div>
                      <FieldError errors={getFieldErrors(state)?.classLevel} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Kayıt Ol butonu */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-14 rounded-2xl font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0 mt-4 group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Hesap oluşturuluyor...
                  </>
                ) : (
                  <>
                    Ücretsiz Kayıt Ol
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Giriş linki */}
            <p className="text-center text-slate-400 text-sm mt-8">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="text-orange-400 font-bold hover:text-orange-300 transition-colors ">
                Giriş Yap
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
