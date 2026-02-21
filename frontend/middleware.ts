import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

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
const guestOnlyRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookie (set by useAuth hook on login/register)
  const token = request.cookies.get('token')?.value;

  let isAuthenticated = !!token;
  let userRole: string | null = null;

  // Try reading Zustand persisted auth-storage cookie for role info
  const authStorage = request.cookies.get('auth-storage')?.value;
  if (authStorage) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authStorage));
      if (parsed?.state?.token) {
        isAuthenticated = true;
        userRole = parsed?.state?.user?.role || null;
      }
    } catch (_e) {
      // ignore parse errors
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isGuestRoute = guestOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Unauthenticated → redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated non-admin → redirect away from admin routes
  if (isAdminRoute && isAuthenticated && userRole && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Authenticated → redirect away from guest-only routes
  if (isGuestRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|logo|.*\\..*|_next).*)',
  ],
};
