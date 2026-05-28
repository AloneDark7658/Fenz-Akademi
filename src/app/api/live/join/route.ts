import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_BASE_URL = "https://api.daily.co/v1";

async function dailyFetch(path: string, options: RequestInit = {}) {
  if (!DAILY_API_KEY) {
    throw new Error("DAILY_API_KEY ortam değişkeni tanımlı değil.");
  }
  const res = await fetch(`${DAILY_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DAILY_API_KEY}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Daily API hatası (${res.status}): ${err}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Kullanıcı oturumu doğrulama
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    // 2. İstek gövdesini ayrıştır
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId zorunludur." }, { status: 400 });
    }

    // 3. Oturumu veritabanında doğrula
    const session = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        roomName: true,
        status: true,
        teacherId: true,
      },
    });
    if (!session) {
      return NextResponse.json({ error: "Ders oturumu bulunamadı." }, { status: 404 });
    }
    if (session.status === "ENDED") {
      return NextResponse.json({ error: "Bu ders oturumu sona ermiştir." }, { status: 410 });
    }

    // 4. Kullanıcı rolünü belirle
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, name: true },
    });
    const isTeacher =
      dbUser?.role === "TEACHER" ||
      dbUser?.role === "ADMIN" ||
      session.teacherId === user.id;

    // 5. Daily.co meeting token üret
    // Token 4 saat geçerli, sadece bu odaya özgü
    const tokenExpiry = Math.floor(Date.now() / 1000) + 4 * 60 * 60;

    const tokenPayload: Record<string, unknown> = {
      properties: {
        room_name: session.roomName,
        exp: tokenExpiry,
        user_name: dbUser?.name || user.email || "Katılımcı",
        user_id: user.id,
        // Öğretmen: tam yetki, öğrenci: katılımcı
        is_owner: isTeacher,
        // Öğrenci başlangıçta sessiz, kamera kapalı değil
        start_audio_off: !isTeacher,
        start_video_off: false,
        // Ekran paylaşımı sadece öğretmene
        enable_screenshare: isTeacher,
      },
    };

    const tokenData = await dailyFetch("/meeting-tokens", {
      method: "POST",
      body: JSON.stringify(tokenPayload),
    });

    // 6. Öğretmense, oturum durumunu LIVE yap
    if (isTeacher && session.status === "SCHEDULED") {
      await prisma.liveSession.update({
        where: { id: sessionId },
        data: { status: "LIVE" },
      });
    }

    return NextResponse.json({
      success: true,
      token: tokenData.token,
      roomName: session.roomName,
      roomUrl: `https://fenzakademi.daily.co/${session.roomName}`,
      isOwner: isTeacher,
      userName: dbUser?.name || user.email,
    });
  } catch (error: any) {
    console.error("[API /live/join]", error);
    if (error.message?.includes("DAILY_API_KEY")) {
      return NextResponse.json(
        { error: "Daily.co API anahtarı yapılandırılmamış." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Derse katılım başarısız. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
