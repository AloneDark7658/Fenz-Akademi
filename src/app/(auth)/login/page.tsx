"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signInAction, type AuthResult } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

// ─── Form field helper ───────────────────────────────────────────────────────

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {errors[0]}
    </p>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

// Discriminated union'dan güvenli fieldErrors erişimi
function getFieldErrors(state: AuthResult | null) {
  if (state && !state.success) return state.fieldErrors;
  return undefined;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    signInAction,
    null
  );

  return (
    <div className="relative min-h-screen bg-edu-navy flex items-center justify-center p-4 overflow-hidden">
      {/* Arka plan neon parlamalar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -left-1/4 w-2/3 h-2/3 rounded-full bg-edu-cyan/10 blur-[140px]" />
        <div className="absolute -bottom-1/3 -right-1/4 w-2/3 h-2/3 rounded-full bg-edu-orange/10 blur-[140px]" />
      </div>

      {/* Form kartı */}
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 16 }}
        className="relative w-full max-w-md"
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
              <div className="absolute inset-0 bg-edu-cyan blur-xl opacity-30 rounded-full" />
              <div className="relative bg-edu-navy border border-edu-cyan/30 rounded-2xl p-3">
                <Rocket className="w-10 h-10 text-edu-cyan" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Fenz <span className="text-edu-cyan">Akademi</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Hesabına giriş yap ve öğrenmeye devam et</p>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                  Şifre
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-edu-cyan/80 hover:text-edu-cyan transition-colors"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-edu-cyan focus:ring-edu-cyan/20 rounded-xl h-11"
                />
              </div>
              <FieldError errors={getFieldErrors(state)?.password} />
            </div>

            {/* Giriş butonu */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl font-bold text-base bg-edu-orange hover:bg-edu-orange-dark text-white shadow-lg shadow-edu-orange/20 hover:shadow-edu-orange/40 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>

          {/* Kayıt linki */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Hesabın yok mu?{" "}
            <Link
              href="/register"
              className="text-edu-cyan font-semibold hover:text-edu-cyan-light transition-colors"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
