"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { KvkkConsentModal } from "./KvkkConsentModal";
import { StudentRoomUI } from "./StudentRoomUI";

interface StudentLiveRoomProps {
  sessionId: string;
  sessionTitle: string;
  roomName: string;
  userId: string;
  userName: string;
}

type Stage = "consent" | "loading" | "room" | "error";

export function StudentLiveRoom({
  sessionId,
  sessionTitle,
  roomName,
  userId,
  userName,
}: StudentLiveRoomProps) {
  const [stage, setStage] = useState<Stage>("consent");
  const [token, setToken] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConsented = async () => {
    setStage("loading");
    try {
      const res = await fetch("/api/live/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Derse katılım başarısız.");
        setStage("error");
        return;
      }
      setToken(data.token);
      setRoomUrl(data.roomUrl);
      setStage("room");
    } catch {
      setError("Sunucu bağlantısı kurulamadı. Lütfen tekrar deneyin.");
      setStage("error");
    }
  };

  if (stage === "consent") {
    return (
      <div className="flex items-center justify-center h-full p-8">
        {/* Arka plan bulanık görüntüsü */}
        <div
          className="fixed inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(34,211,238,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 70% 50%, rgba(168,85,247,0.3) 0%, transparent 50%)`,
          }}
        />
        <KvkkConsentModal
          sessionId={sessionId}
          sessionTitle={sessionTitle}
          onConsented={handleConsented}
          onDismiss={() => window.history.back()}
        />
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-medium">Derse bağlanılıyor...</span>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 font-bold">{error}</p>
        <button
          onClick={() => setStage("consent")}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!token || !roomUrl) return null;

  return (
    <StudentRoomUI
      roomUrl={roomUrl}
      token={token}
      sessionId={sessionId}
      studentId={userId}
      userName={userName}
      onLeft={() => window.history.back()}
    />
  );
}
