"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── Yardımcı: Rol Doğrulama ─────────────────────────────────────────────────

async function requireTeacher() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || !["TEACHER", "ADMIN"].includes(dbUser.role)) {
    return { user: null, error: "Bu işlem için yetkiniz yok." as const };
  }

  return { user, error: null };
}

// ─── Zod Şeması ───────────────────────────────────────────────────────────────

const addQuestionSchema = z.object({
  lessonId: z.string().min(1, "Ders seçiniz"),
  content: z.string().min(10, "Soru en az 10 karakter olmalıdır").max(1000),
  optionA: z.string().min(1, "A şıkkı zorunludur"),
  optionB: z.string().min(1, "B şıkkı zorunludur"),
  optionC: z.string().min(1, "C şıkkı zorunludur"),
  optionD: z.string().min(1, "D şıkkı zorunludur"),
  correctAnswer: z.enum(["A", "B", "C", "D"], {
    error: "Doğru cevap seçiniz",
  }),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    error: "Zorluk seviyesi seçiniz",
  }),
});

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type AddQuestionResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Soru Ekleme Action ───────────────────────────────────────────────────────

export async function addQuestionAction(
  _prev: AddQuestionResult | null,
  formData: FormData
): Promise<AddQuestionResult> {
  // 1. Oturum kontrolü
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Rol kontrolü — sadece TEACHER ve ADMIN
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || !["TEACHER", "ADMIN"].includes(dbUser.role)) {
    return { success: false, error: "Bu işlem için yetkiniz yok." };
  }

  // 3. Validasyon
  const raw = {
    lessonId: formData.get("lessonId"),
    content: formData.get("content"),
    optionA: formData.get("optionA"),
    optionB: formData.get("optionB"),
    optionC: formData.get("optionC"),
    optionD: formData.get("optionD"),
    correctAnswer: formData.get("correctAnswer"),
    difficulty: formData.get("difficulty"),
  };

  const validation = addQuestionSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: "Lütfen formdaki hataları düzeltin",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { lessonId, content, optionA, optionB, optionC, optionD, correctAnswer } =
    validation.data;

  // 4. Şıkları seçilen doğru cevaba göre map'le
  const optionMap: Record<string, string> = {
    A: optionA,
    B: optionB,
    C: optionC,
    D: optionD,
  };
  const correctAnswerText = optionMap[correctAnswer];

  // 5. Dersin varlığını kontrol et
  const lesson = await prisma.videoLesson.findUnique({
    where: { id: lessonId },
    select: { id: true },
  });

  if (!lesson) {
    return { success: false, error: "Seçilen ders bulunamadı." };
  }

  // 6. Soruyu kaydet
  await prisma.question.create({
    data: {
      lessonId,
      content,
      options: [optionA, optionB, optionC, optionD],
      correctAnswer: correctAnswerText,
      status: "DRAFT",
    },
  });

  return { success: true, message: "Soru başarıyla eklendi! 🎉" };
}

// ─── Kurs & Ders Ekleme Şemaları ─────────────────────────────────────────────

const addCourseSchema = z.object({
  title: z.string().min(3, "Kurs adı en az 3 karakter olmalıdır").max(120),
  description: z.string().max(500).optional(),
  gradeLevel: z.coerce
    .number()
    .int()
    .min(5, "Sınıf 5-8 arasında olmalıdır")
    .max(8, "Sınıf 5-8 arasında olmalıdır"),
});

const addLessonSchema = z.object({
  courseId: z.string().min(1, "Kurs seçiniz"),
  title: z.string().min(3, "Ders adı en az 3 karakter olmalıdır").max(200),
  bunnyVideoId: z
    .string()
    .min(1, "Lütfen bir video yükleyin")
    .optional()
    .or(z.literal("")),
  description: z.string().max(500).optional(),
  durationHours: z.coerce.number().int().min(0).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(0).max(59).optional().nullable(),
});

const updateLessonSchema = z.object({
  lessonId: z.string().min(1, "Ders bulunamadı"),
  courseId: z.string().min(1, "Kurs seçiniz"),
  title: z.string().min(3, "Ders adı en az 3 karakter olmalıdır").max(200),
  description: z.string().max(500).optional(),
  durationHours: z.coerce.number().int().min(0).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(0).max(59).optional().nullable(),
});

// ─── Tip Tanımları ────────────────────────────────────────────────────────────

export type LessonActionResult =
  | { success: true; message: string; lessonId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type CourseActionResult =
  | { success: true; message: string; courseId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Kurs Oluşturma Action ────────────────────────────────────────────────────

/**
 * Yeni bir Course (Ünite/Konu) oluşturur.
 * VideoLesson'lar bu kursa bağlanır.
 */
export async function addCourseAction(
  _prev: CourseActionResult | null,
  formData: FormData
): Promise<CourseActionResult> {
  const auth = await requireTeacher();
  if (auth.error) return { success: false, error: auth.error };

  const raw = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    gradeLevel: formData.get("gradeLevel"),
  };

  const validation = addCourseSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: "Lütfen formdaki hataları düzeltin",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const course = await prisma.course.create({
    data: {
      title: validation.data.title,
      description: validation.data.description ?? null,
      gradeLevel: validation.data.gradeLevel,
      isPublished: false,
    },
  });

  revalidatePath("/teacher/lessons");
  return { success: true, message: "Kurs (ünite) oluşturuldu! 🎉", courseId: course.id };
}

// ─── Video Ders Oluşturma Action ──────────────────────────────────────────────

/**
 * Bir kursa bağlı yeni VideoLesson ekler.
 * Bu ders, QuizSummary'deki "Eksiğini Kapat" özelliğinin yönlendirdiği hedeftir.
 * Aynı zamanda Soru Havuzu'nda sorularla ilişkilendirilir.
 */
export async function addLessonAction(
  _prev: LessonActionResult | null,
  formData: FormData
): Promise<LessonActionResult> {
  const auth = await requireTeacher();
  if (auth.error) return { success: false, error: auth.error };

  const raw = {
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    bunnyVideoId: formData.get("bunnyVideoId") || undefined,
    durationHours: formData.get("durationHours") || null,
    durationMinutes: formData.get("durationMinutes") || null,
  };

  const validation = addLessonSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: "Lütfen formdaki hataları düzeltin",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Kursun varlığını doğrula
  const course = await prisma.course.findUnique({
    where: { id: validation.data.courseId },
    select: { id: true, _count: { select: { videoLessons: true } } },
  });

  if (!course) {
    return { success: false, error: "Seçilen kurs (ünite) bulunamadı." };
  }

  // Dersi oluştur — orderIndex mevcut ders sayısı + 1
  const lesson = await prisma.videoLesson.create({
    data: {
      courseId: validation.data.courseId,
      title: validation.data.title,
      bunnyVideoId: validation.data.bunnyVideoId || null,
      duration: 
        (validation.data.durationHours || 0) * 3600 + (validation.data.durationMinutes || 0) * 60 > 0
          ? (validation.data.durationHours || 0) * 3600 + (validation.data.durationMinutes || 0) * 60
          : null,
      orderIndex: course._count.videoLessons + 1,
    },
  });

  revalidatePath("/teacher/lessons");
  revalidatePath("/teacher/questions"); // Soru formu ders listesini günceller
  return { success: true, message: "Video ders başarıyla eklendi! 🎬", lessonId: lesson.id };
}

// ─── Video Ders Güncelleme Action ─────────────────────────────────────────────

export async function updateLessonAction(
  _prev: LessonActionResult | null,
  formData: FormData
): Promise<LessonActionResult> {
  const auth = await requireTeacher();
  if (auth.error) return { success: false, error: auth.error };

  const raw = {
    lessonId: formData.get("lessonId"),
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    durationHours: formData.get("durationHours") || null,
    durationMinutes: formData.get("durationMinutes") || null,
  };

  const validation = updateLessonSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: "Lütfen formdaki hataları düzeltin",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existingLesson = await prisma.videoLesson.findUnique({
    where: { id: validation.data.lessonId },
  });

  if (!existingLesson) {
    return { success: false, error: "Ders bulunamadı" };
  }

  // Yeni süre hesaplama
  const duration = 
    (validation.data.durationHours || 0) * 3600 + (validation.data.durationMinutes || 0) * 60 > 0
      ? (validation.data.durationHours || 0) * 3600 + (validation.data.durationMinutes || 0) * 60
      : null;

  await prisma.videoLesson.update({
    where: { id: validation.data.lessonId },
    data: {
      courseId: validation.data.courseId,
      title: validation.data.title,
      duration,
    },
  });

  revalidatePath("/teacher/lessons");
  revalidatePath("/teacher/questions");
  return { success: true, message: "Ders güncellendi! ✅", lessonId: validation.data.lessonId };
}

// ─── Kurs Yayınlama/Yayından Kaldırma Toogle ─────────────────────────────────

export async function toggleCoursePublishAction(courseId: string) {
  const auth = await requireTeacher();
  if (auth.error) return { success: false, error: auth.error };

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) return { success: false, error: "Kurs bulunamadı" };

  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: !course.isPublished },
  });

  revalidatePath("/teacher/lessons");
  return { success: true };
}

// ─── Silme ve Sıralama Action'ları ──────────────────────────────────────────

export async function deleteCourseAction(courseId: string) {
  const auth = await requireTeacher();
  if (auth.error) return { success: false, error: auth.error };

  // Veritabanından kursu sil (Cascade sayesinde içindeki dersler ve sorular da silinir)
  // Not: Bunny.net API'si üzerinden videoları temizlemek için ayrı bir mekanizma veya background job gerekebilir.
  // Basitlik adına şu an sadece DB'den siliyoruz. Gerçek prod ortamında videoId'leri toplayıp Bunny'ye DELETE atılmalı.
  await prisma.course.delete({ where: { id: courseId } });
  
  revalidatePath("/teacher/lessons");
  return { success: true };
}

export async function deleteLessonAction(lessonId: string, bunnyVideoId?: string | null) {
  const auth = await requireTeacher();
  if (auth.error) return { success: false, error: auth.error };

  await prisma.videoLesson.delete({ where: { id: lessonId } });

  // Eğer Bunny'de video varsa onu da sil
  if (bunnyVideoId && process.env.BUNNY_API_KEY && process.env.BUNNY_LIBRARY_ID) {
    try {
      await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${bunnyVideoId}`,
        {
          method: "DELETE",
          headers: {
            AccessKey: process.env.BUNNY_API_KEY,
            Accept: "application/json",
          },
        }
      );
    } catch (e) {
      console.error("Bunny API Video Silme Hatası:", e);
    }
  }

  revalidatePath("/teacher/lessons");
  return { success: true };
}

export async function reorderLessonAction(lessonId: string, direction: "UP" | "DOWN") {
  const auth = await requireTeacher();
  if (auth.error) return { success: false, error: auth.error };

  const currentLesson = await prisma.videoLesson.findUnique({
    where: { id: lessonId },
  });

  if (!currentLesson) return { success: false, error: "Ders bulunamadı" };

  const siblingLesson = await prisma.videoLesson.findFirst({
    where: {
      courseId: currentLesson.courseId,
      orderIndex: direction === "UP" 
        ? { lt: currentLesson.orderIndex } 
        : { gt: currentLesson.orderIndex },
    },
    orderBy: { orderIndex: direction === "UP" ? "desc" : "asc" },
  });

  if (!siblingLesson) return { success: false, error: "Sınırda" }; // Zaten en üstte veya en altta

  // Sıraları (orderIndex) takas et
  await prisma.$transaction([
    prisma.videoLesson.update({
      where: { id: currentLesson.id },
      data: { orderIndex: siblingLesson.orderIndex },
    }),
    prisma.videoLesson.update({
      where: { id: siblingLesson.id },
      data: { orderIndex: currentLesson.orderIndex },
    }),
  ]);

  revalidatePath("/teacher/lessons");
  return { success: true };
}
