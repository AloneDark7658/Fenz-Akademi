"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Video, ArrowRight, AlertCircle } from "lucide-react";
import { AchievementToast } from "./student/AchievementToast";

// ============================================================================
// Fenz Akademi — Akıllı Sınav Özeti (Quiz Summary)
// ============================================================================

export interface Recommendation {
  lessonId: string;
  lessonTitle: string;
  wrongCount: number;
}

interface QuizSummaryProps {
  score: number;
  earnedXp: number;
  correctCount: number;
  total: number;
  recommendations?: Recommendation[];
  newBadges?: any[];
}

export function QuizSummary({
  score,
  earnedXp,
  correctCount,
  total,
  recommendations = [],
  newBadges = [],
}: QuizSummaryProps) {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-8">
      {/* Üst Kısım: Tebrik ve Puanlar */}
      <Card className="border-edu-cyan/20 bg-card overflow-hidden shadow-lg shadow-edu-cyan/5">
        <CardContent className="p-10 flex flex-col items-center justify-center space-y-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <Trophy className="w-24 h-24 text-edu-cyan mb-4" />
          </motion.div>
          <h2 className="text-3xl font-bold">Test Tamamlandı!</h2>
          
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <div className="bg-edu-navy/10 p-6 rounded-2xl border border-edu-navy/20 flex flex-col items-center">
              <p className="text-muted-foreground text-sm font-medium">Başarı Oranı</p>
              <p className="text-4xl font-black text-edu-cyan mt-2">%{Math.round(score)}</p>
              <p className="text-sm mt-1 text-muted-foreground">{total} soruda {correctCount} doğru</p>
            </div>
            <div className="bg-edu-orange/10 p-6 rounded-2xl border border-edu-orange/20 flex flex-col items-center">
              <p className="text-muted-foreground text-sm font-medium">Kazanılan XP</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star className="w-8 h-8 text-edu-orange fill-edu-orange" />
                <p className="text-4xl font-black text-edu-orange">+{earnedXp}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alt Kısım: Akıllı Yönlendirme */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-6 h-6 text-edu-orange" />
            <h3 className="text-2xl font-bold">Analizimiz şunları gösteriyor:</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <motion.div
                key={rec.lessonId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col hover:border-edu-orange/50 transition-colors bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{rec.lessonTitle}</CardTitle>
                    <p className="text-sm text-edu-orange font-medium mt-1">
                      {rec.wrongCount} Yanlış
                    </p>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    <Button 
                      className="w-full bg-edu-navy hover:bg-edu-navy-light text-white group"
                      onClick={() => router.push(`/dashboard/lessons/${rec.lessonId}`)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Eksiğini Kapat
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
              Kusursuz Performans! 🌟
            </h3>
            <p className="text-muted-foreground mt-2">
              Hiçbir konuda eksiğin görünmüyor. Harika gidiyorsun!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center pt-8">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => router.push("/student")}
          className="border-edu-cyan text-edu-cyan hover:bg-edu-cyan/10"
        >
          Ana Panele Dön
        </Button>
      </div>

      {/* Oyunlaştırma: Kazanılan yeni rozetler varsa konfetili toast göster */}
      {newBadges.length > 0 && <AchievementToast badges={newBadges} />}
    </div>
  );
}
