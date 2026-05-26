// ============================================================================
// Fenz Akademi — Kurslar API Route Handler
// ============================================================================
// GET  /api/courses       → Kursları listele (filtreleme + sayfalama)
// POST /api/courses       → Yeni kurs oluştur (sadece TEACHER / ADMIN)
// ============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCourseSchema, courseQuerySchema } from "@/lib/validations";
import { sanitizeText } from "@/lib/utils/sanitize";
import { apiResponse, apiError, formatZodErrors } from "@/lib/utils/helpers";

// ─── GET: Kursları Listele ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // 1. Oturum kontrolü
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError("Oturum açmanız gereklidir", 401);
    }

    // 2. Query parametrelerini doğrula
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validation = courseQuerySchema.safeParse(searchParams);

    if (!validation.success) {
      return apiError(formatZodErrors(validation.error.issues), 400);
    }

    const { gradeLevel, search, page, limit } = validation.data;

    // 3. Filtreleme koşullarını oluştur
    const where = {
      ...(gradeLevel && { gradeLevel }),
      ...(search && {
        title: { contains: search, mode: "insensitive" as const },
      }),
      isPublished: true,
    };

    // 4. Veritabanı sorgusu (sayfalama ile)
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          videoLessons: {
            select: { id: true, title: true, duration: true, orderIndex: true },
            orderBy: { orderIndex: "asc" },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({ where }),
    ]);

    return apiResponse({
      items: courses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[API] GET /api/courses error:", error);
    return apiError("Kurslar yüklenirken bir hata oluştu", 500);
  }
}

// ─── POST: Yeni Kurs Oluştur ────────────────────────────────────────────────

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
    const validation = createCourseSchema.safeParse(body);

    if (!validation.success) {
      return apiError(formatZodErrors(validation.error.issues), 400);
    }

    // 3. Veriyi sanitize et
    const data = {
      ...validation.data,
      title: sanitizeText(validation.data.title),
      description: validation.data.description
        ? sanitizeText(validation.data.description)
        : null,
    };

    // 4. Veritabanına kaydet
    const course = await prisma.course.create({
      data,
    });

    return apiResponse(course, 201);
  } catch (error) {
    console.error("[API] POST /api/courses error:", error);
    return apiError("Kurs oluşturulurken bir hata oluştu", 500);
  }
}
