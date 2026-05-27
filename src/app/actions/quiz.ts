"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  checkAnswerSchema,
  submitQuizAnswersSchema,
} from "@/lib/validations/quiz.schema";
import { checkAndAwardBadges } from "./gamification";

// ============================================================================
// Fenz Akademi — Quiz / Soru Değerlendirme Backend (Server Actions)
// ============================================================================

// Her doğru soru için verilecek standart XP
const XP_PER_CORRECT_ANSWER = 10;

/**
 * 1. Tekil Soru Kontrolü (Duolingo Stili - Anında Geri Bildirim)
 * Frontend'den gelen seçimi kontrol eder ve doğruluk durumunu döner.
 */
export async function checkAnswerAction(payload: {
  questionId: string;
  selectedAnswer: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = checkAnswerSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, error: "Geçersiz veri" };
    }

    const { questionId, selectedAnswer } = validation.data;

    // Veritabanından doğru cevabı çek (İstemciye asla baştan gitmemişti)
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correctAnswer: true },
    });

    if (!question) {
      return { success: false, error: "Soru bulunamadı" };
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    return {
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer, // Yanlış bildiyse doğruyu göstermek için dönüyoruz
      },
    };
  } catch (error) {
    console.error("[ACTION] checkAnswerAction error:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * 2. Güvenli Toplu Test Gönderimi (Puan ve XP Hesaplama)
 * Test bittiğinde çağrılır, puanı backend'de hesaplayarak güvenliği sağlar.
 */
export async function submitQuizAction(payload: {
  lessonId: string;
  answers: { questionId: string; selectedAnswer: string }[];
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = submitQuizAnswersSchema.safeParse(payload);
    if (!validation.success) {
      return { success: false, error: "Geçersiz gönderim formatı" };
    }

    const { lessonId, answers } = validation.data;

    const questionIds = answers.map((a) => a.questionId);

    // Soruları ve ait oldukları ders (video) bilgilerini getir
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        correctAnswer: true,
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (questions.length === 0) {
      return { success: false, error: "Sorular bulunamadı." };
    }

    let correctCount = 0;
    let wrongCount = 0;

    // Yanlışları derslere göre gruplamak için bir map (lessonId -> { title, count })
    const wrongLessonsMap = new Map<string, { title: string; count: number }>();

    // Performans için soruları map'e alalım
    type QuestionItem = { id: string; correctAnswer: string; lesson: { id: string; title: string } | null };
    const questionMap = new Map<string, QuestionItem>(questions.map((q) => [q.id, q as QuestionItem]));

    for (const answer of answers) {
      const q = questionMap.get(answer.questionId);
      if (q) {
        if (q.correctAnswer === answer.selectedAnswer) {
          correctCount++;
        } else {
          wrongCount++;
          // Yanlış yapılan sorunun ait olduğu dersi map'e kaydet
          if (q.lesson) {
            const existing = wrongLessonsMap.get(q.lesson.id);
            if (existing) {
              existing.count += 1;
            } else {
              wrongLessonsMap.set(q.lesson.id, {
                title: q.lesson.title,
                count: 1,
              });
            }
          }
        }
      }
    }

    // Puan hesaplama (Yüzdelik)
    const totalAnswered = correctCount + wrongCount;
    const score = totalAnswered > 0 ? (correctCount / questions.length) * 100 : 0;
    
    // Kazanılan XP
    const earnedXp = correctCount * XP_PER_CORRECT_ANSWER;

    // Tavsiyeleri (Recommendations) diziye çevir
    const recommendations = Array.from(wrongLessonsMap.entries()).map(
      ([id, data]) => ({
        lessonId: id,
        lessonTitle: data.title,
        wrongCount: data.count,
      })
    );

    // Veritabanı Transaction
    const [quizResult] = await prisma.$transaction([
      prisma.quizResult.upsert({
        where: {
          studentId_lessonId: {
            studentId: user.id,
            lessonId, // Ana quiz bağlamı (Eğer quiz genele aitse bu courseId vs. olabilir, şimdilik mevcut şemaya uyuyoruz)
          },
        },
        update: {
          correctCount,
          wrongCount,
          score,
          completedAt: new Date(),
        },
        create: {
          studentId: user.id,
          lessonId,
          correctCount,
          wrongCount,
          score,
        },
      }),

      prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: earnedXp },
          // Basit bir streak mantığı: Quiz çözdükçe streak artar (gerçekte tarih kontrolü yapılmalı, şimdilik basit tutuyoruz)
          streak: { increment: 1 },
        },
      }),
    ]);

    // Oyunlaştırma: Yeni rozetleri kontrol et ve ver
    const newBadges = await checkAndAwardBadges(user.id);

    return {
      success: true,
      data: {
        correctCount,
        wrongCount,
        score,
        earnedXp,
        recommendations,
        newBadges, // Frontend'e kazanılan rozetleri dönüyoruz
      },
    };
  } catch (error) {
    console.error("[ACTION] submitQuizAction error:", error);
    return { success: false, error: "Internal server error" };
  }
}
