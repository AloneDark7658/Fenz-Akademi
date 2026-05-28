"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Users, PhoneOff, Loader2, AlertCircle
} from "lucide-react";
import { useDailyCall } from "@/hooks/useDailyCall";
import { VideoTile, ParticipantGrid } from "./DailyRoom";
import { TeacherPollPanel } from "./PollPanel";
import { endSessionAction } from "@/app/actions/live";

interface TeacherRoomUIProps {
  roomUrl: string;
  token: string;
  sessionId: string;
  userName: string;
  onLeft: () => void;
}

export function TeacherRoomUI({
  roomUrl,
  token,
  sessionId,
  userName,
  onLeft,
}: TeacherRoomUIProps) {
  const [isPollPanelOpen, setIsPollPanelOpen] = useState(true);
  const [isEndingSession, startEndTransition] = useTransition();

  const {
    callState,
    participants,
    localAudio,
    localVideo,
    isScreenSharing,
    error,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    muteAllParticipants,
    getVideoTrack,
    getAudioTrack,
  } = useDailyCall({
    roomUrl,
    token,
    onLeft,
    onError: (msg) => console.error("[TeacherRoom]", msg),
  });

  // Yerel katılımcıyı bul
  const localParticipant = Object.values(participants).find((p) => p.local);
  const remoteParticipants = Object.fromEntries(
    Object.entries(participants).filter(([, p]) => !p.local)
  );

  const handleEndSession = () => {
    startEndTransition(async () => {
      await endSessionAction(sessionId);
      await leaveCall();
      onLeft();
    });
  };

  // Henüz katılmadıysa — Başlatma ekranı
  if (callState === "idle" || callState === "loading" || callState === "joining") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <div className="mb-4 p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 inline-block">
            <Monitor className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Canlı Dersi Başlat</h2>
          <p className="text-slate-400 text-sm">Öğrenciler sizi beklemeye başlayacak.</p>
        </div>
        <button
          onClick={joinCall}
          disabled={callState !== "idle"}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all hover:-translate-y-1 disabled:opacity-60"
        >
          {callState === "idle" ? (
            <>
              <Monitor className="w-5 h-5" /> Yayını Başlat
            </>
          ) : (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Bağlanıyor...
            </>
          )}
        </button>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
      {/* ─── Sol: Video Alanı ─── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
        {/* Ana Video (Yerel kamera veya ekran paylaşımı) */}
        <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-950 min-h-0">
          {localParticipant ? (
            <VideoTile
              track={
                isScreenSharing
                  ? getVideoTrack("local") // screen track
                  : localParticipant.tracks.video?.persistentTrack
              }
              audioTrack={undefined}
              isLocal={true}
              userName={userName}
              hasVideo={isScreenSharing || localVideo}
              hasAudio={localAudio}
              isScreen={isScreenSharing}
              size="large"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          {/* Katılımcı sayacı */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <Users className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-bold text-white">
              {Object.keys(remoteParticipants).length} öğrenci
            </span>
          </div>
        </div>

        {/* Öğrenci Grid'i */}
        <div className="bg-slate-900/50 rounded-2xl border border-white/5 max-h-36 overflow-y-auto">
          <ParticipantGrid
            participants={remoteParticipants}
            getVideoTrack={getVideoTrack}
            getAudioTrack={getAudioTrack}
            maxVisible={6}
          />
        </div>

        {/* Kontrol Çubuğu */}
        <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-slate-900/80 border border-white/5 backdrop-blur-sm">
          {/* Mikrofon */}
          <button
            onClick={toggleAudio}
            title={localAudio ? "Sesi kapat" : "Sesi aç"}
            className={`p-3 rounded-2xl border transition-all duration-200 hover:scale-105 ${
              localAudio
                ? "bg-white/10 border-white/10 text-white hover:bg-white/20"
                : "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            }`}
          >
            {localAudio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Kamera */}
          <button
            onClick={toggleVideo}
            title={localVideo ? "Kamerayı kapat" : "Kamerayı aç"}
            className={`p-3 rounded-2xl border transition-all duration-200 hover:scale-105 ${
              localVideo
                ? "bg-white/10 border-white/10 text-white hover:bg-white/20"
                : "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            }`}
          >
            {localVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Ekran Paylaşımı */}
          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            title={isScreenSharing ? "Paylaşımı durdur" : "Ekranı paylaş"}
            className={`p-3 rounded-2xl border transition-all duration-200 hover:scale-105 ${
              isScreenSharing
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 animate-pulse"
                : "bg-white/10 border-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>

          {/* Herkesi Sessize Al */}
          <button
            onClick={muteAllParticipants}
            title="Tüm öğrencileri sessize al"
            className="p-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all duration-200 hover:scale-105"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Dersi Bitir */}
          <button
            onClick={handleEndSession}
            disabled={isEndingSession}
            title="Dersi sonlandır"
            className="p-3 rounded-2xl border border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 ml-2"
          >
            {isEndingSession ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <PhoneOff className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ─── Sağ: Anket Paneli ─── */}
      <motion.div
        initial={{ width: 320 }}
        animate={{ width: isPollPanelOpen ? 320 : 0 }}
        className="flex-shrink-0 overflow-hidden"
      >
        <div className="w-80 h-full rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-sm p-4 overflow-y-auto">
          <TeacherPollPanel sessionId={sessionId} />
        </div>
      </motion.div>
    </div>
  );
}
