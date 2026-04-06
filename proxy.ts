import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_CONFIG } from './lib/config';

/**
 * Proxy untuk proteksi route yang memerlukan authentication
 * (Next.js 16 uses proxy.ts instead of middleware.ts)
 */

// Routes yang memerlukan authentication
const protectedRoutes = ['/dashboard', '/files', '/shared', '/settings'];

// Routes yang hanya bisa diakses ketika TIDAK login (redirect jika sudah login)
const authRoutes = ['/login', '/register'];

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Check for auto-login parameters
  const aoSemesta = searchParams.get('ao-semesta');
  const nip = searchParams.get('nip');
  const key = searchParams.get('key');
  const VALID_AUTO_LOGIN_KEY = '049976129942';
  const isAutoLoginRequest = aoSemesta === 'true' && nip && key === VALID_AUTO_LOGIN_KEY;
  
  // Check if user has session cookie
  const sessionCookie = request.cookies.get(SESSION_CONFIG.COOKIE_NAME);
  const isAuthenticated = !!sessionCookie?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is auth route (login/register)
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Special handling for auto-login: clear session if user is authenticated
  // This prevents race condition between proxy redirect and Server Action
  if (isAutoLoginRequest && pathname.startsWith('/login')) {
    if (isAuthenticated) {
      // Clear the existing session to allow fresh auto-login
      const response = NextResponse.next();
      response.cookies.delete(SESSION_CONFIG.COOKIE_NAME);
      return response;
    }
    // Allow auto-login to proceed even on auth route
    return NextResponse.next();
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth route while authenticated
  // (but not for auto-login, which is handled above)
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.png (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.png|.*\\..*$).*)',
  ],
};
