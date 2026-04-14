import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/settings",
  "/notifications",
  "/complete-profile",
];

// Routes only for guests (redirect to home if logged in)
const GUEST_ONLY_ROUTES = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("cp_access_token")?.value
    || req.headers.get("authorization")?.replace("Bearer ", "");

  // Check localStorage-based auth via cookie (set by client on login)
  const hasSession =
    !!token ||
    !!req.cookies.get("cp_session")?.value;

  // Protect routes
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Guest-only routes
  const isGuestOnly = GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  if (isGuestOnly && hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (svg, png, jpg…)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
