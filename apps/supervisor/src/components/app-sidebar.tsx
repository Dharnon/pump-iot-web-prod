"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  BotIcon,
  FrameIcon,
  LifeBuoyIcon,
  MapIcon,
  PieChartIcon,
  SendIcon,
  Settings2Icon,
  TerminalIcon,
  TerminalSquareIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
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
          title: "Playground",
          url: "/supervisor",
          icon: <TerminalSquareIcon />,
          isActive: currentPath === "/supervisor",
          items: [
            {
              title: "Overview",
              url: "/supervisor",
              isActive: currentPath === "/supervisor",
            },
          ],
        },
        {
          title: "Models",
          url: "/supervisor/programacion",
          icon: <BotIcon />,
          isActive: isActivePath("/supervisor/programacion"),
          items: [
            {
              title: "Protocols",
              url: "/supervisor/programacion",
              isActive: isActivePath("/supervisor/programacion"),
            },
            {
              title: "Operator",
              url: "/operator/",
              isActive: currentPath?.startsWith("/operator") || false,
            },
          ],
        },
        {
          title: "Documentation",
          url: "/supervisor/user-management",
          icon: <BookOpenIcon />,
          isActive: isActivePath("/supervisor/user-management"),
          items: [
            {
              title: "Users",
              url: "/supervisor/user-management",
              isActive: isActivePath("/supervisor/user-management"),
            },
          ],
        },
        {
          title: "Settings",
          url: "/supervisor",
          icon: <Settings2Icon />,
          items: [
            {
              title: "Dashboard",
              url: "/supervisor",
              isActive: currentPath === "/supervisor",
            },
            {
              title: "Protocols",
              url: "/supervisor/programacion",
              isActive: isActivePath("/supervisor/programacion"),
            },
            {
              title: "Users",
              url: "/supervisor/user-management",
              isActive: isActivePath("/supervisor/user-management"),
            },
          ],
        },
      ],
      navSecondary: [
        {
          title: "Support",
          url: "/operator/",
          icon: <LifeBuoyIcon />,
        },
        {
          title: "Feedback",
          url: "/supervisor",
          icon: <SendIcon />,
        },
      ],
      projects: [
        {
          name: "Design Engineering",
          url: "/supervisor",
          icon: <FrameIcon />,
        },
        {
          name: "Sales & Marketing",
          url: "/supervisor/programacion",
          icon: <PieChartIcon />,
        },
        {
          name: "Travel",
          url: "/supervisor/user-management",
          icon: <MapIcon />,
        },
      ],
    }),
    [currentPath, isActivePath, user],
  );

  return (
    <Sidebar variant="inset" {...props}>
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
        <NavProjects projects={data.projects} />
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
