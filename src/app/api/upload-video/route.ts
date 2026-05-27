import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    // Yalnızca öğretmen/admin yükleme yapabilir
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (dbUser?.role !== "TEACHER" && dbUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const body = await req.json();
    const { title } = body;

    const API_KEY = process.env.BUNNY_API_KEY;
    const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

    // Eğer .env değerleri girilmemişse, prototip modunda (mock) çalış
    if (!API_KEY || API_KEY === "my-api-key" || !LIBRARY_ID) {
      return NextResponse.json({
        success: true,
        videoId: `mock-bunny-id-${Date.now()}`,
        uploadUrl: `https://video.bunnycdn.com/library/mock/videos/mock-id`,
        token: "mock-direct-upload-token-12345",
        isMock: true,
      });
    }

    // Bunny.net üzerinde boş bir "Video Object" oluştur
    const response = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
      method: "POST",
      headers: {
        "AccessKey": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ title: title || "Fenz Akademi Ders Videosu" }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Bunny API Error:", errText);
      return NextResponse.json({ error: "Video oluşturulamadı" }, { status: 500 });
    }

    const data = await response.json();

    // Frontend, bu videoId ve dönen pre-signed (veya proxy) URL ile doğrudan yükleme yapacak
    return NextResponse.json({
      success: true,
      videoId: data.guid,
      // Gerçek senaryoda bu uploadUrl TUS protokolü veya güvenli proxy rotası olur:
      uploadUrl: `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${data.guid}`,
      token: "secure-upload-token", // TUS signature veya proxy token
      isMock: false,
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
