"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// ─── Yardımcı: Mevcut kullanıcıyı ve rolünü al ───────────────────────────────
async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, name: true },
  });
  return dbUser ? { ...dbUser, authUser: user } : null;
}

// ─── 1. Canlı Ders Oturumu Oluştur ──────────────────────────────────────────
export async function createLiveSessionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return { error: "Yetkisiz işlem." };
  }

  const title = formData.get("title") as string;
  const scheduledFor = formData.get("scheduledFor") as string;
  const courseId = formData.get("courseId") as string | null;

  if (!title?.trim() || !scheduledFor) {
    return { error: "Ders başlığı ve tarih zorunludur." };
  }

  try {
    // Daily.co API'yi doğrudan çağır (API route üzerinden)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/live/create-room`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          scheduledFor,
          courseId: courseId || null,
        }),
        // Supabase auth cookie'leri ile bu route'u çağırmak mümkün değil
        // Bu yüzden token üretimini doğrudan burada yapıyoruz
      }
    );

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error || "Ders oluşturulamadı." };
    }

    const data = await res.json();
    revalidatePath("/teacher/live");
    return { success: true, sessionId: data.sessionId };
  } catch {
    return { error: "Sunucu hatası. Lütfen tekrar deneyin." };
  }
}

// ─── 2. Oturumu Sonlandır ────────────────────────────────────────────────────
export async function endSessionAction(sessionId: string) {
  const user = await getCurrentUser();
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return { error: "Yetkisiz işlem." };
  }

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: { teacherId: true },
  });
  if (!session || session.teacherId !== user.id) {
    return { error: "Bu oturumu sonlandırma yetkiniz yok." };
  }

  await prisma.liveSession.update({
    where: { id: sessionId },
    data: { status: "ENDED" },
  });

  revalidatePath("/teacher/live");
  return { success: true };
}

// ─── 3. KVKK Onayını Kaydet ─────────────────────────────────────────────────
export async function recordConsentAction(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Oturum açmanız gerekiyor." };

  // Oturum varlığını doğrula
  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true },
  });
  if (!session) return { error: "Ders oturumu bulunamadı." };

  // Daha önce onay verilmiş mi kontrol et (duplicate önleme)
  const existing = await prisma.studentConsent.findFirst({
    where: {
      studentId: user.id,
      sessionId,
      consentType: "KVKK_LIVE_CLASS",
    },
  });
  if (existing) {
    // Zaten onaylanmış — hata döndürme, ilerle
    return { success: true, alreadyConsented: true };
  }

  // IP adresi ve User-Agent bilgisini al (hukuki loglama)
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  await prisma.studentConsent.create({
    data: {
      studentId: user.id,
      sessionId,
      consentType: "KVKK_LIVE_CLASS",
      ipAddress,
      userAgent,
    },
  });

  return { success: true };
}

// ─── 4. Anket Oluştur (Öğretmen) ────────────────────────────────────────────
export async function createPollAction(
  sessionId: string,
  question: string,
  options: string[]
) {
  const user = await getCurrentUser();
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return { error: "Yetkisiz işlem." };
  }

  if (!question?.trim()) return { error: "Soru metni zorunludur." };
  if (options.length < 2 || options.length > 4) {
    return { error: "2 ile 4 şık arasında olmalıdır." };
  }
  const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
  if (cleanOptions.length < 2) return { error: "En az 2 geçerli şık gerekli." };

  // Mevcut aktif anketi kapat
  await prisma.livePoll.updateMany({
    where: { sessionId, isActive: true },
    data: { isActive: false, isCompleted: true },
  });

  const poll = await prisma.livePoll.create({
    data: {
      sessionId,
      question: question.trim(),
      options: cleanOptions,
      isActive: true,
      isCompleted: false,
    },
  });

  return { success: true, pollId: poll.id };
}

// ─── 5. Ankete Oy Ver (Öğrenci) ─────────────────────────────────────────────
export async function submitPollVoteAction(
  pollId: string,
  selectedOption: number
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Oturum açmanız gerekiyor." };

  const poll = await prisma.livePoll.findUnique({
    where: { id: pollId },
    select: { isActive: true, isCompleted: true, options: true },
  });
  if (!poll) return { error: "Anket bulunamadı." };
  if (!poll.isActive || poll.isCompleted) {
    return { error: "Bu anket artık aktif değil." };
  }

  const optionsArray = poll.options as string[];
  if (selectedOption < 0 || selectedOption >= optionsArray.length) {
    return { error: "Geçersiz şık seçimi." };
  }

  try {
    await prisma.livePollVote.create({
      data: {
        pollId,
        studentId: user.id,
        selectedOption,
      },
    });
    return { success: true };
  } catch (error: any) {
    // @@unique kısıtı: zaten oy verilmiş
    if (error.code === "P2002") {
      return { error: "Bu ankete zaten oy verdiniz." };
    }
    return { error: "Oy kaydedilemedi." };
  }
}

// ─── 6. Anketi Sonlandır (Öğretmen) ─────────────────────────────────────────
export async function endPollAction(pollId: string) {
  const user = await getCurrentUser();
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return { error: "Yetkisiz işlem." };
  }

  await prisma.livePoll.update({
    where: { id: pollId },
    data: { isActive: false, isCompleted: true },
  });

  return { success: true };
}

// ─── 7. Aktif Anketi ve Sonuçlarını Getir ───────────────────────────────────
export async function getActivePollAction(sessionId: string) {
  const poll = await prisma.livePoll.findFirst({
    where: { sessionId, isActive: true },
    include: {
      votes: { select: { selectedOption: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!poll) return { poll: null };

  const optionsArray = poll.options as string[];
  // Şık bazında oy sayıları
  const voteCounts = optionsArray.map((_, idx) =>
    poll.votes.filter((v) => v.selectedOption === idx).length
  );

  return {
    poll: {
      id: poll.id,
      question: poll.question,
      options: optionsArray,
      isActive: poll.isActive,
      isCompleted: poll.isCompleted,
      totalVotes: poll.votes.length,
      voteCounts,
    },
  };
}

// ─── 8. Oturum Listesini Getir (Öğretmen) ───────────────────────────────────
export async function getTeacherSessionsAction() {
  const user = await getCurrentUser();
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return { sessions: [] };
  }

  const sessions = await prisma.liveSession.findMany({
    where: { teacherId: user.id },
    orderBy: { scheduledFor: "desc" },
    include: {
      course: { select: { title: true } },
      _count: { select: { polls: true } },
    },
  });

  return { sessions };
}

// ─── 9. Oturumu Düzenle (Öğretmen) ──────────────────────────────────────────
export async function updateSessionAction(
  sessionId: string,
  data: { title?: string; scheduledFor?: string; courseId?: string | null }
) {
  const user = await getCurrentUser();
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return { error: "Yetkisiz işlem." };
  }

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: { teacherId: true, status: true },
  });

  if (!session || session.teacherId !== user.id) {
    return { error: "Bu oturumu düzenleme yetkiniz yok." };
  }

  if (session.status === "ENDED") {
    return { error: "Sona eren bir oturum düzenlenemez." };
  }

  await prisma.liveSession.update({
    where: { id: sessionId },
    data: {
      ...(data.title && { title: data.title.trim() }),
      ...(data.scheduledFor && { scheduledFor: new Date(data.scheduledFor) }),
      ...(data.courseId !== undefined && { courseId: data.courseId || null }),
    },
  });

  revalidatePath("/teacher/live");
  return { success: true };
}

// ─── 10. Oturumu Sil (Öğretmen) ─────────────────────────────────────────────
export async function deleteSessionAction(sessionId: string) {
  const user = await getCurrentUser();
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return { error: "Yetkisiz işlem." };
  }

  const session = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    select: { teacherId: true, status: true, roomName: true },
  });

  if (!session || session.teacherId !== user.id) {
    return { error: "Bu oturumu silme yetkiniz yok." };
  }

  if (session.status === "LIVE") {
    return { error: "Devam eden bir ders oturumu silinemez. Önce dersi sonlandırın." };
  }

  // Daily.co'dan odayı da sil
  const DAILY_API_KEY = process.env.DAILY_API_KEY;
  if (DAILY_API_KEY) {
    try {
      await fetch(`https://api.daily.co/v1/rooms/${session.roomName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
      });
    } catch {
      // Daily.co hatası olsa bile devam et, DB'den sil
    }
  }

  await prisma.liveSession.delete({ where: { id: sessionId } });

  revalidatePath("/teacher/live");
  return { success: true };
}

