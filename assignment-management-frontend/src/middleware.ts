// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/forgot-password', '/'];
const roleRoutes: Record<string, string[]> = {
  Admin: ['/admin'],
  Teacher: ['/teacher'],
  Student: ['/student'],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/'))) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  if (userRole) {
    const allowedPaths = roleRoutes[userRole] || [];
    const hasAccess = allowedPaths.some((prefix) => pathname.startsWith(prefix));

    if (!hasAccess && !pathname.startsWith('/dashboard')) {
      const dashboardUrl = new URL(`/${userRole.toLowerCase()}`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};