import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_BASE_URL = "https://api.daily.co/v1";

// Daily.co REST API yardımcı fonksiyonu
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
    // 1. Oturum doğrulama
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    // 2. Rol kontrolü — sadece TEACHER veya ADMIN oda oluşturabilir
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, name: true },
    });
    if (!dbUser || !["TEACHER", "ADMIN"].includes(dbUser.role)) {
      return NextResponse.json(
        { error: "Bu işlem için öğretmen yetkisi gerekli." },
        { status: 403 }
      );
    }

    // 3. İstek gövdesini ayrıştır
    const { title, scheduledFor, courseId } = await req.json();
    if (!title || !scheduledFor) {
      return NextResponse.json(
        { error: "Ders başlığı ve tarih zorunludur." },
        { status: 400 }
      );
    }

    // 4. Daily.co'da oda oluştur
    // exp: 8 saat sonra otomatik sona erer
    const expiryTime = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
    // Benzersiz oda adı: fenz-{timestamp}-{random}
    const roomName = `fenz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const dailyRoom = await dailyFetch("/rooms", {
      method: "POST",
      body: JSON.stringify({
        name: roomName,
        privacy: "private", // Token olmadan girilemez
        properties: {
          exp: expiryTime,
          max_participants: 150,
          enable_chat: false,       // Kendi UI'mızda yönetiyoruz
          enable_knocking: false,
          enable_screenshare: true,
          // Ekran paylaşımı: metin okunabilirliği için optimize
          screenshare_content_hint: "text",
          enable_video_processing_ui: false,
          start_video_off: false,
          start_audio_off: true, // Öğrenciler başlangıçta sessiz
        },
      }),
    });

    // 5. Prisma'ya LiveSession kaydı yaz
    const session = await prisma.liveSession.create({
      data: {
        title,
        scheduledFor: new Date(scheduledFor),
        roomName: dailyRoom.name,
        teacherId: user.id,
        courseId: courseId || null,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      roomName: session.roomName,
    });
  } catch (error: any) {
    console.error("[API /live/create-room]", error);
    if (error.message?.includes("DAILY_API_KEY")) {
      return NextResponse.json(
        { error: "Daily.co API anahtarı yapılandırılmamış. Lütfen yöneticiye başvurun." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Oda oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
