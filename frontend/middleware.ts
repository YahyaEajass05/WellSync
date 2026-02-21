import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/predictions',
  '/analytics',
  '/profile',
  '/settings',
  '/notifications',
  '/admin',
];

// Routes that require admin role
const adminRoutes = ['/admin'];

// Routes accessible only to guests (redirect to dashboard if logged in)
const guestOnlyRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or Authorization header
  // Next.js middleware cannot access localStorage, so we use a cookie
  const token =
    request.cookies.get('token')?.value ||
    request.cookies.get('auth-token')?.value;

  // Also check the Zustand persist storage cookie if set
  let isAuthenticated = !!token;
  let userRole: string | null = null;

  // Try reading auth-storage cookie (set by Zustand persist)
  const authStorage = request.cookies.get('auth-storage')?.value;
  if (!isAuthenticated && authStorage) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authStorage));
      if (parsed?.state?.token) {
        isAuthenticated = true;
        userRole = parsed?.state?.user?.role || null;
      }
    } catch {
      // ignore parse errors
    }
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is admin-only
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if the route is guest-only
  const isGuestRoute = guestOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admin users away from admin routes
  if (isAdminRoute && isAuthenticated && userRole && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect authenticated users away from guest-only routes
  if (isGuestRoute && isAuthenticated) {
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
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo|.*\\..*|_next).*)',
  ],
};
