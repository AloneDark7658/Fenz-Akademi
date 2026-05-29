"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ============================================================================
// Fenz Akademi — Auth Server Actions (Kayıt & Giriş)
// ============================================================================
// Güvenlik Kuralları:
// 1. Tüm girdiler Zod ile doğrulanır — ham veri asla işlenmez
// 2. Supabase Auth, kayıt/giriş mantığını yönetir (bcrypt, JWT)
// 3. Prisma users tablosu, Supabase auth.users ile senkronize tutulur
// 4. Kullanıcı rolü hem Supabase user_metadata hem de Prisma'da saklanır
// 5. Başarılı işlem sonrası rolüne göre dashboard'a yönlendirilir
// ============================================================================

// ─── Zod Validasyon Şemaları ────────────────────────────────────────────────

const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .trim(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
  role: z.enum(["STUDENT", "TEACHER", "PARENT"], {
    error: "Geçerli bir rol seçiniz",
  }),
  classLevel: z.coerce
    .number()
    .int()
    .min(5)
    .max(8)
    .optional()
    .nullable(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz").toLowerCase().trim(),
  password: z.string().min(1, "Şifre boş olamaz"),
});

// ─── Yardımcı: Role göre dashboard yolu ─────────────────────────────────────

const ROLE_DASHBOARD: Record<string, string> = {
  STUDENT: "/student",
  TEACHER: "/teacher",
  PARENT: "/parent",
  ADMIN: "/admin",
};

// ─── Tip Tanımları ───────────────────────────────────────────────────────────

export type AuthResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]>; data?: Record<string, any> };

// ─── KAYIT (signUp) ──────────────────────────────────────────────────────────

/**
 * Yeni kullanıcı kaydı oluşturur.
 *
 * Akış:
 *  1. Zod ile form verisi doğrulanır
 *  2. Supabase Auth'a kayıt isteği gönderilir (email/şifre hash işlemi Supabase'de)
 *  3. Supabase user_metadata'ya rol bilgisi yazılır
 *  4. Prisma users tablosuna profil satırı eklenir (Supabase ID ile senkron)
 *  5. Kullanıcı rolüne göre dashboard'a yönlendirilir
 */
export async function signUpAction(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  // 1. Validasyon
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    classLevel: formData.get("classLevel") || null,
  };

  const validation = signUpSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: "Lütfen formdaki hataları düzeltin",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      data: { name: raw.name, email: raw.email, role: raw.role, classLevel: raw.classLevel },
    };
  }

  const { name, email, password, role, classLevel } = validation.data;

  const supabase = await createSupabaseServerClient();

  // 2. Supabase Auth — kullanıcı kaydı
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,             // user_metadata'da saklanır — proxy.ts'te JWT'den okunur
        class_level: classLevel,
      },
    },
  });

  if (authError) {
    // Supabase'in İngilizce hata mesajlarını Türkçe'ye çeviriyoruz
    const errorMap: Record<string, string> = {
      "User already registered": "Bu e-posta adresi zaten kayıtlı.",
      "Password should be at least 6 characters": "Şifre en az 6 karakter olmalıdır.",
      "Invalid email": "Geçersiz e-posta adresi.",
    };
    return {
      success: false,
      error: errorMap[authError.message] ?? `Kayıt sırasında bir hata oluştu: ${authError.message}`,
      data: { name, email, role, classLevel },
    };
  }

  if (!authData.user) {
    return { success: false, error: "Kullanıcı oluşturulamadı." };
  }

  // 3. Prisma — users tablosuna satır ekle (Supabase UID ile senkron)
  try {
    await prisma.user.create({
      data: {
        id: authData.user.id,           // Supabase UUID ile tam eşleşme
        name,
        email,
        passwordHash: "[managed-by-supabase]", // Şifre Supabase'de, burada placeholder
        role: role as "STUDENT" | "TEACHER" | "PARENT" | "ADMIN",
        classLevel: classLevel ?? null,
      },
    });
  } catch (dbError) {
    // Prisma yazımı başarısız olursa Supabase kullanıcısını geri al
    const adminClient = await createSupabaseAdminClient();
    await adminClient.auth.admin.deleteUser(authData.user.id);

    console.error("[AUTH] signUp — Prisma write failed, rolled back Supabase user:", dbError);
    return {
      success: false,
      error: "Profil oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      data: { name, email, role, classLevel },
    };
  }

  // 4. Yönlendirme
  const dashboardPath = ROLE_DASHBOARD[role] ?? "/student";
  redirect(dashboardPath);
}

// ─── GİRİŞ (signIn) ──────────────────────────────────────────────────────────

/**
 * Mevcut kullanıcıyı doğrular ve giriş yaptırır.
 *
 * Akış:
 *  1. Zod ile form verisi doğrulanır
 *  2. Supabase Auth ile oturum açılır (JWT verilir)
 *  3. Kullanıcının rolü Prisma users tablosundan kontrol edilir
 *  4. Rol tutarsızlığı varsa user_metadata güncellenir (veri bütünlüğü)
 *  5. Kullanıcı rolüne göre dashboard'a yönlendirilir
 */
export async function signInAction(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  // 1. Validasyon
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = signInSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: "Lütfen formdaki hataları düzeltin",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
      data: { email: raw.email },
    };
  }

  const { email, password } = validation.data;

  const supabase = await createSupabaseServerClient();

  // 2. Supabase Auth — oturum aç
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    const errorMap: Record<string, string> = {
      "Invalid login credentials": "E-posta veya şifre hatalı.",
      "Email not confirmed": "E-posta adresinizi onaylamanız gerekiyor.",
      "Too many requests": "Çok fazla deneme yapıldı. Lütfen bir süre bekleyin.",
    };
    return {
      success: false,
      error: errorMap[authError.message] ?? "Giriş sırasında bir hata oluştu.",
      data: { email },
    };
  }

  if (!authData.user) {
    return { success: false, error: "Kullanıcı bilgileri alınamadı." };
  }

  // 3. Prisma — kullanıcı profilini ve rolünü doğrula
  const dbUser = await prisma.user.findUnique({
    where: { id: authData.user.id },
    select: { role: true, classLevel: true },
  });

  if (!dbUser) {
    // Supabase'de var ama Prisma'da yoksa (edge case) — güvenli çıkış
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Kullanıcı profili bulunamadı. Lütfen destek ile iletişime geçin.",
      data: { email },
    };
  }

  // 4. Rol tutarsızlığı kontrolü — Supabase metadata ile Prisma senkronize et
  const metaRole = authData.user.user_metadata?.role as string | undefined;
  if (metaRole !== dbUser.role) {
    // Prisma'daki rol esas alınır, Supabase metadata güncellenir
    await supabase.auth.updateUser({
      data: { role: dbUser.role },
    });
  }

  // 5. Yönlendirme
  const dashboardPath = ROLE_DASHBOARD[dbUser.role] ?? "/student";
  redirect(dashboardPath);
}

// ─── ÇIKIŞ (signOut) ─────────────────────────────────────────────────────────

/**
 * Aktif oturumu sonlandırır ve giriş sayfasına yönlendirir.
 */
export async function signOutAction(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
