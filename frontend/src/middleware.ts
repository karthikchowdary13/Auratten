import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const userRole = request.cookies.get('userRole')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/'];
    if (publicRoutes.includes(pathname)) {
        if (accessToken) {
            const dest = getDashboardRoute(userRole || '');
            // Prevent infinite redirect loop if role is missing/invalid
            if (dest !== '/login') {
                return NextResponse.redirect(new URL(dest, request.url));
            } else {
                // If invalid role, clear token and render login page
                const response = NextResponse.next();
                response.cookies.delete('accessToken');
                return response;
            }
        }
        return NextResponse.next();
    }

    // Protect all other routes
    if (!accessToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based protection
    if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
        return NextResponse.redirect(new URL(getDashboardRoute(userRole || ''), request.url));
    }
    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER') {
        return NextResponse.redirect(new URL(getDashboardRoute(userRole || ''), request.url));
    }
    if (pathname.startsWith('/parent') && userRole !== 'PARENT') {
        return NextResponse.redirect(new URL(getDashboardRoute(userRole || ''), request.url));
    }
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL(getDashboardRoute(userRole || ''), request.url));
    }
    if (pathname.startsWith('/hr') && userRole !== 'HR') {
        return NextResponse.redirect(new URL(getDashboardRoute(userRole || ''), request.url));
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
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
