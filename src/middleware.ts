import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/otp', '/profile-setup'];
const AUTH_PATHS = ['/home', '/updates', '/campusmart', '/lazzypeeps', '/profile', '/search', '/post', '/society', '/user'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cp_access_token')?.value
    || request.headers.get('x-access-token');

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Redirect authenticated users away from auth pages
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
