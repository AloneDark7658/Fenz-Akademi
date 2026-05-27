"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 6 haneli rastgele, okunabilir bir kod üretir.
 * 0, O, I, 1 gibi karışabilecek karakterleri filtreler.
 */
function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Öğrenci için davet kodu üretir. Eğer zaten varsa olanı döner.
 */
export async function getOrGenerateInviteCode(): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Oturum bulunamadı" };

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, inviteCode: true }
    });

    if (!dbUser || dbUser.role !== "STUDENT") {
      return { success: false, error: "Sadece öğrenciler davet kodu üretebilir." };
    }

    if (dbUser.inviteCode) {
      return { success: true, code: dbUser.inviteCode };
    }

    // Kod üret ve eşsiz (unique) olduğundan emin olmak için DB'ye yaz.
    // Çok nadir de olsa çakışma ihtimaline karşı do-while veya try-catch kullanılabilir.
    // Burada basit tutuyoruz.
    let code = generateRandomCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const exists = await prisma.user.findUnique({ where: { inviteCode: code } });
      if (!exists) {
        isUnique = true;
      } else {
        code = generateRandomCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return { success: false, error: "Kod üretilemedi, lütfen tekrar deneyin." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { inviteCode: code }
    });

    revalidatePath("/student");
    return { success: true, code: updatedUser.inviteCode! };
  } catch (error) {
    console.error("Invite code error:", error);
    return { success: false, error: "Sunucu hatası oluştu." };
  }
}
