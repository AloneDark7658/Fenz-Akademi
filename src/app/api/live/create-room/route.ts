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
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, name: true },
    });
    if (!dbUser || !["TEACHER", "ADMIN"].includes(dbUser.role)) {
      return NextResponse.json({ error: "Bu işlem için öğretmen yetkisi gerekli." }, { status: 403 });
    }

    const { title, scheduledFor, courseId, groupSize } = await req.json();
    if (!title || !scheduledFor) {
      return NextResponse.json({ error: "Ders başlığı ve tarih zorunludur." }, { status: 400 });
    }

    // Kurs varsa sınıf seviyesini bul
    let gradeLevel: number | null = null;
    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      gradeLevel = course?.gradeLevel || null;
    }

    const expiryTime = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
    const roomProperties = {
      exp: expiryTime,
      enable_chat: false,
      enable_knocking: false,
      enable_screenshare: true,
      enable_video_processing_ui: false,
      start_video_off: false,
      start_audio_off: true,
    };

    // --- GRUPLU MOD ---
    if (groupSize && groupSize > 0 && gradeLevel) {
      // 1. Öğrencileri bul
      const students = await prisma.user.findMany({
        where: { role: "STUDENT", classLevel: gradeLevel },
        select: { id: true }
      });

      if (students.length === 0) {
        return NextResponse.json({ error: "Bu sınıfta hiç öğrenci bulunamadı. Grup oluşturulamıyor." }, { status: 400 });
      }

      // 2. Karıştır ve Böl
      const shuffled = students.sort(() => 0.5 - Math.random());
      const chunks: { id: string }[][] = [];
      for (let i = 0; i < shuffled.length; i += groupSize) {
        chunks.push(shuffled.slice(i, i + groupSize));
      }

      // 3. Ana Oturum (Parent) Oluştur (Daily odası açmıyoruz, sadece db kaydı)
      const parentRoomName = `parent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const parentSession = await prisma.liveSession.create({
        data: {
          title,
          scheduledFor: new Date(scheduledFor),
          roomName: parentRoomName,
          teacherId: user.id,
          courseId: courseId || null,
          gradeLevel,
          status: "SCHEDULED",
        }
      });

      // 4. Alt Grupları Oluştur
      await Promise.all(chunks.map(async (chunk, index) => {
        const roomName = `fenz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const dailyRoom = await dailyFetch("/rooms", {
          method: "POST",
          body: JSON.stringify({
            name: roomName,
            privacy: "private",
            properties: roomProperties,
          }),
        });

        await prisma.liveSession.create({
          data: {
            title: `${title} — Grup ${index + 1}`,
            scheduledFor: new Date(scheduledFor),
            roomName: dailyRoom.name,
            teacherId: user.id,
            courseId: courseId || null,
            gradeLevel,
            groupIndex: index + 1,
            parentSessionId: parentSession.id,
            status: "SCHEDULED",
            members: {
              create: chunk.map(s => ({ studentId: s.id }))
            }
          }
        });
      }));

      return NextResponse.json({ success: true, sessionId: parentSession.id, isGrouped: true, groupCount: chunks.length });
    }

    // --- NORMAL MOD (Grup Yok) ---
    const roomName = `fenz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dailyRoom = await dailyFetch("/rooms", {
      method: "POST",
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: roomProperties,
      }),
    });

    const session = await prisma.liveSession.create({
      data: {
        title,
        scheduledFor: new Date(scheduledFor),
        roomName: dailyRoom.name,
        teacherId: user.id,
        courseId: courseId || null,
        gradeLevel,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({ success: true, sessionId: session.id, roomName: session.roomName, isGrouped: false });

  } catch (error: any) {
    console.error("[API /live/create-room]", error);
    if (error.message?.includes("DAILY_API_KEY")) {
      return NextResponse.json({ error: "Daily.co API anahtarı yapılandırılmamış." }, { status: 503 });
    }
    return NextResponse.json({ error: "Oda oluşturulamadı. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
