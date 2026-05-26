// ============================================================================
// Fenz Akademi — Quiz ve İlerleme Zod Doğrulama Şemaları
// ============================================================================

import { z } from "zod";

// ─── İlerleme Kaydetme Şeması ───────────────────────────────────────────────

export const upsertProgressSchema = z.object({
  lessonId: z.string().uuid("Geçerli bir ders ID'si gereklidir"),
  watchPercentage: z
    .number()
    .min(0, "İzleme yüzdesi 0'dan küçük olamaz")
    .max(100, "İzleme yüzdesi 100'den büyük olamaz"),
  isCompleted: z.boolean().default(false),
});

export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>;

// ─── Tekil Soru Kontrol Şeması (Anında Geri Bildirim İçin) ─────────────────

export const checkAnswerSchema = z.object({
  questionId: z.string().uuid("Geçerli bir soru ID'si gereklidir"),
  selectedAnswer: z.string().min(1, "Lütfen bir cevap seçin"),
});

export type CheckAnswerInput = z.infer<typeof checkAnswerSchema>;

// ─── Güvenli Toplu Quiz Gönderim Şeması ─────────────────────────────────────
// Kritik: İstemciden asla correctCount veya score alınmaz. Sadece verilen cevaplar alınır.

export const submitQuizAnswersSchema = z.object({
  lessonId: z.string().uuid("Geçerli bir ders ID'si gereklidir"),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        selectedAnswer: z.string(),
      })
    )
    .min(1, "En az bir soru cevaplanmış olmalıdır"),
});

export type SubmitQuizAnswersInput = z.infer<typeof submitQuizAnswersSchema>;

// ─── Quiz Sonuçları Sorgulama Şeması ────────────────────────────────────────

export const quizResultQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type QuizResultQueryInput = z.infer<typeof quizResultQuerySchema>;
