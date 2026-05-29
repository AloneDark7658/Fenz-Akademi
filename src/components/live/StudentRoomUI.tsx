"use client";

import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, AlertCircle, Settings } from "lucide-react";
import { useDailyCall } from "@/hooks/useDailyCall";
import { VideoTile } from "./DailyRoom";
import { StudentPollPanel } from "./PollPanel";
import { DeviceSettingsModal } from "./DeviceSettingsModal";

interface StudentRoomUIProps {
  roomUrl: string;
  token: string;
  sessionId: string;
  studentId: string;
  userName: string;
  onLeft: () => void;
}

export function StudentRoomUI({
  roomUrl,
  token,
  sessionId,
  studentId,
  userName,
  onLeft,
}: StudentRoomUIProps) {
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  const {
    callState,
    participants,
    localAudio,
    localVideo,
    error,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    getVideoTrack,
    getAudioTrack,
    getAvailableDevices,
    setDevice,
  } = useDailyCall({
    roomUrl,
    token,
    onLeft,
    onError: (msg) => console.error("[StudentRoom]", msg),
  });

  // Öğretmeni bul (owner olan)
  const teacherParticipant = Object.values(participants).find(
    (p) => !p.local && (p.screen || p.video)
  ) || Object.values(participants).find((p) => !p.local);

  const localParticipant = Object.values(participants).find((p) => p.local);

  if (callState === "idle" || callState === "loading" || callState === "joining") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <div className="mb-4 p-5 rounded-3xl bg-purple-500/10 border border-purple-500/20 inline-block">
            <Video className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Canlı Derse Katıl</h2>
          <p className="text-slate-400 text-sm">
            Derse katıldıktan sonra öğretmeninizi görebileceksiniz.
          </p>
        </div>
        <button
          onClick={joinCall}
          disabled={callState !== "idle"}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-1 disabled:opacity-60"
        >
          {callState === "idle" ? (
            <>
              <Video className="w-5 h-5" /> Derse Katıl
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

  if (callState === "left" || callState === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
        <PhoneOff className="w-12 h-12 opacity-40" />
        <p className="text-lg font-bold text-white">Dersten Ayrıldınız</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 transition-all"
        >
          Tekrar Katıl
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
      {/* ─── Orta: Öğretmen Videosu ─── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
        {/* Öğretmen ekranı — büyük alan */}
        <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-950 border border-white/5 min-h-0">
          {teacherParticipant ? (
            <VideoTile
              track={teacherParticipant.tracks.screenVideo?.persistentTrack || teacherParticipant.tracks.video?.persistentTrack}
              audioTrack={getAudioTrack(teacherParticipant.session_id)}
              userName={teacherParticipant.user_name}
              hasVideo={teacherParticipant.video || teacherParticipant.screen}
              hasAudio={teacherParticipant.audio}
              isScreen={teacherParticipant.screen}
              size="large"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin opacity-50" />
              <p className="text-sm">Öğretmen bekleniyor...</p>
            </div>
          )}

          {/* Yerel Kamera — Sağ Üst Köşe (Picture-in-Picture) */}
          {localParticipant && (
            <div className="absolute top-4 right-4 w-40 h-28 md:w-48 md:h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50 bg-black z-10 transition-all hover:scale-105">
              <VideoTile
                track={localParticipant.tracks.video?.persistentTrack}
                audioTrack={undefined}
                isLocal={true}
                userName={userName}
                hasVideo={localVideo}
                hasAudio={localAudio}
                size="large"
              />
            </div>
          )}

          {/* CANLI rozeti */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Canlı</span>
          </div>
        </div>

        {/* Öğrenci Kontrol Çubuğu */}
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

          {/* Ayarlar Modalı Butonu */}
          <button
            onClick={() => setIsDeviceModalOpen(true)}
            title="Cihaz Ayarları"
            className="p-3 rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-105 ml-2"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Ayrıl */}
          <button
            onClick={leaveCall}
            title="Dersten ayrıl"
            className="p-3 rounded-2xl border border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all duration-200 hover:scale-105 ml-2"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── Sağ: Anket Paneli ─── */}
      <div className="w-72 flex-shrink-0 overflow-y-auto space-y-3">
        <StudentPollPanel sessionId={sessionId} studentId={studentId} />
      </div>

      {/* Cihaz Seçimi Modalı */}
      <DeviceSettingsModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        getAvailableDevices={getAvailableDevices}
        setDevice={setDevice}
      />
    </div>
  );
}
