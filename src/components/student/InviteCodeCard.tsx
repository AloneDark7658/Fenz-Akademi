"use client";

import { useState, useEffect } from "react";
import { getOrGenerateInviteCode } from "@/app/actions/student";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, UserPlus, Loader2 } from "lucide-react";

export function InviteCodeCard({ initialCode }: { initialCode: string | null }) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Eğer kod yoksa otomatik olarak üret
  useEffect(() => {
    if (!code) {
      setIsLoading(true);
      getOrGenerateInviteCode()
        .then((res) => {
          if (res.success && res.code) {
            setCode(res.code);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [code]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 overflow-hidden relative">
      {/* Dekoratif parlama */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[50px] -mr-10 -mt-10" />
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <UserPlus className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Veli Eşleştirme</h3>
            <p className="text-sm text-slate-400 mb-4">
              Bu kodu velinize vererek gelişiminizi takip etmesini sağlayın.
            </p>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between font-mono text-lg font-bold tracking-[0.2em] text-white">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400 mx-auto" />
                ) : (
                  <span>{code || "------"}</span>
                )}
              </div>
              <Button 
                onClick={handleCopy} 
                disabled={!code || isLoading}
                className={`h-full py-3 px-4 rounded-xl transition-all ${
                  copied 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
