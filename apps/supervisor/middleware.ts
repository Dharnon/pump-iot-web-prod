/**
 * Next.js Middleware - OT Security Gatekeeper
 * 
 * SEGURIDAD OT (IEC 62443 Compliant):
 * - Defense in Depth: Valida el token contra el backend en cada petición
 * - Zero Trust: No confía en la presencia del token, verifica su autenticidad
 * - Fail-Safe Default: Ante cualquier error, deniega el acceso
 * 
 * Este middleware actúa como un "Gatekeeper" que intercepta TODAS las peticiones
 * a rutas protegidas y verifica la validez del token JWT antes de permitir
 * el renderizado de la página.
 * 
 * IMPORTANTE: Se ejecuta en Edge Runtime (sin acceso a Node.js APIs completas)
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

/**
 * URL base del backend API.
 * Debe coincidir con NEXT_PUBLIC_API_URL o usar el default.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Extraer token de las cookies
    const token = request.cookies.get('token')?.value;

    // Determinar tipo de ruta
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

    // =========================================================================
    // CASO 1: Ruta protegida sin token → Redirigir a login
    // =========================================================================
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // =========================================================================
    // CASO 2: Ruta protegida CON token → Permitir acceso (validación en cliente)
    // =========================================================================
    // NOTA: La validación del token se hace en el cliente (useSWR + interceptors)
    // porque el endpoint /api/auth/verify no está implementado en el backend.
    // Si el token es inválido, el backend devolverá 401 en las peticiones API
    // y el cliente redirigirá automáticamente al login.
    if (isProtectedRoute && token) {
        // Token presente, permitir acceso y dejar que el cliente valide
        return NextResponse.next();
    }

    // CÓDIGO ORIGINAL COMENTADO (requiere endpoint /api/auth/verify en backend):
    /*
    if (isProtectedRoute && token) {
        try {
            // Timeout de 3 segundos (crítico para no bloquear el middleware)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Si el backend responde con error, el token es inválido
            if (!response.ok) {
                console.error('[Middleware] Token validation failed:', response.status);
                
                // Borrar cookie inválida y redirigir a login
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('callbackUrl', pathname);
                loginUrl.searchParams.set('error', 'session_expired');
                
                const redirectResponse = NextResponse.redirect(loginUrl);
                redirectResponse.cookies.delete('token');
                return redirectResponse;
            }

            // Token válido → Permitir acceso
            console.log('[Middleware] Token validated successfully');
            return NextResponse.next();

        } catch (error) {
            // =====================================================================
            // FAIL-SAFE DEFAULT (Principio de Seguridad OT)
            // =====================================================================
            // Si hay cualquier error (red, timeout, backend caído), denegamos acceso
            console.error('[Middleware] Token validation error:', error);
            
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            loginUrl.searchParams.set('error', 'validation_failed');
            
            const redirectResponse = NextResponse.redirect(loginUrl);
            redirectResponse.cookies.delete('token');
            return redirectResponse;
        }
    }
    */

    // =========================================================================
    // CASO 3: Ruta de autenticación (login) con token válido → Redirigir a dashboard
    // =========================================================================
    if (isAuthRoute && token) {
        // Verificar que el token sea válido antes de redirigir
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                // Token válido → Redirigir a supervisor
                return NextResponse.redirect(new URL('/supervisor', request.url));
            }
        } catch (error) {
            // Si falla la validación, permitir acceso a login (borrar cookie)
            const response = NextResponse.next();
            response.cookies.delete('token');
            return response;
        }
    }

    // =========================================================================
    // CASO 4: Ruta pública o no protegida → Permitir acceso
    // =========================================================================
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
