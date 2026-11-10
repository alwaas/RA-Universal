import { NextResponse, type NextRequest } from "next/server";
import { verifyJwtSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Next.js Edge Middleware for Route-Level Authentication & Authorization Guards.
 * Protects administrative dashboards and customer account areas before page render.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 1. Guard Admin Portal Pages (/admin/*)
  if (pathname.startsWith("/admin")) {
    // Permit unauthenticated access to the admin login page
    if (pathname === "/admin/login") {
      if (sessionCookie) {
        const session = await verifyJwtSession(sessionCookie);
        if (session && session.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return NextResponse.next();
    }

    // Block unauthenticated visitors from all other /admin routes
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyJwtSession(sessionCookie);

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "expired");
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. Guard Customer Account Pages (/account/profile/*, /account/orders/*)
  if (
    pathname.startsWith("/account/profile") ||
    pathname.startsWith("/account/orders")
  ) {
    if (!sessionCookie) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyJwtSession(sessionCookie);

    if (!session) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("error", "expired");
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Guest-Only Route Guards (/account/login, /account/signup)
  if (pathname === "/account/login" || pathname === "/account/signup") {
    if (sessionCookie) {
      const session = await verifyJwtSession(sessionCookie);
      if (session) {
        return NextResponse.redirect(new URL("/account/profile", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/profile/:path*",
    "/account/orders/:path*",
    "/account/login",
    "/account/signup",
  ],
};
