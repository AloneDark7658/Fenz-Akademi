// ============================================================================
// Fenz Akademi — Supabase Browser Client
// ============================================================================
// Client Component'lerde (use client) kullanılır.
// Tarayıcıda çalışır, cookie'leri otomatik yönetir.
// ============================================================================

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
