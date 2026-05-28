"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckSquare, Square, Loader2, Lock } from "lucide-react";
import { recordConsentAction } from "@/app/actions/live";

interface KvkkConsentModalProps {
  sessionId: string;
  sessionTitle: string;
  onConsented: () => void;
  onDismiss?: () => void;
}

export function KvkkConsentModal({
  sessionId,
  sessionTitle,
  onConsented,
  onDismiss,
}: KvkkConsentModalProps) {
  const [checked, setChecked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConsent = () => {
    if (!checked) return;
    setError(null);
    startTransition(async () => {
      const result = await recordConsentAction(sessionId);
      if (result.success) {
        onConsented();
      } else {
        setError(result.error || "Onay kaydedilemedi. Lütfen tekrar deneyin.");
      }
    });
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(16px)", backgroundColor: "rgba(2, 6, 23, 0.85)" }}
      >
        {/* Modal Kutusu */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)",
            border: "1px solid rgba(34,211,238,0.15)",
            boxShadow:
              "0 0 80px rgba(34,211,238,0.08), 0 25px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Üst dekoratif çizgi */}
          <div className="h-[3px] w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

          <div className="p-7">
            {/* İkon ve Başlık */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-1 tracking-tight">
                Canlı Derse Katılım Onayı
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                {sessionTitle}
              </p>
            </div>

            {/* KVKK Metni */}
            <div className="rounded-2xl bg-slate-950/50 border border-white/5 p-4 mb-5">
              <p className="text-slate-300 text-sm leading-relaxed">
                Bu canlı derse katılarak{" "}
                <strong className="text-cyan-400">
                  görüntü, ses ve anket (performans) verilerinizin
                </strong>{" "}
                eğitim kalitesini artırmak amacıyla işleneceğini kabul
                etmiş olursunuz.
              </p>
              <ul className="mt-3 space-y-1.5">
                {[
                  "Ses ve görüntü akışı şifrelenerek iletilir",
                  "Veriler yalnızca eğitim amacıyla kullanılır",
                  "Anket yanıtlarınız anonim olarak analiz edilir",
                  "İşleme itiraz hakkınız saklıdır",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-slate-400"
                  >
                    <Lock className="w-3 h-3 text-cyan-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkbox */}
            <button
              onClick={() => setChecked((c) => !c)}
              className="flex items-start gap-3 w-full mb-5 group text-left"
              type="button"
            >
              <div className="flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110">
                {checked ? (
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                )}
              </div>
              <span className="text-sm text-slate-300 leading-snug">
                <strong className="text-white">KVKK Aydınlatma Metni</strong>'ni
                okudum, anladım ve{" "}
                <strong className="text-cyan-400">onaylıyorum</strong>. Bu ders
                için belirtilen veri işleme faaliyetlerine rıza gösteriyorum.
              </span>
            </button>

            {/* Hata Mesajı */}
            {error && (
              <p className="text-red-400 text-xs text-center mb-4 px-2">
                {error}
              </p>
            )}

            {/* Butonlar */}
            <div className="flex gap-3">
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-400 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  disabled={isPending}
                >
                  Geri Dön
                </button>
              )}
              <button
                onClick={handleConsent}
                disabled={!checked || isPending}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: checked
                    ? "linear-gradient(135deg, #06b6d4, #3b82f6)"
                    : "rgba(255,255,255,0.05)",
                  boxShadow: checked
                    ? "0 0 20px rgba(34,211,238,0.25)"
                    : "none",
                }}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                {isPending ? "Kaydediliyor..." : "Onaylıyorum, Derse Gir"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
