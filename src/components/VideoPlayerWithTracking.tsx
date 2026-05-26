"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { updateProgress } from "@/app/actions/progress";
import { cn } from "@/lib/utils";

// ============================================================================
// Fenz Akademi — Güvenli Video İzleme Bileşeni
// ============================================================================
// İleri sarma (fast-forward) engelli, Heartbeat sistemli video oynatıcı.
// ============================================================================

interface VideoPlayerWithTrackingProps {
  lessonId: string;
  videoUrl: string;
  className?: string;
  onLessonComplete?: () => void;
}

export function VideoPlayerWithTracking({
  lessonId,
  videoUrl,
  className,
  onLessonComplete,
}: VideoPlayerWithTrackingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Video metadata yüklendiğinde süreyi al
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Video oynatılırken (her saniye/kare tetiklenir)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Eğer kullanıcı normal bir şekilde izliyorsa max süreyi güncelle
    if (!videoRef.current.seeking) {
      if (time > maxTimeWatched) {
        setMaxTimeWatched(time);
      }
    }
  };

  // İleri sarma (Fast-forward) Koruması
  const handleSeeking = () => {
    if (!videoRef.current) return;
    
    // Eğer kullanıcı izlemediği bir süreye atlamaya çalışıyorsa
    // (1 saniyelik buffer bırakıyoruz tolerans için)
    if (videoRef.current.currentTime > maxTimeWatched + 1) {
      // Videoyu en son izlenen maksimum süreye geri al
      videoRef.current.currentTime = maxTimeWatched;
    }
  };

  // %90 tamamlama kuralı
  const watchPercentage = duration > 0 ? (maxTimeWatched / duration) * 100 : 0;
  const canComplete = watchPercentage >= 90;

  // Heartbeat (10 saniyede bir backend'e ping atar)
  useEffect(() => {
    // Sadece video oynarken heartbeat gönder
    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentPercentage = duration > 0 ? (maxTimeWatched / duration) * 100 : 0;
        
        try {
          setIsSyncing(true);
          await updateProgress({
            lessonId,
            watchPercentage: currentPercentage,
            isCompleted: canComplete && isCompleted, // Zaten tamamlandıysa true yolla
          });
        } catch (error) {
          console.error("Heartbeat failed", error);
        } finally {
          setIsSyncing(false);
        }
      }
    }, 10000); // 10 Saniye

    return () => clearInterval(interval);
  }, [lessonId, maxTimeWatched, duration, canComplete, isCompleted]);

  // Manuel Dersi Tamamlama Butonu aksiyonu
  const handleComplete = async () => {
    if (!canComplete) return;

    try {
      setIsSyncing(true);
      await updateProgress({
        lessonId,
        watchPercentage,
        isCompleted: true,
      });
      setIsCompleted(true);
      if (onLessonComplete) onLessonComplete();
    } catch (error) {
      console.error("Complete action failed", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Video Oynatıcı */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-edu-navy/20 bg-black/90 shadow-lg">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          controlsList="nodownload"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          className="h-full w-full object-contain"
        >
          Tarayıcınız HTML5 video etiketini desteklemiyor.
        </video>
      </div>

      {/* İlerleme Çubuğu ve Aksiyonlar */}
      <div className="flex flex-col space-y-2 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            İlerleme Durumu {isSyncing && <span className="ml-2 inline-block h-2 w-2 animate-ping rounded-full bg-edu-cyan"></span>}
          </span>
          <span className="font-bold text-edu-cyan">
            {Math.floor(watchPercentage)}%
          </span>
        </div>
        
        <Progress value={watchPercentage} className="h-2" />
        
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleComplete}
            disabled={!canComplete || isCompleted}
            className={cn(
              "transition-all duration-300",
              canComplete 
                ? "bg-edu-orange hover:bg-edu-orange/90 text-white animate-glow-pulse" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {isCompleted ? "Ders Tamamlandı 🎉" : canComplete ? "Dersi Tamamla" : "Tamamlamak için %90 izleyin"}
          </Button>
        </div>
      </div>
    </div>
  );
}
