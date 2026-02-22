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

// Routes only for guests (redirect authenticated users to dashboard)
const guestOnlyRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token and role cookies set by useAuth hook on login/register
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isAuthenticated = !!token;
  const isAdmin = userRole === 'admin';

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isGuestRoute = guestOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Not logged in → redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but not admin → block admin routes, redirect to dashboard
  if (isAdminRoute && isAuthenticated && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Already logged in → redirect away from guest-only pages
  if (isGuestRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo|.*\\..*).*)',
  ],
};
