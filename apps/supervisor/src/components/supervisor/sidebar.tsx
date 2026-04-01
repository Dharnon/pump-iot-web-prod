"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Globe, LogOut, MoonStar } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type SupervisorNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  description?: string;
  isActive?: boolean;
  disabled?: boolean;
};

export type SupervisorLanguageOption = {
  value: string;
  label: string;
};

export type SupervisorSidebarUser = {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  initials?: string;
};

export type SupervisorBrand = {
  name: string;
  href?: string;
  logoSrc?: string;
  iconSrc?: string;
  subtitle?: string;
};

export interface SupervisorSidebarProps
  extends Omit<React.ComponentProps<typeof Sidebar>, "children"> {
  brand?: SupervisorBrand;
  mainItems: SupervisorNavItem[];
  documentItems?: SupervisorNavItem[];
  secondaryItems?: SupervisorNavItem[];
  user?: SupervisorSidebarUser;
  currentPath?: string;
  currentLanguage?: string;
  languageOptions?: SupervisorLanguageOption[];
  themeLabel?: string;
  onLogout?: () => void;
  onToggleTheme?: () => void;
  onLanguageChange?: (value: string) => void;
}

function isItemActive(item: SupervisorNavItem, currentPath?: string) {
  if (item.isActive) return true;
  if (!currentPath) return false;

  const normalizedPath =
    currentPath !== "/" && currentPath.endsWith("/")
      ? currentPath.slice(0, -1)
      : currentPath;
  const normalizedHref =
    item.href !== "/" && item.href.endsWith("/")
      ? item.href.slice(0, -1)
      : item.href;

  if (normalizedHref === "/supervisor") {
    return normalizedPath === normalizedHref;
  }

  return (
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(`${normalizedHref}/`)
  );
}

function getInitials(name: string, fallback = "S") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function NavSection({
  label,
  items,
  currentPath,
}: {
  label: string;
  items: SupervisorNavItem[];
  currentPath?: string;
}) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isItemActive(item, currentPath);
            return (
              <SidebarMenuItem key={item.href}>
                {item.disabled ? (
                  <SidebarMenuButton isActive={active} disabled tooltip={item.title}>
                    <span className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge != null ? (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      ) : null}
                    </span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge != null ? (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                )}
                {item.description ? (
                  <div className="px-2 pt-1 text-xs text-sidebar-foreground/60">
                    {item.description}
                  </div>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function SupervisorSidebar({
  brand = {
    name: "Flowserve",
    href: "/supervisor",
    logoSrc: "/flowserve-logo.png",
    iconSrc: "/flowserve-icon.png",
    subtitle: "Pump IoT Platform",
  },
  mainItems,
  documentItems = [],
  secondaryItems = [],
  user,
  currentPath,
  currentLanguage,
  languageOptions = [],
  themeLabel = "Cambiar tema",
  onLogout,
  onToggleTheme,
  onLanguageChange,
  className,
  ...props
}: SupervisorSidebarProps) {
  const currentLanguageLabel =
    languageOptions.find((option) => option.value === currentLanguage)?.label ??
    currentLanguage;

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className={cn("border-r border-sidebar-border", className)}
      {...props}
    >
      <SidebarHeader className="gap-4 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
              <Link
                href={brand.href ?? "/supervisor"}
                className="flex items-center gap-3"
              >
                {brand.logoSrc ? (
                  <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-sidebar-border/70 bg-sidebar-accent/60">
                    <Image
                      src={brand.logoSrc}
                      alt={brand.name}
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain"
                    />
                  </span>
                ) : brand.iconSrc ? (
                  <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-sidebar-border/70 bg-sidebar-accent/60">
                    <Image
                      src={brand.iconSrc}
                      alt={brand.name}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </span>
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-lg border border-sidebar-border/70 bg-sidebar-accent/60 text-sm font-semibold">
                    F
                  </span>
                )}
                <span className="grid text-left leading-tight">
                  <span className="font-semibold">{brand.name}</span>
                  <span className="text-xs text-sidebar-foreground/60">
                    {brand.subtitle}
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-3 pb-3">
        <NavSection label="Principal" items={mainItems} currentPath={currentPath} />
        {documentItems.length ? (
          <NavSection
            label="Documentos"
            items={documentItems}
            currentPath={currentPath}
          />
        ) : null}
        {secondaryItems.length ? (
          <NavSection
            label="Utilidades"
            items={secondaryItems}
            currentPath={currentPath}
          />
        ) : null}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={user?.name ?? "Usuario"}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                  {user?.initials ?? getInitials(user?.name ?? "Supervisor")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.name ?? "Supervisor"}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {user?.email ?? user?.role ?? "Sesion activa"}
                </span>
              </div>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                    {user?.initials ?? getInitials(user?.name ?? "Supervisor")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.name ?? "Supervisor"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email ?? user?.role ?? "Sesion activa"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {languageOptions.length > 0 ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="mr-2" />
                    <span>
                      Idioma
                      {currentLanguageLabel ? ` (${currentLanguageLabel})` : ""}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {languageOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onSelect={(event) => {
                          event.preventDefault();
                          onLanguageChange?.(option.value);
                        }}
                      >
                        {option.label}
                        {currentLanguage === option.value ? (
                          <Badge
                            variant="secondary"
                            className="ml-auto rounded-full px-2 py-0 text-[10px]"
                          >
                            Activo
                          </Badge>
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : null}
              {onToggleTheme ? (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onToggleTheme();
                  }}
                >
                  <MoonStar className="mr-2" />
                  <span>{themeLabel}</span>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                onLogout?.();
              }}
            >
              <LogOut className="mr-2" />
              <span>Cerrar sesion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
