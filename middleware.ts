import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/reset-password",
  "/403",
  "/api/setup",
  "/api/exchange-rates",
  "/api/cities",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const supabaseAuthToken =
    request.cookies.get("sb-a4c25270-bb57-4bcc-bc65-7605e1c573ca-auth-token")
      ?.value ||
    request.cookies.get("supabase-auth-token")?.value ||
    findSupabaseAuthCookie(request);

  if (
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next") &&
    !supabaseAuthToken
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function findSupabaseAuthCookie(request: NextRequest): string | undefined {
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  const match = cookieNames.find(
    (name) => name.includes("auth-token") || name.includes("supabase")
  );
  return match ? request.cookies.get(match)?.value : undefined;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
