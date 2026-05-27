"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { checkAnswerAction, submitQuizAction } from "@/app/actions/quiz";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { QuizSummary, Recommendation } from "./QuizSummary";

// ============================================================================
// Fenz Akademi — Oyunlaştırılmış Quiz Arayüzü (Duolingo Stili)
// ============================================================================

export type ClientQuestion = {
  id: string;
  content: string;
  options: string[];
  // DİKKAT: Güvenlik gereği correctAnswer burada YOKTUR.
};

interface QuizInterfaceProps {
  lessonId: string;
  questions: ClientQuestion[];
  onComplete?: (summary: { score: number; earnedXp: number }) => void;
}

export function QuizInterface({ lessonId, questions, onComplete }: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  // Arka plan işlemleri (yükleniyor) state'i
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Anında geri bildirim state'leri
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswerFromServer, setCorrectAnswerFromServer] = useState<string | null>(null);
  
  // Tüm cevapların tutulduğu state (Final gönderimi için)
  const [accumulatedAnswers, setAccumulatedAnswers] = useState<
    { questionId: string; selectedAnswer: string }[]
  >([]);

  // Test Bitiş/Özet Ekranı
  const [isFinished, setIsFinished] = useState(false);
  const [summaryData, setSummaryData] = useState<{ 
    score: number; 
    earnedXp: number; 
    correctCount: number; 
    total: number;
    recommendations: Recommendation[];
    newBadges: any[];
  } | null>(null);

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Bu derse ait soru bulunamadı.</div>;
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  // Seçeneğe tıklanma olayı (Soruyu kilitler ve backend'e sorar)
  const handleOptionSelect = async (option: string) => {
    // Zaten kontrol edildiyse tıklamayı engelle
    if (hasChecked || isChecking) return;

    setSelectedAnswer(option);
    setIsChecking(true);

    try {
      // 1. Backend'e tekil soruyu sor
      const result = await checkAnswerAction({
        questionId: currentQuestion.id,
        selectedAnswer: option,
      });

      if (result.success && result.data) {
        setIsCorrect(result.data.isCorrect);
        setCorrectAnswerFromServer(result.data.correctAnswer);
        setHasChecked(true);

        // 2. Cevabı son gönderim için kaydet
        setAccumulatedAnswers((prev) => [
          ...prev,
          { questionId: currentQuestion.id, selectedAnswer: option },
        ]);
      } else {
        console.error("Cevap kontrol edilemedi:", result.error);
        // Hata durumunda bileşenin kilitli kalmaması için state'i sıfırla
        setSelectedAnswer(null);
      }
    } catch (error) {
      console.error("Network error:", error);
      setSelectedAnswer(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Sonraki Soruya Geçiş veya Testi Bitirme
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      // Sonraki soru için state'leri sıfırla
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasChecked(false);
      setIsCorrect(null);
      setCorrectAnswerFromServer(null);
    } else {
      // Test bitti, toplu sonuçları gönder
      setIsSubmitting(true);
      try {
        const result = await submitQuizAction({
          lessonId,
          answers: accumulatedAnswers,
        });

        if (result.success && result.data) {
          setSummaryData({
            score: result.data.score,
            earnedXp: result.data.earnedXp,
            correctCount: result.data.correctCount,
            total: questions.length,
            recommendations: result.data.recommendations || [],
            newBadges: result.data.newBadges || [],
          });
          setIsFinished(true);
          if (onComplete) {
            onComplete({ score: result.data.score, earnedXp: result.data.earnedXp });
          }
        } else {
          console.error("Test gönderilemedi:", result.error);
        }
      } catch (error) {
        console.error("Submit error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ─── Özet Ekranı (Test Bittiğinde) ─────────────────────────────────────────
  if (isFinished && summaryData) {
    return (
      <QuizSummary
        score={summaryData.score}
        earnedXp={summaryData.earnedXp}
        correctCount={summaryData.correctCount}
        total={summaryData.total}
        recommendations={summaryData.recommendations}
        newBadges={summaryData.newBadges}
      />
    );
  }

  // ─── Quiz Ekranı (Sorular) ────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      {/* İlerleme Çubuğu */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Soru {currentIndex + 1} / {questions.length}</span>
        </div>
        <Progress value={progressPercentage} className="h-3 bg-muted [&>div]:bg-edu-cyan" />
      </div>

      {/* Soru İçeriği (Animasyonlu) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-edu-navy/20 bg-card shadow-lg">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-semibold mb-8 text-foreground">
                {currentQuestion.content}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = hasChecked && option === correctAnswerFromServer;
                  const isWrongSelected = hasChecked && isSelected && !isCorrect;

                  // Renk mantığı
                  let optionStateClass = "border-border hover:border-edu-cyan/50 hover:bg-edu-cyan/5";
                  
                  if (hasChecked) {
                    if (isCorrectOption) {
                      optionStateClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                    } else if (isWrongSelected) {
                      optionStateClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                    } else {
                      optionStateClass = "border-border opacity-50"; // Diğer şıkları soluklaştır
                    }
                  } else if (isSelected) {
                    optionStateClass = "border-edu-cyan bg-edu-cyan/10"; // Seçildi ama henüz check edilmedi (Loading durumu)
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasChecked || isChecking}
                      onClick={() => handleOptionSelect(option)}
                      className={cn(
                        "relative flex items-center justify-between w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                        optionStateClass,
                        (hasChecked || isChecking) && "cursor-default"
                      )}
                    >
                      <span className="font-medium text-lg">{option}</span>
                      
                      {/* İkonlar (Doğru/Yanlış durumuna göre) */}
                      {hasChecked && isCorrectOption && (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                      {hasChecked && isWrongSelected && (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                      {/* Yükleniyor spinner */}
                      {isChecking && isSelected && !hasChecked && (
                        <div className="w-5 h-5 border-2 border-edu-cyan border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Aksiyon Butonu (Sadece kontrol yapıldıktan sonra görünür) */}
      <AnimatePresence>
        {hasChecked && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-end pt-4"
          >
            <Button
              size="lg"
              onClick={handleNext}
              disabled={isSubmitting}
              className={cn(
                "font-bold px-8 text-white transition-all",
                isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-edu-orange hover:bg-edu-orange-dark"
              )}
            >
              {isSubmitting ? "Kaydediliyor..." : currentIndex < questions.length - 1 ? (
                <>Sıradaki Soru <ArrowRight className="w-5 h-5 ml-2" /></>
              ) : (
                "Sonuçları Gönder"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
