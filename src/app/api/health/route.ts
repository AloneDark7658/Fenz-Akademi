// ============================================================================
// Fenz Akademi — Health Check API
// ============================================================================
// GET /api/health → Sistem sağlık kontrolü (public, auth gerektirmez)
// ============================================================================

import { prisma } from "@/lib/prisma";
import { apiResponse, apiError } from "@/lib/utils/helpers";

export async function GET() {
  try {
    // Veritabanı bağlantısını kontrol et
    await prisma.$queryRaw`SELECT 1`;

    return apiResponse({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  } catch (error) {
    console.error("[API] Health check failed:", error);
    return apiError("Veritabanı bağlantısı kurulamadı", 503);
  }
}
