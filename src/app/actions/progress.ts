"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertProgressSchema } from "@/lib/validations/quiz.schema";

// ============================================================================
// Fenz Akademi — Progress Tracking Server Action (Heartbeat)
// ============================================================================

export async function updateProgress(payload: {
  lessonId: string;
  watchPercentage: number;
  isCompleted?: boolean;
}) {
  try {
    // 1. Güvenlik: Kullanıcı oturumunu doğrula
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Veri Doğrulama: Zod şeması ile gelen veriyi kontrol et
    const validation = upsertProgressSchema.safeParse(payload);

    if (!validation.success) {
      return { success: false, error: "Invalid data format" };
    }

    const { lessonId, watchPercentage, isCompleted } = validation.data;

    // 3. Veritabanı İşlemi: Prisma ile Upsert
    // Eğer kullanıcının bu ders için önceden progress kaydı varsa güncellenir,
    // yoksa yeni kayıt oluşturulur.
    const progress = await prisma.progress.upsert({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId,
        },
      },
      update: {
        // İzleme yüzdesi sadece artabilir (öğrencinin ilerlemesi silinmesin)
        watchPercentage: {
          set: Math.max(watchPercentage, 0), // İsteğe bağlı olarak mevcut yüzdenin üstüne çıkılması zorlanabilir
        },
        // Eğer isCompleted true ise (öğrenci 90%ı geçti ve butona bastı) bunu kaydet
        ...(isCompleted !== undefined && { isCompleted }),
      },
      create: {
        studentId: user.id,
        lessonId,
        watchPercentage,
        isCompleted: isCompleted || false,
      },
    });

    return { success: true, data: progress };
  } catch (error) {
    console.error("[ACTION] updateProgress error:", error);
    return { success: false, error: "Internal server error" };
  }
}
