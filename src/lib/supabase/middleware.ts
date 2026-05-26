// ============================================================================
// Fenz Akademi — Supabase Middleware Client
// ============================================================================
// Next.js middleware'inde kullanılır.
// Request/Response cookie'lerini okur ve yazar.
// Token yenileme (refresh) işlemini middleware seviyesinde yapar.
// ============================================================================

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ÖNEMLI: getUser() çağrısını kaldırmayın!
  // Bu çağrı oturum token'ını yeniler ve cookie'leri günceller.
  // Olmadan auth token'ları expire olduğunda oturum kapanır.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
