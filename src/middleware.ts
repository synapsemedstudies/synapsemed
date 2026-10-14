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

  if (demoRole === "admin") {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (demoRole === "student") {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Update Supabase session
  const { response, user } = await updateSession(request);

  // If public route like /login, handle authenticated redirects
  if (pathname === "/login") {
    if (user) {
      const role = user.user_metadata?.role || "student";
      const redirectUrl = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return response;
  }

  // If user is accessing protected routes: /admin or /dashboard
  const isProtectedAdmin = pathname.startsWith("/admin");
  const isProtectedStudent = pathname.startsWith("/dashboard");

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
