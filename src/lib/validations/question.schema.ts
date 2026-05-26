// ============================================================================
// Fenz Akademi — Soru Zod Doğrulama Şemaları
// ============================================================================
// Soru içerikleri XSS sanitizasyonundan geçirildikten SONRA Zod ile
// doğrulanır. Sanitize → Validate → Prisma sırası takip edilir.
// ============================================================================

import { z } from "zod";

// ─── Enum ───────────────────────────────────────────────────────────────────

export const QuestionStatusEnum = z.enum(["DRAFT", "PUBLISHED"]);
export type QuestionStatusType = z.infer<typeof QuestionStatusEnum>;

// ─── Soru Seçenek Şeması ───────────────────────────────────────────────────

/** Seçenekler en az 2, en fazla 6 adet string dizisi olmalıdır */
const optionsSchema = z
  .array(
    z
      .string()
      .min(1, "Seçenek boş olamaz")
      .max(500, "Seçenek en fazla 500 karakter olabilir")
  )
  .min(2, "En az 2 seçenek gereklidir")
  .max(6, "En fazla 6 seçenek eklenebilir");

// ─── Soru Oluşturma Şeması ─────────────────────────────────────────────────

export const createQuestionSchema = z
  .object({
    lessonId: z.string().uuid("Geçerli bir ders ID'si gereklidir"),
    content: z
      .string()
      .min(10, "Soru metni en az 10 karakter olmalıdır")
      .max(2000, "Soru metni en fazla 2000 karakter olabilir")
      .trim(),
    imageUrl: z.string().url("Geçerli bir URL giriniz").optional().nullable(),
    options: optionsSchema,
    correctAnswer: z
      .string()
      .min(1, "Doğru cevap boş olamaz")
      .max(500, "Doğru cevap çok uzun"),
    isAiGenerated: z.boolean().default(false),
    status: QuestionStatusEnum.default("DRAFT"),
  })
  .refine(
    (data) => data.options.includes(data.correctAnswer),
    {
      message: "Doğru cevap, seçenekler arasında yer almalıdır",
      path: ["correctAnswer"],
    }
  );

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

// ─── Soru Güncelleme Şeması ─────────────────────────────────────────────────

export const updateQuestionSchema = z
  .object({
    content: z
      .string()
      .min(10, "Soru metni en az 10 karakter olmalıdır")
      .max(2000, "Soru metni en fazla 2000 karakter olabilir")
      .trim()
      .optional(),
    imageUrl: z.string().url("Geçerli bir URL giriniz").optional().nullable(),
    options: optionsSchema.optional(),
    correctAnswer: z
      .string()
      .min(1, "Doğru cevap boş olamaz")
      .max(500, "Doğru cevap çok uzun")
      .optional(),
    isAiGenerated: z.boolean().optional(),
    status: QuestionStatusEnum.optional(),
  })
  .refine(
    (data) => {
      // Eğer hem options hem correctAnswer güncellendiyse, tutarlılık kontrolü
      if (data.options && data.correctAnswer) {
        return data.options.includes(data.correctAnswer);
      }
      return true;
    },
    {
      message: "Doğru cevap, seçenekler arasında yer almalıdır",
      path: ["correctAnswer"],
    }
  );

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
