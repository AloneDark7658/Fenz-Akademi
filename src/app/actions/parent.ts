"use server";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 6 haneli davet kodu ile veli-öğrenci eşleştirmesini yapar.
 */
export async function linkStudentAction(inviteCode: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Oturum bulunamadı." };
    }

    // İstek yapanın PARENT olup olmadığını kontrol et
    const parentCheck = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (parentCheck?.role !== "PARENT" && parentCheck?.role !== "ADMIN") {
      return { success: false, error: "Yalnızca veliler öğrenci eşleştirmesi yapabilir." };
    }

    // Kod ile öğrenciyi bul
    const student = await prisma.user.findUnique({
      where: { inviteCode: inviteCode.toUpperCase().trim() },
      select: { id: true, role: true, parentId: true, name: true }
    });

    if (!student) {
      return { success: false, error: "Geçersiz davet kodu. Lütfen kodu kontrol edin." };
    }

    if (student.role !== "STUDENT") {
      return { success: false, error: "Bu kod bir öğrenciye ait değil." };
    }

    if (student.parentId === user.id) {
      return { success: false, error: "Bu öğrenciyle zaten eşleşmiş durumdasınız." };
    }

    if (student.parentId) {
      return { success: false, error: "Bu öğrenci zaten başka bir veliyle eşleştirilmiş." };
    }

    // Eşleştirmeyi yap
    await prisma.user.update({
      where: { id: student.id },
      data: { parentId: user.id }
    });

    revalidatePath("/parent");
    
    return { success: true, message: `${student.name} başarıyla hesabınıza bağlandı!` };
  } catch (error) {
    console.error("linkStudentAction hatası:", error);
    return { success: false, error: "Sunucu hatası oluştu." };
  }
}
