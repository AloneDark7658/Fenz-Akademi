"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Kullanıcı rolünü günceller.
 * Yalnızca ADMIN yetkisine sahip kullanıcılar çalıştırabilir.
 */
export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Oturum bulunamadı." };
    }

    // İstek yapanın ADMIN olup olmadığını kontrol et
    const adminCheck = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (adminCheck?.role !== "ADMIN") {
      return { success: false, error: "Yetkisiz işlem. Yalnızca yöneticiler rol değiştirebilir." };
    }

    // Kendi rolünü değiştirmesini engelle (İsteğe bağlı, ancak genelde güvenlidir)
    if (userId === user.id) {
      return { success: false, error: "Kendi rolünüzü değiştiremezsiniz." };
    }

    // Rolü güncelle
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // Önbelleği temizle, tablo yenilensin
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    console.error("updateUserRole hatası:", error);
    return { success: false, error: "Rol güncellenirken bir hata oluştu." };
  }
}
