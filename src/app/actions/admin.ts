"use server";

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { type Role } from "@/types";


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

/**
 * Yeni kullanıcı oluşturur (Admin paneli üzerinden).
 */
export async function adminCreateUser(data: {
  name: string;
  email: string;
  password?: string;
  role: Role;
  classLevel?: number;
  parentId?: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Oturum bulunamadı." };

    const adminCheck = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (adminCheck?.role !== "ADMIN") {
      return { success: false, error: "Yetkisiz işlem." };
    }

    const adminClient = await createSupabaseAdminClient();
    
    // Rastgele şifre veya belirtilen şifre
    const password = data.password || Math.random().toString(36).slice(-8) + "Aa1!";

    // Supabase Auth'a ekle
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: password,
      email_confirm: true, // E-posta onayı beklemeden giriş yapabilsinler
      user_metadata: {
        name: data.name,
        role: data.role,
        class_level: data.classLevel || null,
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Kullanıcı oluşturulamadı." };
    }

    // Prisma'ya ekle
    try {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          passwordHash: "[managed-by-supabase]",
          role: data.role,
          classLevel: data.classLevel || null,
          parentId: data.parentId || null,
        }
      });
    } catch (dbError) {
      // Prisma hatası varsa Supabase'den geri sil
      await adminClient.auth.admin.deleteUser(authData.user.id);
      console.error("Prisma create error, user deleted from Auth:", dbError);
      return { success: false, error: "Veritabanına kaydedilirken hata oluştu." };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("adminCreateUser hatası:", error);
    return { success: false, error: "Kullanıcı oluşturulurken beklenmeyen bir hata oluştu." };
  }
}

/**
 * Öğrencinin velisini günceller.
 */
export async function adminAssignParent(studentId: string, parentId: string | null) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Oturum bulunamadı." };

    const adminCheck = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (adminCheck?.role !== "ADMIN") {
      return { success: false, error: "Yetkisiz işlem." };
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { parentId: parentId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("adminAssignParent hatası:", error);
    return { success: false, error: "Veli atanırken bir hata oluştu." };
  }
}
