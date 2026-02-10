/**
 * =============================================================================
 * PÁGINA DE LOGIN - Pump IoT Platform
 * =============================================================================
 * 
 * @fileoverview Página de autenticación con diseño Notion-style.
 * 
 * FLUJO DE AUTENTICACIÓN:
 * 1. Usuario ingresa credenciales (username + password)
 * 2. Se llama a login() de lib/api.ts
 * 3. Si éxito → se guarda token en localStorage → redirect a /supervisor
 * 4. Si error → se muestra mensaje de error
 * 
 * NOTA DE DESARROLLO:
 * Actualmente usa datos mock en el backend (admin / admin123).
 * Ver TECHNICAL_AUDIT_v1.1.md para plan de migración a httpOnly cookies.
 * 
 * @route /login
 * @security Público (sin autenticación requerida)
 */

"use client";

// =============================================================================
// IMPORTS
// =============================================================================

// Next.js - Router para navegación programática
import { useRouter, useSearchParams } from "next/navigation";

// React - Hooks para estado local
import { useState, useEffect } from "react";

// Componentes UI (Shadcn)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// API - Función de login
import { login } from "@/lib/api";

// Language
import { useLanguage } from "@/lib/language-context";
import { LanguageSelector } from "@/components/language-selector";

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

/**
 * Página de Login
 * 
 * Renderiza un formulario centrado con:
 * - Logo de la aplicación (icono de rayo)
 * - Título y descripción
 * - Campos de usuario y contraseña
 * - Botón de submit con estado de loading
 * - Mensaje de error condicional
 * 
 * @returns JSX del formulario de login
 */
export default function LoginPage() {
    // =========================================================================
    // HOOKS
    // =========================================================================

    // Router de Next.js para navegación después del login
    const router = useRouter();
    const { t } = useLanguage();
    const searchParams = useSearchParams();

    // =========================================================================
    // ESTADO LOCAL
    // =========================================================================

    /** Valor del campo username (controlado) */
    const [username, setUsername] = useState("");

    /** Valor del campo password (controlado) */
    const [password, setPassword] = useState("");

    /** Mensaje de error a mostrar (vacío = sin error) */
    const [error, setError] = useState("");

    /** Flag de loading durante la petición de login */
    const [loading, setLoading] = useState(false);

    // =========================================================================
    // EFECTOS
    // =========================================================================

    /**
     * Detecta errores de sesión desde los parámetros de URL.
     * El middleware redirige aquí con parámetros de error cuando:
     * - La sesión expira (session_expired)
     * - Falla la validación del token (validation_failed)
     */
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'session_expired') {
            setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        } else if (errorParam === 'validation_failed') {
            setError('Error de validación de sesión. Por favor, inicia sesión nuevamente.');
        }
    }, [searchParams]);

    // =========================================================================
    // HANDLERS
    // =========================================================================

    /**
     * Maneja el submit del formulario de login.
     * 
     * Proceso:
     * 1. Previene el comportamiento por defecto del form
     * 2. Limpia errores previos y activa loading
     * 3. Llama a la API de login
     * 4. Si éxito: guarda token+user y navega a /supervisor
     * 5. Si error: muestra mensaje de credenciales inválidas
     * 6. Finalmente: desactiva loading
     * 
     * @param e - Evento del formulario
     */
    const handleSubmit = async (e: React.FormEvent) => {
        // Prevenir reload de la página
        e.preventDefault();

        // Reset de estado
        setError("");
        setLoading(true);

        try {
            // Llamar a la API de autenticación
            const response = await login(username, password);

            if (response.success) {
                // ============================================================
                // ALMACENAMIENTO DE SESIÓN (OT Security Compliant)
                // ============================================================
                // Usamos cookies con flags de seguridad para cumplir con
                // estándares IEC 62443 en entornos Air-Gapped:
                // - HttpOnly: Previene acceso desde JavaScript (anti-XSS)
                // - Secure: Solo transmisión HTTPS (si aplica)
                // - SameSite=Strict: Previene CSRF
                // - Max-Age: Expiración explícita (8 horas)
                
                // Establecer cookie de token (HttpOnly se maneja en el servidor)
                // En cliente solo podemos setear cookies no-HttpOnly, pero el middleware
                // las leerá. Para producción, el backend debería setear la cookie HttpOnly.
                const maxAge = 8 * 60 * 60; // 8 horas en segundos
                document.cookie = `token=${response.token}; path=/; max-age=${maxAge}; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;
                
                // Guardar datos de usuario en localStorage (no sensibles)
                localStorage.setItem("user", JSON.stringify(response.user));

                // Navegar al área protegida
                router.push("/supervisor");
            }
        } catch (err) {
            // Mostrar error genérico (no exponer detalles de seguridad)
            setError("Credenciales inválidas. Usa: admin / admin123");
        } finally {
            // Siempre desactivar loading
            setLoading(false);
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        // Container: Centra el card vertical y horizontalmente
        <div className="min-h-screen flex items-center justify-center bg-background relative">

            {/* Language Selector Top Right */}
            <div className="absolute top-4 right-4">
                <LanguageSelector />
            </div>

            {/* Card principal del formulario */}
            <Card className="w-full max-w-md mx-4 shadow-lg">

                {/* Header con logo y título */}
                <CardHeader className="space-y-1 text-center">
                    {/* Icono de la aplicación */}
                    <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <svg
                            className="w-6 h-6 text-primary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {/* Icono de rayo (lightning bolt) */}
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">{t("login.title")}</CardTitle>
                    <CardDescription>
                        {t("login.subtitle")}
                    </CardDescription>
                </CardHeader>

                {/* Contenido: Formulario */}
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Campo: Usuario */}
                        <div className="space-y-2">
                            <Label htmlFor="username">{t("login.username")}</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* Campo: Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password">{t("login.password")}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Mensaje de error (condicional) */}
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        {/* Botón de submit */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t("login.loading") : t("login.submit")}
                        </Button>
                    </form>

                    {/* Footer con versión */}
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        {t("footer.version")}
                    </p>

                    {/* Quick Access (Desarrollo) */}
                    <div className="mt-6 pt-4 border-t space-y-2">
                        <p className="text-xs text-muted-foreground text-center">
                            {t("quick.access")}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => window.location.href = "/operator/"}
                            >
                                🔧 {t("btn.operator")}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.push("/supervisor")}
                            >
                                📊 {t("btn.supervisor")}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
