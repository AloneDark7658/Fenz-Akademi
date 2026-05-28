"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { TeacherRoomUI } from "./TeacherRoomUI";
import { useRouter } from "next/navigation";

interface TeacherLiveRoomProps {
  sessionId: string;
  roomName: string;
  userName: string;
}

export function TeacherLiveRoom({ sessionId, roomName, userName }: TeacherLiveRoomProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/live/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Token alınamadı.");
          return;
        }
        setToken(data.token);
        setRoomUrl(data.roomUrl);
      } catch {
        setError("Sunucu bağlantısı kurulamadı.");
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Oda hazırlanıyor...</span>
      </div>
    );
  }

  if (error || !token || !roomUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 font-bold">{error || "Bilinmeyen hata"}</p>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          Daily.co API anahtarının Vercel ortam değişkenlerine eklendiğinden emin olun.
        </p>
        <button
          onClick={() => router.push("/teacher/live")}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <TeacherRoomUI
      roomUrl={roomUrl}
      token={token}
      sessionId={sessionId}
      userName={userName}
      onLeft={() => router.push("/teacher/live")}
    />
  );
}
