"use server";

import { prisma } from "@/lib/prisma";

export type BadgeType = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

// ─── Varsayılan Rozetleri Oluştur (Seed) ──────────────────────────────────────

async function ensureBadgesSeeded() {
  const count = await prisma.badge.count();
  if (count > 0) return;

  await prisma.badge.createMany({
    data: [
      {
        name: "İlk Yüz Başarısı",
        description: "Bir testten %100 tam puan aldın!",
        icon: "🎯",
        requirementType: "QUIZ_SCORE",
        requirementValue: 100,
      },
      {
        name: "3 Günlük Seri",
        description: "3 gün üst üste çalışarak harika bir seri yakaladın!",
        icon: "🔥",
        requirementType: "STREAK",
        requirementValue: 3,
      },
      {
        name: "10 Günlük Seri",
        description: "Disiplin senin göbek adın! 10 günlük seri.",
        icon: "⚡",
        requirementType: "STREAK",
        requirementValue: 10,
      },
      {
        name: "Acemi Çırak",
        description: "Toplamda 1000 XP kazandın. Yolun başındasın!",
        icon: "🌱",
        requirementType: "TOTAL_XP",
        requirementValue: 1000,
      },
      {
        name: "Uzman Öğrenci",
        description: "Toplamda 5000 XP kazandın. Harikasın!",
        icon: "🏆",
        requirementType: "TOTAL_XP",
        requirementValue: 5000,
      },
    ],
  });
}

// ─── Rozet Kontrol Mantığı ────────────────────────────────────────────────────

/**
 * Öğrencinin mevcut durumunu kontrol edip, hak ettiği yeni rozetleri verir.
 * Bu fonksiyon, quiz çözüldüğünde veya puan/streak değiştiğinde çağrılmalıdır.
 */
export async function checkAndAwardBadges(userId: string): Promise<BadgeType[]> {
  await ensureBadgesSeeded();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      points: true,
      streak: true,
      quizResults: {
        select: { score: true },
      },
      userBadges: {
        select: { badgeId: true },
      },
    },
  });

  if (!user) return [];

  // Sistemdeki tüm rozetleri çek
  const allBadges = await prisma.badge.findMany();
  
  // Kullanıcının sahip olduğu rozet ID'leri
  const ownedBadgeIds = new Set(user.userBadges.map((ub) => ub.badgeId));

  const newBadges: BadgeType[] = [];
  const hasPerfectScore = user.quizResults.some((qr) => qr.score >= 100);

  // Her rozet için şartı kontrol et
  for (const badge of allBadges) {
    if (ownedBadgeIds.has(badge.id)) continue; // Zaten sahip

    let earned = false;

    switch (badge.requirementType) {
      case "QUIZ_SCORE":
        if (badge.requirementValue === 100 && hasPerfectScore) {
          earned = true;
        }
        // Farklı skor değerleri için de eklenebilir
        break;
      case "STREAK":
        if (user.streak >= badge.requirementValue) {
          earned = true;
        }
        break;
      case "TOTAL_XP":
        if (user.points >= badge.requirementValue) {
          earned = true;
        }
        break;
    }

    // Rozeti hak ettiyse DB'ye yaz
    if (earned) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });
      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      });
    }
  }

  return newBadges;
}
