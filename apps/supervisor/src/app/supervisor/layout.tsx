/**
 * =============================================================================
 * SUPERVISOR LAYOUT - Pump IoT Platform
 * =============================================================================
 * 
 * @fileoverview Layout principal del área autenticada con sidebar Notion-style.
 * 
 * RESPONSABILIDADES:
 * 1. Verificar autenticación (redirect a /login si no hay sesión)
 * 2. Renderizar sidebar colapsable con navegación
 * 3. Proveer toggle de dark/light mode
 * 4. Mostrar información del usuario + botón de logout
 * 
 * ESTRUCTURA:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ SidebarProvider                                             │
 * │ ┌─────────┬───────────────────────────────────────────────┐ │
 * │ │ Sidebar │                    Main                       │ │
 * │ │         │                  (children)                   │ │
 * │ │ - Logo  │                                               │ │
 * │ │ - Menu  │                                               │ │
 * │ │ - User  │                                               │ │
 * │ └─────────┴───────────────────────────────────────────────┘ │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * @route /supervisor/*
 * @security Requiere autenticación (token en localStorage)
 */

"use client";

// =============================================================================
// IMPORTS
// =============================================================================

// Componentes del Sidebar (Shadcn - personalizado)
import {
    SidebarProvider,      // Context provider para estado del sidebar
    Sidebar,              // Container principal del sidebar
    SidebarContent,       // Área de contenido scrollable
    SidebarHeader,        // Header con logo
    SidebarMenu,          // Container de items del menú
    SidebarMenuItem,      // Cada item del menú
    SidebarMenuButton,    // Botón interactivo del item
    SidebarFooter,        // Footer con info de usuario
    SidebarTrigger,       // Botón para toggle (no usado aquí)
    SidebarRail           // Barra delgada para resize/toggle
} from "@/components/ui/sidebar";

// Next.js - Navegación
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// React
import { useEffect, useState } from "react";

// Iconos (Lucide React)
import { LayoutDashboard, FileSpreadsheet, FileText, LogOut, CheckCircle2 } from "lucide-react";

// (Image de Next.js - no usado actualmente, usando <img> por flexibilidad)
import Image from "next/image";

// Componentes UI
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/lib/language-context";

// =============================================================================
// CONFIGURACIÓN DEL MENÚ
// =============================================================================

/**
 * Items del menú de navegación.
 * 
 * Cada item tiene:
 * - title: Texto a mostrar
 * - icon: Componente de icono de Lucide
 * - href: Ruta de destino
 * 
 * Para añadir nuevas secciones, agregar aquí y crear la página correspondiente.
 */
// (Moved inside component for translation)

// =============================================================================
// COMPONENTE LAYOUT
// =============================================================================

/**
 * Layout del área de Supervisor.
 * 
 * Este es un Next.js Layout - envuelve todas las páginas bajo /supervisor/*.
 * Los children son el contenido de la página actual.
 * 
 * FLUJO DE AUTH:
 * 1. useEffect verifica si hay usuario en localStorage
 * 2. Si no hay → redirect a /login
 * 3. Si hay → parsea y setea en estado → renderiza layout
 * 
 * @param children - Contenido de la página (ej: DashboardPage)
 */
export default function SupervisorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // =========================================================================
    // HOOKS
    // =========================================================================

    /** Ruta actual - para marcar item del menú como activo */
    const pathname = usePathname();

    /** Router para navegación programática (logout, redirect) */
    const router = useRouter();

    /** Usuario autenticado (null hasta que se cargue de localStorage) */
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);

    // =========================================================================
    // AUTH CHECK
    // =========================================================================

    /**
     * Verificación de autenticación al montar el componente.
     * 
     * Si no hay usuario en localStorage, redirige a login.
     * Esto es una verificación client-side (la real debería ser server-side).
     */
    useEffect(() => {
        // Intentar obtener usuario de localStorage
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            // No hay sesión → redirect a login
            router.push("/login");
            return;
        }

        // Parsear y guardar en estado
        setUser(JSON.parse(storedUser));
    }, [router]);

    // Hook de idioma
    const { t } = useLanguage();

    // Items del menú traducidos
    const menuItems = [
        { title: t("sidebar.dashboard"), icon: LayoutDashboard, href: "/supervisor" },
        { title: t("sidebar.csv"), icon: FileSpreadsheet, href: "/supervisor/csv-list" },
        { title: t("sidebar.pdf"), icon: FileText, href: "/supervisor/pdf-extractor" },
    ];

    // =========================================================================
    // HANDLERS
    // =========================================================================

    /**
     * Cierra la sesión del usuario.
     * 
     * Limpia localStorage y redirige a login.
     */
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    // =========================================================================
    // RENDER GUARD
    // =========================================================================

    // Mientras se verifica la autenticación, no renderizar nada
    // Esto evita flash de contenido antes del redirect
    if (!user) return null;

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        // SidebarProvider: Provee context para estado del sidebar (open/collapsed)
        <SidebarProvider>
            {/* Container principal: flex horizontal, altura completa */}
            <div className="h-screen flex w-full overflow-hidden">

                {/* ============================================================
                    SIDEBAR
                    ============================================================
                    collapsible="icon": Puede colapsar a solo iconos
                    El sidebar usa data-attributes para estilos condicionales:
                    - group-data-[collapsible=icon]:... → estilos cuando está colapsado
                */}
                <Sidebar collapsible="icon" className="border-r shrink-0">

                    {/* --------------------------------------------------------
                        HEADER: Logo
                        -------------------------------------------------------- */}
                    <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
                        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
                            {/* Logo completo (visible cuando sidebar expandido) */}
                            <div className="relative w-full flex justify-center group-data-[collapsible=icon]:hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/flowserve-logo.png"
                                    alt="Flowserve Logo"
                                    className="w-50 h-18 object-cover object-center"
                                />
                            </div>

                            {/* Icono pequeño (visible cuando sidebar colapsado) */}
                            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full pt-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/flowserve-icon.png"
                                    alt="Flowserve Icon"
                                    className="w-8 h-8 object-contain"
                                />
                            </div>
                        </div>
                    </SidebarHeader>

                    {/* --------------------------------------------------------
                        CONTENT: Menú de navegación
                        -------------------------------------------------------- */}
                    <SidebarContent className="px-2">
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        // isActive marca visualmente el item si es la ruta actual
                                        isActive={pathname === item.href}
                                        className="w-full justify-start"
                                    >
                                        <Link href={item.href} className="flex items-center gap-3">
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>

                    {/* --------------------------------------------------------
                        FOOTER: Branding + Info de usuario
                        -------------------------------------------------------- */}
                    <SidebarFooter className="p-4">
                        {/* Branding "Powered by HEXA Ingenieros" */}
                        <div className="flex flex-row items-end gap-2 opacity-60 hover:opacity-100 transition-opacity select-none group mb-4 w-full pl-1 group-data-[collapsible=icon]:hidden">
                            <span
                                className="text-[16px] text-muted-foreground font-normal mb-1.5"
                                style={{ fontFamily: 'var(--font-dancing-script), cursive' }}
                            >
                                {t("sidebar.powered")}
                            </span>
                            <div className="flex flex-col items-start leading-none">
                                <span
                                    className="text-3xl font-bold tracking-widest text-foreground"
                                    style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
                                >
                                    HEXA
                                </span>
                                <span className="text-[9px] text-primary font-semibold uppercase tracking-[0.2em] -mt-1 ml-0.5 group-hover:text-primary/80 transition-colors">
                                    Ingenieros
                                </span>
                            </div>
                        </div>

                        <Separator className="mb-4 group-data-[collapsible=icon]:mb-2" />

                        {/* Información del usuario + acciones */}
                        <div className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
                            {/* Avatar con inicial del usuario */}
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Nombre y rol (oculto cuando colapsado) */}
                            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                                <p className="text-sm font-medium truncate">{user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.role}</p>
                            </div>

                            {/* Language Selector */}
                            <LanguageSelector />

                            {/* Toggle de tema dark/light */}
                            <ThemeToggle />

                            {/* Botón de logout */}
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 rounded-md transition-colors"
                                title={t("sidebar.logout")}
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </SidebarFooter>

                    {/* Rail: Barra delgada para toggle del sidebar */}
                    <SidebarRail />
                </Sidebar>

                {/* ============================================================
                    MAIN CONTENT
                    ============================================================
                    Área donde se renderizan las páginas (children).
                    flex-1: Ocupa todo el espacio restante.
                    min-h-0 min-w-0: Previene overflow issues con flex.
                */}
                <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
