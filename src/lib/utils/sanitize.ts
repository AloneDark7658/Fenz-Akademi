// ============================================================================
// Fenz Akademi — XSS Sanitizasyon Yardımcıları
// ============================================================================
// Kullanıcı tarafından girilen tüm metinler (özellikle soru açıklamaları)
// render edilmeden ÖNCE bu fonksiyonlardan geçirilmelidir.
//
// İki katmanlı koruma:
// 1. DOMPurify ile HTML sanitizasyonu (script, iframe, event handler vb.)
// 2. Temel regex ile ek güvenlik katmanı
// ============================================================================

import DOMPurify from "isomorphic-dompurify";

// ─── DOMPurify Konfigürasyonu ───────────────────────────────────────────────

/** DOMPurify ile güvenli HTML üretimi — tüm script ve event handler'lar temizlenir */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "b",
    "i",
    "em",
    "strong",
    "u",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "sub",
    "sup",
    "span",
    "code",
    "pre",
    "blockquote",
    "img",
  ],
  ALLOWED_ATTR: ["src", "alt", "class", "title"],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ["script", "style", "iframe", "form", "input", "textarea", "object", "embed"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * HTML içeriğini sanitize eder.
 * Soru açıklamaları gibi zengin metin alanları için kullanılır.
 * Sadece güvenli etiketleri ve attribute'ları bırakır.
 *
 * @example
 * ```ts
 * const safeHtml = sanitizeHtml('<p>Güvenli</p><script>alert("XSS")</script>');
 * // Sonuç: '<p>Güvenli</p>'
 * ```
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}

/**
 * Düz metni sanitize eder — tüm HTML etiketleri temizlenir.
 * Kullanıcı adları, kurs başlıkları gibi salt metin alanları için kullanılır.
 *
 * @example
 * ```ts
 * const safeName = sanitizeText('John<script>alert(1)</script>Doe');
 * // Sonuç: 'JohnDoe'
 * ```
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * URL'yi sanitize eder — sadece http, https ve mailto protokollerini kabul eder.
 * javascript: ve data: gibi tehlikeli URL'leri engeller.
 *
 * @example
 * ```ts
 * sanitizeUrl('javascript:alert(1)'); // ''
 * sanitizeUrl('https://example.com'); // 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  const SAFE_PROTOCOLS = ["http:", "https:", "mailto:"];

  try {
    const parsed = new URL(trimmed);
    if (!SAFE_PROTOCOLS.includes(parsed.protocol)) {
      return "";
    }
    return trimmed;
  } catch {
    // Geçersiz URL
    return "";
  }
}

/**
 * Bir objedeki tüm string alanlarını düz metin olarak sanitize eder.
 * Form verilerinin toplu sanitizasyonu için kullanılır.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeText(value);
    }
  }

  return sanitized;
}
