"use client";

import * as React from "react";
import Link from "next/link";
import {
  ClipboardListIcon,
  CogIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  MonitorSmartphoneIcon,
  SendIcon,
  TerminalIcon,
  UsersIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type LanguageOption = {
  value: string;
  label: string;
};

type SidebarUser = {
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
};

export function AppSidebar({
  currentPath,
  user,
  currentLanguage,
  languageOptions,
  onLanguageChange,
  onToggleTheme,
  onLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  currentPath?: string;
  user: SidebarUser;
  currentLanguage?: string;
  languageOptions?: LanguageOption[];
  onLanguageChange?: (value: string) => void;
  onToggleTheme?: () => void;
  onLogout?: () => void;
}) {
  const isActivePath = React.useCallback(
    (href: string) =>
      currentPath === href || currentPath?.startsWith(`${href}/`) || false,
    [currentPath],
  );

  const data = React.useMemo(
    () => ({
      user,
      navMain: [
        {
          title: "Inicio",
          url: "/supervisor",
          icon: <LayoutDashboardIcon />,
          isActive:
            currentPath === "/supervisor" ||
            isActivePath("/supervisor/test") ||
            isActivePath("/supervisor/protocolo"),
        },
        {
          title: "Programacion",
          url: "/supervisor/programacion",
          icon: <ClipboardListIcon />,
          isActive:
            isActivePath("/supervisor/programacion") ||
            isActivePath("/supervisor/3d"),
        },
        {
          title: "Usuarios",
          url: "/supervisor/user-management",
          icon: <UsersIcon />,
          isActive: isActivePath("/supervisor/user-management"),
        },
        {
          title: "Configuracion",
          url: "/supervisor/configuracion",
          icon: <CogIcon />,
          isActive: isActivePath("/supervisor/configuracion"),
        },
      ],
      navSecondary: [
        {
          title: "Operator",
          url: "/operator",
          icon: <MonitorSmartphoneIcon />,
        },
        {
          title: "Soporte",
          url: "/supervisor/configuracion",
          icon: <LifeBuoyIcon />,
        },
        {
          title: "Resumen",
          url: "/supervisor",
          icon: <SendIcon />,
        },
      ],
    }),
    [currentPath, isActivePath, user],
  );

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/supervisor" prefetch={false}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Flowserve</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={data.user}
          currentLanguage={currentLanguage}
          languageOptions={languageOptions}
          onLanguageChange={onLanguageChange}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
