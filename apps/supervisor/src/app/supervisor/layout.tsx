"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { logout, validateToken } from "@/lib/api";
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

    return () => {
      cancelled = true;
    };
  }, [checkingSession, router]);

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
    </SidebarProvider>
  );
}
