// ============================================================================
// Fenz Akademi — Kullanıcı Zod Doğrulama Şemaları
// ============================================================================
// Tüm kullanıcı ile ilgili API girdileri buradaki şemalarla doğrulanır.
// Prisma'ya ulaşmadan ÖNCE Zod validasyonundan geçmelidir.
// ============================================================================

import { z } from "zod";

// ─── Enum Tanımları ─────────────────────────────────────────────────────────

export const RoleEnum = z.enum(["STUDENT", "TEACHER", "PARENT", "ADMIN"]);
export type RoleType = z.infer<typeof RoleEnum>;

// ─── Kayıt (Register) Şeması ───────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "İsim en az 2 karakter olmalıdır")
      .max(100, "İsim en fazla 100 karakter olabilir")
      .trim(),
    email: z
      .string()
      .email("Geçerli bir e-posta adresi giriniz")
      .max(255, "E-posta adresi çok uzun")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(128, "Şifre en fazla 128 karakter olabilir")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir"
      ),
    confirmPassword: z.string(),
    role: RoleEnum.default("STUDENT"),
    classLevel: z
      .number()
      .int()
      .min(5, "Sınıf seviyesi 5-8 arası olmalıdır")
      .max(8, "Sınıf seviyesi 5-8 arası olmalıdır")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Giriş (Login) Şeması ──────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Şifre gereklidir")
    .max(128, "Şifre en fazla 128 karakter olabilir"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Profil Güncelleme Şeması ───────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(100, "İsim en fazla 100 karakter olabilir")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Geçerli bir URL giriniz").optional().nullable(),
  classLevel: z
    .number()
    .int()
    .min(5, "Sınıf seviyesi 5-8 arası olmalıdır")
    .max(8, "Sınıf seviyesi 5-8 arası olmalıdır")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
