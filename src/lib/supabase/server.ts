// ============================================================================
// Fenz Akademi — Supabase Server Client
// ============================================================================
// Server Components, Route Handlers ve Server Actions içinde kullanılır.
// Cookie'leri Next.js'in cookies() API'si üzerinden yönetir.
// ============================================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component'lerde set çağrısı yapılamaz,
            // bu durumda sessizce geçiyoruz.
            // Middleware veya Route Handler'da çalıştığında set başarılı olur.
          }
        },
      },
    }
  );
}

/**
 * Admin işlemleri için Service Role Key kullanan client.
 * SADECE server-side'da, RLS'yi bypass etmesi gereken durumlarda kullanılır.
 * Örneğin: kullanıcı oluşturma, admin paneli işlemleri.
 */
export async function createSupabaseAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component'lerde set çağrısı yapılamaz
          }
        },
      },
    }
  );
}
