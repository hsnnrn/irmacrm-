import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware only handles static-level concerns.
// Auth protection is handled client-side by AuthGuard (Supabase uses localStorage, not cookies).
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
