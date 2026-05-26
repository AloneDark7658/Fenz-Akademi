// ============================================================================
// Fenz Akademi — Quiz Sonuçları API Route Handler
// ============================================================================
// POST /api/quiz-results → Quiz sonucu kaydet (sadece STUDENT)
// GET  /api/quiz-results → Öğrencinin quiz sonuçlarını getir
// ============================================================================

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiResponse, apiError } from "@/lib/utils/helpers";
// NOTE: POST metodu, güvenlik nedeniyle Server Action'a (src/app/actions/quiz.ts) taşınmıştır.

// ─── GET: Öğrencinin Quiz Sonuçlarını Getir ─────────────────────────────────

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Oturum açmanız gereklidir", 401);
    }

    const results = await prisma.quizResult.findMany({
      where: { studentId: user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            course: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    return apiResponse(results);
  } catch (error) {
    console.error("[API] GET /api/quiz-results error:", error);
    return apiError("Quiz sonuçları yüklenirken bir hata oluştu", 500);
  }
}
