// ============================================================================
// Fenz Akademi — İlerleme (Progress) API Route Handler
// ============================================================================
// POST /api/progress → İlerleme kaydet/güncelle (UPSERT — sadece STUDENT)
// GET  /api/progress → Öğrencinin ilerleme bilgilerini getir
// ============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertProgressSchema } from "@/lib/validations";
import { apiResponse, apiError, formatZodErrors } from "@/lib/utils/helpers";

// ─── POST: İlerleme Kaydet/Güncelle ────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum kontrolü
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Oturum açmanız gereklidir", 401);
    }

    // 2. Request body'yi doğrula
    const body = await request.json();
    const validation = upsertProgressSchema.safeParse(body);

    if (!validation.success) {
      return apiError(formatZodErrors(validation.error.issues), 400);
    }

    const { lessonId, watchPercentage, isCompleted } = validation.data;

    // 3. İlerlemeyi upsert et (yoksa oluştur, varsa güncelle)
    const progress = await prisma.progress.upsert({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId,
        },
      },
      update: {
        watchPercentage,
        isCompleted,
        lastWatchedAt: new Date(),
      },
      create: {
        studentId: user.id,
        lessonId,
        watchPercentage,
        isCompleted,
      },
    });

    return apiResponse(progress);
  } catch (error) {
    console.error("[API] POST /api/progress error:", error);
    return apiError("İlerleme kaydedilirken bir hata oluştu", 500);
  }
}

// ─── GET: Öğrencinin İlerleme Bilgilerini Getir ────────────────────────────

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Oturum açmanız gereklidir", 401);
    }

    const progress = await prisma.progress.findMany({
      where: { studentId: user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { lastWatchedAt: "desc" },
    });

    return apiResponse(progress);
  } catch (error) {
    console.error("[API] GET /api/progress error:", error);
    return apiError("İlerleme bilgileri yüklenirken bir hata oluştu", 500);
  }
}
