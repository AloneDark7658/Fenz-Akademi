"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// daily-js türleri için tip import
import type { DailyCall } from "@daily-co/daily-js";

export type DailyParticipant = {
  session_id: string;
  user_name: string;
  user_id?: string;
  local: boolean;
  audio: boolean;
  video: boolean;
  screen: boolean;
  tracks: {
    audio?: { persistentTrack?: MediaStreamTrack };
    video?: { persistentTrack?: MediaStreamTrack };
    screenVideo?: { persistentTrack?: MediaStreamTrack };
  };
};

export type CallState =
  | "idle"
  | "loading"
  | "joining"
  | "joined"
  | "left"
  | "error";

interface UseDailyCallOptions {
  roomUrl: string;
  token: string;
  onLeft?: () => void;
  onError?: (msg: string) => void;
}

export function useDailyCall({
  roomUrl,
  token,
  onLeft,
  onError,
}: UseDailyCallOptions) {
  const callRef = useRef<DailyCall | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [participants, setParticipants] = useState<
    Record<string, DailyParticipant>
  >({});
  const [localAudio, setLocalAudio] = useState(true);
  const [localVideo, setLocalVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Katılımcı listesini güncelle
  const updateParticipants = useCallback((call: DailyCall) => {
    const parts = call.participants() as Record<string, any>;
    const mapped: Record<string, DailyParticipant> = {};
    for (const [id, p] of Object.entries(parts)) {
      mapped[id] = {
        session_id: p.session_id,
        user_name: p.user_name || "Katılımcı",
        user_id: p.user_id,
        local: p.local,
        audio: p.tracks?.audio?.state === "playable",
        video: p.tracks?.video?.state === "playable",
        screen: p.tracks?.screenVideo?.state === "playable",
        tracks: p.tracks || {},
      };
    }
    setParticipants(mapped);
  }, []);

  // Odaya katıl
  const joinCall = useCallback(async () => {
    if (callRef.current) return; // Zaten bağlı
    setCallState("loading");
    setError(null);

    try {
      // daily-js dinamik yükle (SSR sorununu önler)
      const DailyIframeModule = await import("@daily-co/daily-js");
      const DailyFactory = DailyIframeModule.default;

      // Özel UI modunda (iframe değil) DailyCall oluştur
      const call = DailyFactory.createCallObject({
        audioSource: true,
        videoSource: true,
      });
      callRef.current = call;

      // Event listeners
      call.on("joining-meeting", () => setCallState("joining"));

      call.on("joined-meeting", () => {
        setCallState("joined");
        updateParticipants(call);
      });

      call.on("participant-joined", () => updateParticipants(call));
      call.on("participant-updated", () => updateParticipants(call));
      call.on("participant-left", () => updateParticipants(call));

      call.on("track-started", () => updateParticipants(call));
      call.on("track-stopped", () => updateParticipants(call));

      call.on("local-screen-share-started", () => {
        setIsScreenSharing(true);
        updateParticipants(call);
      });
      call.on("local-screen-share-stopped", () => {
        setIsScreenSharing(false);
        updateParticipants(call);
      });

      call.on("left-meeting", () => {
        setCallState("left");
        setParticipants({});
        onLeft?.();
      });

      call.on("error", (ev: any) => {
        const msg = ev?.errorMsg || "Bağlantı hatası oluştu.";
        setError(msg);
        setCallState("error");
        onError?.(msg);
      });

      // Odaya katıl
      await call.join({ url: roomUrl, token });
    } catch (err: any) {
      const msg = err?.message || "Odaya katılınamadı.";
      setError(msg);
      setCallState("error");
      onError?.(msg);
    }
  }, [roomUrl, token, updateParticipants, onLeft, onError]);

  // Odadan ayrıl
  const leaveCall = useCallback(async () => {
    if (!callRef.current) return;
    await callRef.current.leave();
    callRef.current.destroy();
    callRef.current = null;
    setCallState("left");
    setParticipants({});
  }, []);

  // Sesi aç/kapat
  const toggleAudio = useCallback(async () => {
    if (!callRef.current) return;
    const newState = !localAudio;
    await callRef.current.setLocalAudio(newState);
    setLocalAudio(newState);
  }, [localAudio]);

  // Kamerayı aç/kapat
  const toggleVideo = useCallback(async () => {
    if (!callRef.current) return;
    const newState = !localVideo;
    await callRef.current.setLocalVideo(newState);
    setLocalVideo(newState);
  }, [localVideo]);

  // Ekran paylaşımı başlat (metin okunabilirliği optimize)
  const startScreenShare = useCallback(async () => {
    if (!callRef.current) return;
    try {
      // @ts-ignore — Daily.co tipi dar tanımlanmış, ama API contentHint destekliyor
      await (callRef.current as any).startScreenShare({
        displayMediaOptions: {
          video: {
            contentHint: "text", // Metin keskinliği için optimize
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 15, max: 30 },
          },
        },
      });
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError("Ekran paylaşımı başlatılamadı.");
      }
    }
  }, []);

  // Ekran paylaşımını durdur
  const stopScreenShare = useCallback(async () => {
    if (!callRef.current) return;
    await callRef.current.stopScreenShare();
  }, []);

  // Tüm katılımcıları sessize al (sadece öğretmen yetkisi)
  const muteAllParticipants = useCallback(async () => {
    if (!callRef.current) return;
    await callRef.current.updateParticipants({
      "*": { setAudio: false },
    });
  }, []);

  // Belirli bir katılımcının video track'ini al
  const getVideoTrack = useCallback(
    (participantId: string): MediaStreamTrack | undefined => {
      const p = participants[participantId];
      if (!p) return undefined;
      // Ekran paylaşımı varsa onu öncelikle döndür
      if (p.screen && p.tracks.screenVideo?.persistentTrack) {
        return p.tracks.screenVideo.persistentTrack;
      }
      return p.tracks.video?.persistentTrack;
    },
    [participants]
  );

  // Belirli bir katılımcının ses track'ini al
  const getAudioTrack = useCallback(
    (participantId: string): MediaStreamTrack | undefined => {
      return participants[participantId]?.tracks.audio?.persistentTrack;
    },
    [participants]
  );

  // Cihazları listele
  const getAvailableDevices = useCallback(async () => {
    if (!callRef.current) return { camera: [], mic: [], speaker: [] };
    const { devices } = await callRef.current.enumerateDevices();
    return {
      camera: devices.filter((d: MediaDeviceInfo) => d.kind === 'videoinput'),
      mic: devices.filter((d: MediaDeviceInfo) => d.kind === 'audioinput'),
      speaker: devices.filter((d: MediaDeviceInfo) => d.kind === 'audiooutput'),
    };
  }, []);

  // Cihaz seç
  const setDevice = useCallback(async (kind: 'camera' | 'mic' | 'speaker', deviceId: string) => {
    if (!callRef.current) return;
    try {
      if (kind === 'camera') {
        await callRef.current.setInputDevicesAsync({ videoDeviceId: deviceId });
      } else if (kind === 'mic') {
        await callRef.current.setInputDevicesAsync({ audioDeviceId: deviceId });
      } else if (kind === 'speaker') {
        // @ts-ignore - Daily.co types might miss setOutputDeviceAsync but it exists
        await callRef.current.setOutputDeviceAsync({ outputDeviceId: deviceId });
      }
    } catch (err) {
      console.error("Cihaz ayarlanamadı:", err);
    }
  }, []);

  // Component unmount'unda temizle
  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.destroy();
        callRef.current = null;
      }
    };
  }, []);

  return {
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
    getAvailableDevices,
    setDevice,
  };
}
