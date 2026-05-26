// ============================================================================
// Fenz Akademi — Kurs Zod Doğrulama Şemaları
// ============================================================================

import { z } from "zod";

// ─── Kurs Oluşturma Şeması ─────────────────────────────────────────────────

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Kurs başlığı en az 3 karakter olmalıdır")
    .max(200, "Kurs başlığı en fazla 200 karakter olabilir")
    .trim(),
  description: z
    .string()
    .max(2000, "Açıklama en fazla 2000 karakter olabilir")
    .trim()
    .optional(),
  gradeLevel: z
    .number()
    .int()
    .min(5, "Sınıf seviyesi 5-8 arası olmalıdır")
    .max(8, "Sınıf seviyesi 5-8 arası olmalıdır"),
  imageUrl: z.string().url("Geçerli bir URL giriniz").optional().nullable(),
  isPublished: z.boolean().default(false),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// ─── Kurs Güncelleme Şeması ─────────────────────────────────────────────────

export const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ─── Kurs Sorgulama Şeması ─────────────────────────────────────────────────

export const courseQuerySchema = z.object({
  gradeLevel: z.coerce
    .number()
    .int()
    .min(5)
    .max(8)
    .optional(),
  search: z
    .string()
    .max(100, "Arama terimi çok uzun")
    .trim()
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CourseQueryInput = z.infer<typeof courseQuerySchema>;

// ─── Video Ders Oluşturma Şeması ───────────────────────────────────────────

export const createVideoLessonSchema = z.object({
  courseId: z.string().uuid("Geçerli bir kurs ID'si gereklidir"),
  title: z
    .string()
    .min(3, "Ders başlığı en az 3 karakter olmalıdır")
    .max(200, "Ders başlığı en fazla 200 karakter olabilir")
    .trim(),
  cloudflareStreamUrl: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .nullable(),
  duration: z
    .number()
    .int()
    .min(0, "Süre negatif olamaz")
    .optional()
    .nullable(),
  orderIndex: z.number().int().min(0).default(0),
});

export type CreateVideoLessonInput = z.infer<typeof createVideoLessonSchema>;

// ─── Video Ders Güncelleme Şeması ───────────────────────────────────────────

export const updateVideoLessonSchema = createVideoLessonSchema
  .omit({ courseId: true })
  .partial();
export type UpdateVideoLessonInput = z.infer<typeof updateVideoLessonSchema>;
