import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static and internal Next.js assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Check demo_role cookie first (for fast local dev & browser preview)
  const demoRole = request.cookies.get("demo_role")?.value;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (demoRole === "admin") {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (demoRole === "student") {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const isProtectedAdmin = pathname.startsWith("/admin");
  const isProtectedStudent = pathname.startsWith("/dashboard");

  // Fast-check: Does request have an active Supabase session cookie?
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.value);

  // Fast-path 1: Unauthenticated request to protected route -> instant redirect, 0ms latency
  if ((isProtectedAdmin || isProtectedStudent) && !hasSupabaseCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Fast-path 2: Public route (e.g. landing page "/") without session cookie -> instant response, 0ms latency
  if (!isAuthRoute && !isProtectedAdmin && !isProtectedStudent && !hasSupabaseCookie) {
    return NextResponse.next();
  }

  // 3. Update Supabase session only when session cookies actually exist
  const { response, user } = await updateSession(request);

  // If public auth routes like /login or /signup, handle authenticated redirects
  if (isAuthRoute) {
    if (user) {
      const role = user.user_metadata?.role || "student";
      const redirectUrl = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return response;
  }

  // If user is accessing protected routes: /admin or /dashboard
  if (isProtectedAdmin || isProtectedStudent) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (user.user_metadata?.role as string) || "student";

    if (isProtectedAdmin && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isProtectedStudent && role !== "student") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
