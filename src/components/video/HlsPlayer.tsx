"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader2 } from "lucide-react";

interface HlsPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  videoId: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function HlsPlayer({ videoId, videoRef, poster, className, ...props }: HlsPlayerProps) {
  const localRef = useRef<HTMLVideoElement>(null);
  const resolvedRef = videoRef || localRef;
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eğer mock id gelirse (örneğin .env girilmemişse), örnek bir Big Buck Bunny hls stream oynatalım
  const isMock = videoId.startsWith("mock-bunny-id");
  
  // CDN Hostname genelde .env'den gelir ama Client Component'ta process.env.NEXT_PUBLIC... gerekir.
  // Basitlik için hardcode veya mock fallback yapıyoruz:
  const cdnHostname = process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME || "iframe.mediadelivery.net";
  
  const videoSrc = isMock 
    ? "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    : `https://${cdnHostname}/play/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${videoId}/playlist.m3u8`;

  useEffect(() => {
    const video = resolvedRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        capLevelToPlayerSize: true, // Dinamik çözünürlük adaptasyonu
        maxBufferLength: 30, // 30 saniyelik tampon
      });

      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsReady(true);
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
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSrc, resolvedRef]);

  return (
    <div className={`relative w-full aspect-video bg-black/80 rounded-2xl overflow-hidden border border-white/10 group shadow-[0_0_40px_rgba(34,211,238,0.15)] ${className || ""}`}>
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60 backdrop-blur-sm">
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
    </div>
  );
}
