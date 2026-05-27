"use client";

import { useState, useTransition } from "react";
import { linkStudentAction } from "@/app/actions/parent";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Link as LinkIcon, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export function LinkStudentForm({ hasChildren }: { hasChildren: boolean }) {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error", message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      showToast("error", "Davet kodu 6 haneli olmalıdır.");
      return;
    }

    startTransition(async () => {
      const result = await linkStudentAction(code);
      if (result.success) {
        showToast("success", result.message!);
        setCode("");
      } else {
        showToast("error", result.error || "Bilinmeyen bir hata oluştu.");
      }
    });
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20 relative overflow-hidden">
      {/* Dekoratif parlama */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[60px] -ml-10 -mt-10 pointer-events-none" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shrink-0">
              <LinkIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {hasChildren ? "Yeni Bir Öğrenci Bağla" : "Öğrenci Bağla"}
              </h3>
              <p className="text-sm text-slate-400">
                Öğrencinizin panelinde yer alan 6 haneli kodu buraya girerek gelişimi takip etmeye başlayın.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-auto flex gap-3">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Örn: X7A9K2"
                maxLength={6}
                disabled={isPending}
                className="pl-9 w-full md:w-48 bg-black/40 border-white/10 text-white placeholder:text-slate-600 font-mono tracking-widest font-bold uppercase rounded-xl h-12"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isPending || code.length < 6}
              className="h-12 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bağla"}
            </Button>
          </form>
        </div>
      </CardContent>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-md ${
            toast.type === "success" 
              ? "bg-green-500/10 border-green-500/30 text-green-400" 
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            <span className="font-semibold text-sm text-white">{toast.message}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
