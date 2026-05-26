// ============================================================================
// Fenz Akademi — RBAC Middleware (Rol Tabanlı Erişim Kontrolü)
// ============================================================================
// Supabase Auth JWT token'ından rol bilgisini okur ve rota bazlı
// yetkilendirme uygular. Yetkisiz erişim denemeleri yönlendirilir.
//
// Güvenlik Kuralları:
// 1. /dashboard/student/* → sadece STUDENT rolü
// 2. /dashboard/teacher/* → sadece TEACHER rolü
// 3. /dashboard/parent/*  → sadece PARENT rolü
// 4. /dashboard/admin/*   → sadece ADMIN rolü
// 5. /api/* → geçerli oturum gerektirir (public API'ler hariç)
// 6. Auth sayfaları → oturum açıksa dashboard'a yönlendirilir
// ============================================================================

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ─── Rota Tanımları ─────────────────────────────────────────────────────────

/** Herkesin erişebildiği rotalar (auth gerekmez) */
const PUBLIC_ROUTES = ["/", "/login", "/register", "/api/health"];

/** Auth sayfaları — giriş yapanlar buraya erişmesin */
const AUTH_ROUTES = ["/login", "/register"];

/** Rol bazlı korumalı rota eşlemeleri */
const ROLE_ROUTE_MAP: Record<string, string[]> = {
  "/dashboard/student": ["STUDENT"],
  "/dashboard/teacher": ["TEACHER"],
  "/dashboard/parent": ["PARENT"],
  "/dashboard/admin": ["ADMIN"],
};

/** Rol bazlı varsayılan yönlendirme */
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  STUDENT: "/dashboard/student",
  TEACHER: "/dashboard/teacher",
  PARENT: "/dashboard/parent",
  ADMIN: "/dashboard/admin",
};

// ─── Yardımcı Fonksiyonlar ──────────────────────────────────────────────────

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [routePrefix, roles] of Object.entries(ROLE_ROUTE_MAP)) {
    if (pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)) {
      return roles;
    }
  }
  return null;
}

// ─── Ana Middleware ─────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Supabase oturum token'ını yenile ve kullanıcı bilgisini al
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Public rotalar — herkese açık
  if (isPublicRoute(pathname)) {
    // Auth sayfalarına giriş yapmış kullanıcılar erişmesin
    if (isAuthRoute(pathname) && user) {
      const userRole =
        (user.user_metadata?.role as string) || "STUDENT";
      const dashboardPath =
        ROLE_DASHBOARD_MAP[userRole] || "/dashboard/student";
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. Korumalı rotalar — oturum kontrolü
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Giriş sonrası geri dönüş URL'i
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 4. RBAC — rol bazlı erişim kontrolü
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles) {
    const userRole =
      (user.user_metadata?.role as string) || "STUDENT";

    if (!requiredRoles.includes(userRole)) {
      // Yetkisiz erişim — kullanıcıyı kendi dashboard'una yönlendir
      const dashboardPath =
        ROLE_DASHBOARD_MAP[userRole] || "/dashboard/student";
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }
  }

  // 5. API rotaları — geçerli oturum var, devam et
  return supabaseResponse;
}

// ─── Matcher Konfigürasyonu ─────────────────────────────────────────────────
// Next.js statik dosyaları ve favicon'u middleware'den hariç tut
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
