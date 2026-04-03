import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    const { pathname } = request.nextUrl;

    // ✅ Bypass middleware for auth and branding assets
    if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/auratten-logos')) {
        return NextResponse.next();
    }

    // Public routes
    const publicRoutes = ['/', '/login', '/register'];

    if (publicRoutes.includes(pathname)) {
        if (accessToken) {
            const dest = getDashboardRoute(userRole || '');

            // ✅ FIX: Prevent redirect loop
            if (pathname !== dest && dest !== '/login') {
                return NextResponse.redirect(new URL(dest, request.url));
            }

            // If invalid role → clear token
            if (dest === '/login') {
                const response = NextResponse.next();
                response.cookies.delete('accessToken');
                return response;
            }
        }
        return NextResponse.next();
    }

    // 🔒 Protect routes
    if (!accessToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ✅ Role-based protection (loop-safe)
    const dest = getDashboardRoute(userRole || '');

    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
        if (pathname !== dest) {
            return NextResponse.redirect(new URL(dest, request.url));
        }
    }

    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
        if (pathname !== dest) {
            return NextResponse.redirect(new URL(dest, request.url));
        }
    }

    if (pathname.startsWith('/parent') && userRole !== 'PARENT') {
        if (pathname !== dest) {
            return NextResponse.redirect(new URL(dest, request.url));
        }
    }

    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
        if (pathname !== dest) {
            return NextResponse.redirect(new URL(dest, request.url));
        }
    }

    if (pathname.startsWith('/hr') && userRole !== 'HR') {
        if (pathname !== dest) {
            return NextResponse.redirect(new URL(dest, request.url));
        }
    }

    return NextResponse.next();
}

function getDashboardRoute(role: string) {
    switch (role) {
        case 'STUDENT': return '/student/dashboard';
        case 'TEACHER': return '/teacher/dashboard';
        case 'PARENT': return '/parent/dashboard';
        case 'ADMIN': return '/admin/dashboard';
        case 'HR': return '/hr/dashboard';
        default: return '/login';
    }
}

export const config = {
    matcher: [
        '/((?!api|_next|auratten-logos|favicon.ico|sw.js|manifest.json).*)',
    ],
};