"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

<<<<<<< HEAD
import { logout, validateToken } from "@/lib/api";
=======
// Iconos (Lucide React)
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  LogOut,
  CheckCircle2,
  Users,
  ChevronsUpDown,
  Globe,
  Check,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

// (Image de Next.js - no usado actualmente, usando <img> por flexibilidad)
import Image from "next/image";

// Componentes UI
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829
import { useLanguage } from "@/lib/language-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

type StoredUser = {
  username: string;
  role: string;
  email?: string;
};

type SessionState = {
  user: StoredUser | null;
  checkingSession: boolean;
};

function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser) as StoredUser;

    if (!parsedUser?.username) {
      localStorage.removeItem("user");
      return null;
    }

    return parsedUser;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function getInitialSessionState(): SessionState {
  return {
    user: null,
    checkingSession: true,
  };
}

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [{ user, checkingSession }, setSessionState] =
    useState<SessionState>(getInitialSessionState);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", storedTheme !== "light");
  }, []);

  useEffect(() => {
    if (!checkingSession) {
      return;
    }

    let cancelled = false;

    async function syncSession() {
      const token = readCookie("token");
      const useMock =
        readCookie("use_mock_data") === "true" ||
        localStorage.getItem("USE_MOCK_DATA") === "true";
      const storedUser = readStoredUser();

      if (!token) {
        setSessionState({ user: null, checkingSession: false });
        router.replace("/login");
        return;
      }

      if (useMock) {
        const mockUser = storedUser ?? {
          username: "mock_admin",
          role: "admin",
        };

        localStorage.setItem("user", JSON.stringify(mockUser));
        setSessionState({ user: mockUser, checkingSession: false });
        return;
      }

      try {
        const response = await validateToken(token);

        if (!response.valid || !response.user) {
          throw new Error("Invalid session");
        }

        if (cancelled) {
          return;
        }

        const nextUser: StoredUser = {
          username: response.user.username,
          role: response.user.role,
          email: storedUser?.email,
        };

        localStorage.setItem("user", JSON.stringify(nextUser));
        setSessionState({ user: nextUser, checkingSession: false });
      } catch {
        if (cancelled) {
          return;
        }

        logout();
        setSessionState({ user: null, checkingSession: false });
        router.replace("/login?error=validation_failed");
      }
    }

    void syncSession();

<<<<<<< HEAD
    return () => {
      cancelled = true;
    };
  }, [checkingSession, router]);
=======
  // Items del menú traducidos
  const menuItems = [
    {
      title: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      href: "/supervisor",
    },
    {
      title: "Programación",
      icon: FileSpreadsheet,
      href: "/supervisor/programacion",
    },
    { title: "Usuarios", icon: Users, href: "/supervisor/user-management" },
    {
      title: "Configuración",
      icon: Settings,
      href: "/supervisor/configuracion",
    },
  ];
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleToggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  };

  if (!mounted || (!user && checkingSession)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Validando sesion...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
<<<<<<< HEAD
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3.5rem",
        } as CSSProperties
      }
    >
      <AppSidebar
        currentPath={pathname}
        user={{
          name: user.username,
          email: user.email ?? user.role,
          initials: user.username.slice(0, 2).toUpperCase(),
        }}
        currentLanguage={language}
        languageOptions={[
          { value: "es", label: "Espanol" },
          { value: "en", label: "English" },
        ]}
        onLanguageChange={(value) => {
          if (value === "es" || value === "en") {
            setLanguage(value);
          }
        }}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
      />
      <SidebarInset className="min-h-0 overflow-hidden">{children}</SidebarInset>
=======
    // SidebarProvider: Provee context para estado del sidebar (open/collapsed)
    <SidebarProvider
      defaultOpen={false}
      style={{ "--sidebar-width": "200px" } as React.CSSProperties}
    >
      {/* Container principal: flex horizontal, altura completa */}
      <div className="h-screen flex w-full overflow-hidden">
        {/* ============================================================
                    SIDEBAR
                    ============================================================
                    collapsible="icon": Puede colapsar a solo iconos
                    El sidebar usa data-attributes para estilos condicionales:
                */}
        <Sidebar collapsible="icon" className="border-r shrink-0">
          <SidebarHeader className="h-16 flex items-center px-2 shrink-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  asChild
                  className="hover:bg-transparent active:bg-transparent"
                >
                  <Link
                    href="/supervisor"
                    className="relative flex items-center w-full"
                  >
                    {/* Icon Container - FIXED POSITION */}
                    <div className="flex items-center justify-center w-8 h-8 shrink-0">
                      <img
                        src="/flowserve-icon.png"
                        alt="Flowserve Icon"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    {/* Text - Absolutely positioned relative to the container to avoid shifting the icon */}
                    <span className="absolute left-11 text-xl font-black tracking-tight text-[#E11D48] transition-all duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none truncate">
                      FLOWSERVE
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="w-full justify-start overflow-hidden"
                    tooltip={item.title}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-4 h-4 shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="truncate transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* --------------------------------------------------------
                        FOOTER: Branding + Info de usuario
                        -------------------------------------------------------- */}
          <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
            {/* Branding "Powered by HEXA Ingenieros" */}
            <div className="flex flex-row items-end gap-2 opacity-60 hover:opacity-100 transition-opacity select-none group mb-4 w-full pl-1 group-data-[collapsible=icon]:hidden">
              <span
                className="text-[16px] text-muted-foreground font-normal mb-1.5"
                style={{ fontFamily: "var(--font-dancing-script), cursive" }}
              >
                {t("sidebar.powered")}
              </span>
              <div className="flex flex-col items-start leading-none">
                <span
                  className="text-3xl font-bold tracking-widest text-foreground"
                  style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
                >
                  HEXA
                </span>
                <span className="text-[9px] text-primary font-semibold uppercase tracking-[0.2em] -mt-1 ml-0.5 group-hover:text-primary/80 transition-colors">
                  Ingenieros
                </span>
              </div>
            </div>

            <Separator className="mb-4 group-data-[collapsible=icon]:mb-2" />

            {/* User Menu Dropdown */}
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground overflow-hidden"
                      tooltip={user.username}
                    >
                      <div className="flex items-center justify-center h-8 w-8 shrink-0">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                        <span className="truncate font-semibold">
                          {user.username}
                        </span>
                        <span className="truncate text-xs">{user.role}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden shrink-0" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user.username}
                          </span>
                          <span className="truncate text-xs">
                            {user.email || user.role}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Language Submenu */}
                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Globe className="mr-2 h-4 w-4" />
                          <span>
                            Idioma ({language === "es" ? "Español" : "English"})
                          </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setLanguage("en")}>
                            English
                            {language === "en" && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLanguage("es")}>
                            Español
                            {language === "es" && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>

                    {/* Theme Toggle */}
                    <DropdownMenuItem
                      onClick={() => {
                        const isDark =
                          document.documentElement.classList.contains("dark");
                        document.documentElement.classList.toggle(
                          "dark",
                          !isDark,
                        );
                        localStorage.setItem(
                          "theme",
                          !isDark ? "dark" : "light",
                        );
                      }}
                    >
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>Cambiar tema</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("sidebar.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
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
>>>>>>> 95093510d90cbd30f3ba0adce0532518ef8ea829
    </SidebarProvider>
  );
}
