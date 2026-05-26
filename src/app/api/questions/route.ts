// ============================================================================
// Fenz Akademi — Sorular API Route Handler
// ============================================================================
// GET  /api/questions?lessonId=xxx → Ders'e ait soruları getir
// POST /api/questions              → Yeni soru oluştur (TEACHER / ADMIN)
// ============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createQuestionSchema } from "@/lib/validations";
import { sanitizeHtml, sanitizeUrl } from "@/lib/utils/sanitize";
import { apiResponse, apiError, formatZodErrors } from "@/lib/utils/helpers";

// ─── GET: Soruları Getir ────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Oturum açmanız gereklidir", 401);
    }

    const lessonId = request.nextUrl.searchParams.get("lessonId");
    if (!lessonId) {
      return apiError("lessonId parametresi gereklidir", 400);
    }

    const userRole = user.user_metadata?.role as string;

    // Öğrenciler sadece PUBLISHED soruları görebilir
    const where = {
      lessonId,
      ...(userRole === "STUDENT" && { status: "PUBLISHED" as const }),
    };

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return apiResponse(questions);
  } catch (error) {
    console.error("[API] GET /api/questions error:", error);
    return apiError("Sorular yüklenirken bir hata oluştu", 500);
  }
}

// ─── POST: Yeni Soru Oluştur ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Oturum & yetki kontrolü
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Oturum açmanız gereklidir", 401);
    }

    const userRole = user.user_metadata?.role as string;
    if (!["TEACHER", "ADMIN"].includes(userRole)) {
      return apiError("Bu işlem için yetkiniz yok", 403);
    }

    // 2. Request body'yi doğrula
    const body = await request.json();
    const validation = createQuestionSchema.safeParse(body);

    if (!validation.success) {
      return apiError(formatZodErrors(validation.error.issues), 400);
    }

    // 3. XSS Sanitizasyonu — soru içeriği özellikle sanitize edilmeli
    const data = {
      ...validation.data,
      content: sanitizeHtml(validation.data.content),
      imageUrl: validation.data.imageUrl
        ? sanitizeUrl(validation.data.imageUrl)
        : null,
    };

    // 4. Veritabanına kaydet
    const question = await prisma.question.create({
      data,
    });

    return apiResponse(question, 201);
  } catch (error) {
    console.error("[API] POST /api/questions error:", error);
    return apiError("Soru oluşturulurken bir hata oluştu", 500);
  }
}
