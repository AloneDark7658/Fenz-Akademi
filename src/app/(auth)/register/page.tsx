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
} from "lucide-react";

// ─── Yardımcı ────────────────────────────────────────────────────────────────

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {errors[0]}
    </p>
  );
}

// ─── Rol Seçici ───────────────────────────────────────────────────────────────

const ROLES = [
  { value: "STUDENT", label: "Öğrenci", icon: BookOpen, color: "text-edu-cyan" },
  { value: "TEACHER", label: "Öğretmen", icon: GraduationCap, color: "text-edu-orange" },
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
    <div className="grid grid-cols-3 gap-2">
      {ROLES.map(({ value, label, icon: Icon, color }) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
              active
                ? "border-edu-cyan bg-edu-cyan/10 text-white shadow-md shadow-edu-cyan/10"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? color : ""}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

// Discriminated union'dan güvenli fieldErrors erişimi
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

  return (
    <div className="relative min-h-screen bg-edu-navy flex items-center justify-center p-4 overflow-hidden">
      {/* Arka plan neon parlamalar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -right-1/4 w-2/3 h-2/3 rounded-full bg-edu-cyan/10 blur-[140px]" />
        <div className="absolute -bottom-1/3 -left-1/4 w-2/3 h-2/3 rounded-full bg-edu-orange/10 blur-[140px]" />
      </div>

      {/* Form kartı */}
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 16 }}
        className="relative w-full max-w-md my-8"
      >
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40 border border-white/10">

          {/* Logo & başlık */}
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.45, delay: 0.15 }}
              className="relative mb-4"
            >
              <div className="absolute inset-0 bg-edu-orange blur-xl opacity-30 rounded-full" />
              <div className="relative bg-edu-navy border border-edu-orange/30 rounded-2xl p-3">
                <GraduationCap className="w-10 h-10 text-edu-orange" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Fenz <span className="text-edu-cyan">Akademi</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Ücretsiz hesap oluştur, hemen başla</p>
          </div>

          {/* Genel hata bildirimi */}
          {state && !state.success && !state.fieldErrors && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{state.error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-5">

            {/* Gizli rol input'u (state-driven) */}
            <input type="hidden" name="role" value={role} />

            {/* Ad */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300 text-sm font-medium">
                Ad Soyad
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  autoComplete="name"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan focus:ring-edu-cyan/20 rounded-xl h-11"
                />
              </div>
              <FieldError errors={getFieldErrors(state)?.name} />
            </div>

            {/* E-posta */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ornek@mail.com"
                  autoComplete="email"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan focus:ring-edu-cyan/20 rounded-xl h-11"
                />
              </div>
              <FieldError errors={getFieldErrors(state)?.email} />
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="En az 8 karakter, büyük harf ve rakam"
                  autoComplete="new-password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan focus:ring-edu-cyan/20 rounded-xl h-11"
                />
              </div>
              <FieldError errors={getFieldErrors(state)?.password} />
            </div>

            {/* Rol Seçimi */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm font-medium">Rolünüz</Label>
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
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="classLevel" className="text-slate-300 text-sm font-medium">
                      Sınıf Seviyesi
                    </Label>
                    <div className="relative">
                      <select
                        id="classLevel"
                        name="classLevel"
                        defaultValue=""
                        className="w-full h-11 pl-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-white focus:border-edu-cyan focus:outline-none appearance-none text-sm"
                      >
                        <option value="" disabled className="bg-edu-navy">
                          Sınıf seçiniz...
                        </option>
                        <option value="5" className="bg-edu-navy">5. Sınıf</option>
                        <option value="6" className="bg-edu-navy">6. Sınıf</option>
                        <option value="7" className="bg-edu-navy">7. Sınıf</option>
                        <option value="8" className="bg-edu-navy">8. Sınıf</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
              className="w-full h-11 rounded-xl font-bold text-base bg-edu-cyan hover:bg-edu-cyan-dark text-edu-navy shadow-lg shadow-edu-cyan/20 hover:shadow-edu-cyan/40 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Hesap oluşturuluyor...
                </>
              ) : (
                "Ücretsiz Kayıt Ol 🚀"
              )}
            </Button>
          </form>

          {/* Giriş linki */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Zaten hesabın var mı?{" "}
            <Link
              href="/login"
              className="text-edu-orange font-semibold hover:text-edu-orange-light transition-colors"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
