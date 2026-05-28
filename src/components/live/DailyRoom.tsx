"use client";

import { useEffect, useRef } from "react";
import { MicOff, VideoOff, User } from "lucide-react";

// ─── Tek Katılımcının Video Tile'ı ───────────────────────────────────────────
interface VideoTileProps {
  track?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  isLocal?: boolean;
  userName?: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
  isScreen?: boolean;
  size?: "large" | "small" | "medium";
}

export function VideoTile({
  track,
  audioTrack,
  isLocal = false,
  userName = "Katılımcı",
  hasVideo = false,
  hasAudio = false,
  isScreen = false,
  size = "medium",
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Video track'i bağla
  useEffect(() => {
    if (!videoRef.current || !track) return;
    const stream = new MediaStream([track]);
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => {});
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [track]);

  // Ses track'ini bağla (yerel için değil)
  useEffect(() => {
    if (!audioRef.current || !audioTrack || isLocal) return;
    const stream = new MediaStream([audioTrack]);
    audioRef.current.srcObject = stream;
    audioRef.current.play().catch(() => {});
    return () => {
      if (audioRef.current) audioRef.current.srcObject = null;
    };
  }, [audioTrack, isLocal]);

  const sizeClasses = {
    large: "w-full h-full",
    medium: "w-full aspect-video",
    small: "w-32 h-20 md:w-44 md:h-28",
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0 ${sizeClasses[size]}`}
      style={{
        boxShadow: isScreen
          ? "0 0 0 2px rgba(34,211,238,0.4), 0 0 20px rgba(34,211,238,0.1)"
          : undefined,
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          hasVideo ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: isLocal && !isScreen ? "scaleX(-1)" : undefined }}
      />

      {/* Ses elementi (görünmez) */}
      {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

      {/* Kamera kapalıysa avatar */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
          <div className="w-12 h-12 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-slate-400" />
          </div>
          {size !== "small" && (
            <p className="text-xs text-slate-400 font-semibold">{userName}</p>
          )}
        </div>
      )}

      {/* Ekran paylaşımı etiketi */}
      {isScreen && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
            Ekran Paylaşımı
          </span>
        </div>
      )}

      {/* Alt kısım: isim + mikrofon durumu */}
      {size !== "small" && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
          <span className="text-xs font-bold text-white/90 truncate">
            {userName} {isLocal && "(Sen)"}
          </span>
          <div className="flex items-center gap-1.5">
            {!hasAudio && (
              <div className="p-1 rounded-md bg-red-500/20 border border-red-500/30">
                <MicOff className="w-3 h-3 text-red-400" />
              </div>
            )}
            {!hasVideo && (
              <div className="p-1 rounded-md bg-slate-700/60">
                <VideoOff className="w-3 h-3 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Küçük Katılımcı Listesi ──────────────────────────────────────────────────
interface ParticipantGridProps {
  participants: Record<string, any>;
  getVideoTrack: (id: string) => MediaStreamTrack | undefined;
  getAudioTrack: (id: string) => MediaStreamTrack | undefined;
  localSessionId?: string;
  maxVisible?: number;
}

export function ParticipantGrid({
  participants,
  getVideoTrack,
  getAudioTrack,
  localSessionId,
  maxVisible = 8,
}: ParticipantGridProps) {
  const entries = Object.entries(participants).filter(
    ([id]) => id !== localSessionId
  );
  const visible = entries.slice(0, maxVisible);
  const overflow = entries.length - maxVisible;

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-slate-500 text-xs">
        Henüz katılımcı yok
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {visible.map(([id, p]) => (
        <VideoTile
          key={id}
          track={getVideoTrack(id)}
          audioTrack={getAudioTrack(id)}
          userName={p.user_name}
          hasVideo={p.video}
          hasAudio={p.audio}
          size="small"
        />
      ))}
      {overflow > 0 && (
        <div className="w-32 h-20 md:w-44 md:h-28 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center">
          <span className="text-slate-400 text-sm font-bold">+{overflow} kişi</span>
        </div>
      )}
    </div>
  );
}
