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
  videoUrl: z
    .string()
    .url("Geçerli bir video URL'si giriniz")
    .optional()
    .or(z.literal("")),
  description: z.string().max(500).optional(),
  duration: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),
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
    videoUrl: formData.get("videoUrl") || undefined,
    description: formData.get("description") || undefined,
    duration: formData.get("duration") || null,
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
      // cloudflareStreamUrl alanına şimdilik videoUrl yazıyoruz;
      // ileride Bunny.net/Cloudflare Stream ID'ye geçilecek
      cloudflareStreamUrl: validation.data.videoUrl || null,
      duration: validation.data.duration ?? null,
      orderIndex: course._count.videoLessons + 1,
    },
  });

  revalidatePath("/teacher/lessons");
  revalidatePath("/teacher/questions"); // Soru formu ders listesini günceller
  return { success: true, message: "Video ders başarıyla eklendi! 🎬", lessonId: lesson.id };
}

// ─── Ders Yayınlama/Yayından Kaldırma Toogle ─────────────────────────────────

export async function toggleLessonPublishAction(lessonId: string): Promise<void> {
  const auth = await requireTeacher();
  if (auth.error) return;

  const lesson = await prisma.videoLesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { isPublished: true } } },
  });

  if (!lesson) return;

  // Kurs yayında değilse, dersi de yayına alırken kursu aktif et
  await prisma.$transaction([
    prisma.videoLesson.update({
      where: { id: lessonId },
      // VideoLesson modelinde isPublished yok — kursu güncelliyoruz
      data: {},
    }),
    ...(lesson.course.isPublished
      ? []
      : [
          prisma.course.update({
            where: { id: lesson.courseId },
            data: { isPublished: true },
          }),
        ]),
  ]);

  revalidatePath("/teacher/lessons");
}
