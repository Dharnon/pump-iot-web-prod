/**
 * Next.js Middleware - Server-side Auth Check
 * 
 * SOLID: Single Responsibility - Only handles auth redirect logic.
 * Vercel: rendering-hydration-no-flicker - Prevents client-side flash of protected content.
 * 
 * This middleware runs on the Edge Runtime and checks for auth tokens
 * BEFORE the page is rendered, eliminating the "flash of protected content"
 * that occurs with client-side auth checks.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that require authentication.
 * Add new protected routes here.
 */
const PROTECTED_ROUTES = ['/supervisor'];

/**
 * Routes that should redirect to dashboard if already authenticated.
 */
const AUTH_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth token in cookies (preferred) or try to read from a custom header
    // Note: localStorage is not available in middleware, so we rely on cookies
    const token = request.cookies.get('token')?.value;

    // Check if the request is for a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

    // If accessing protected route without token, redirect to login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing auth route with token, redirect to dashboard
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/supervisor', request.url));
    }

    return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on.
 * 
 * We include:
 * - /supervisor/* (protected dashboard routes)
 * - /login (auth page)
 * 
 * We exclude:
 * - Static files (_next/static, images, etc.)
 * - API routes (/api/*)
 * - Public files (favicon, etc.)
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
};
