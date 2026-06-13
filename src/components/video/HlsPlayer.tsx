"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HlsPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  videoId: string;
  libraryId: string;
  hostname: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

// YouTube URL'sinden video ID'sini çıkar
function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function isYoutubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

// ── YouTube Embed Player ─────────────────────────────────────────────────────
function YoutubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&color=white`}
        title={title ?? "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        style={{ border: "none" }}
      />
    </div>
  );
}

// ── HLS / Bunny Player ───────────────────────────────────────────────────────
export function HlsPlayer({ videoId, libraryId, hostname, videoRef, poster, className, ...props }: HlsPlayerProps) {
  const localRef = useRef<HTMLVideoElement>(null);
  const resolvedRef = videoRef || localRef;
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hlsRef = useRef<Hls | null>(null);
  const [levels, setLevels] = useState<{ id: number; height: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto

  // ── YouTube URL gelirse direkt embed döndür ──────────────────────────────
  if (isYoutubeUrl(videoId)) {
    const ytId = extractYoutubeId(videoId);
    if (ytId) {
      return <YoutubeEmbed videoId={ytId} />;
    }
  }

  // Eğer mock id gelirse (örneğin .env girilmemişse), örnek bir Big Buck Bunny hls stream oynatalım
  const isMock = videoId.startsWith("mock-bunny-id");
  
  const videoSrc = isMock 
    ? "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    : `https://${hostname}/${videoId}/playlist.m3u8`;

  useEffect(() => {
    const video = resolvedRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30, // 30 saniyelik tampon
        startLevel: -1, // Otomatik bant genişliğine göre başlat
      });
      hlsRef.current = hls;

      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsReady(true);
        // data.levels HLS manifestinden gelen kalite çözünürlükleri
        setLevels(data.levels.map((l, index) => ({ id: index, height: l.height })));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              setError("Video yüklenirken bir hata oluştu.");
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari yerel (native) HLS desteği
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        setIsReady(true);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoSrc, resolvedRef]);

  const handleLevelChange = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
    }
  };

  return (
    <div className={`relative w-full aspect-video bg-black/80 rounded-2xl overflow-hidden border border-white/10 group shadow-[0_0_40px_rgba(34,211,238,0.15)] ${className || ""}`}>
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
          <p className="text-cyan-400 font-medium tracking-widest text-sm uppercase animate-pulse">
            Güvenli Yayın Bağlantısı Kuruluyor...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-red-950/80">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      )}

      <video
        ref={resolvedRef}
        poster={poster}
        controls
        controlsList="nodownload"
        className={`w-full h-full object-contain transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"}`}
        {...props}
      />

      {isReady && levels.length > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-black/60 hover:bg-black/80 text-white border border-white/10 p-2 rounded-lg transition-colors shadow-lg">
                <Settings className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-slate-900 border-white/10 text-white rounded-xl">
              <DropdownMenuItem
                className={`focus:bg-edu-cyan/20 focus:text-edu-cyan cursor-pointer rounded-lg mb-1 ${
                  currentLevel === -1 ? "text-edu-cyan font-bold bg-edu-cyan/10" : "text-slate-300"
                }`}
                onClick={() => handleLevelChange(-1)}
              >
                Otomatik
              </DropdownMenuItem>
              {/* Kaliteleri yüksekten düşüğe doğru sıralayalım */}
              {[...levels].reverse().map((level) => (
                <DropdownMenuItem
                  key={level.id}
                  className={`focus:bg-edu-cyan/20 focus:text-edu-cyan cursor-pointer rounded-lg mb-1 ${
                    currentLevel === level.id ? "text-edu-cyan font-bold bg-edu-cyan/10" : "text-slate-300"
                  }`}
                  onClick={() => handleLevelChange(level.id)}
                >
                  {level.height}p
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
