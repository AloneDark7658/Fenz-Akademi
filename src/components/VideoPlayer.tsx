"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onProgress?: (percent: number) => void;
}

export function VideoPlayer({ videoUrl, title, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Oynatma / Durdurma
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  // İlerleme takibi
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;
    setProgress(pct);
    onProgress?.(pct);
  };

  // İlerleme çubuğu tıklama
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  // Heartbeat (10 saniyede bir)
  useEffect(() => {
    heartbeatRef.current = setInterval(() => {
      if (!videoRef.current?.paused) {
        const pct = videoRef.current
          ? (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100
          : 0;
        onProgress?.(pct);
      }
    }, 10000);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [onProgress]);

  // YouTube embed mi yoksa HTML5 mi?
  const isYoutube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  const youtubeId = isYoutube
    ? videoUrl.match(
        /(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/
      )?.[1]
    : null;

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl shadow-black/50">
      {isYoutube && youtubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onEnded={() => setPlaying(false)}
          />

          {/* Overlay Kontroller */}
          <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-transparent to-transparent">
            {/* İlerleme çubuğu */}
            <div
              className="mx-4 mb-3 h-1.5 bg-white/20 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-edu-cyan rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Kontroller */}
            <div className="flex items-center gap-3 px-4 pb-4">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                {playing ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>
              <button
                onClick={() => {
                  setMuted((m) => !m);
                  if (videoRef.current) videoRef.current.muted = !muted;
                }}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-white text-xs ml-1">
                {Math.floor((progress / 100) * duration / 60)}:
                {String(Math.floor(((progress / 100) * duration) % 60)).padStart(2, "0")}
                {" / "}
                {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, "0")}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => videoRef.current?.requestFullscreen()}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ortada büyük play butonu (durduğunda) */}
          {!playing && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-2xl bg-edu-cyan/20 border-2 border-edu-cyan/50 backdrop-blur-sm flex items-center justify-center"
              >
                <Play className="w-7 h-7 text-edu-cyan fill-edu-cyan ml-1" />
              </motion.div>
            </button>
          )}
        </>
      )}
    </div>
  );
}
