// ============================================================================
// Fenz Akademi — Genel Yardımcı Fonksiyonlar
// ============================================================================
// Not: cn() fonksiyonu Shadcn UI tarafından src/lib/utils.ts'de sağlanır.
// ============================================================================

/**
 * API yanıtı için standart format oluşturur.
 * Tüm Route Handler'lar bu formatı kullanmalıdır.
 */
export function apiResponse<T>(data: T, status: number = 200) {
  return Response.json(
    {
      success: status >= 200 && status < 300,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * API hata yanıtı için standart format.
 */
export function apiError(message: string, status: number = 400) {
  return Response.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Zod doğrulama hatalarını okunabilir mesaja dönüştürür.
 */
export function formatZodErrors(
  errors: { path: PropertyKey[]; message: string }[]
): string {
  return errors
    .map((e) => `${e.path.map(String).join(".")}: ${e.message}`)
    .join(", ");
}
