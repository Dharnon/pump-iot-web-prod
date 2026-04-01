"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  Globe,
  LogOut,
  MoonStar,
  Settings2,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type LanguageOption = {
  value: string;
  label: string;
};

export function NavUser({
  user,
  currentLanguage,
  languageOptions,
  onLanguageChange,
  onToggleTheme,
  onLogout,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  currentLanguage?: string;
  languageOptions?: LanguageOption[];
  onLanguageChange?: (value: string) => void;
  onToggleTheme?: () => void;
  onLogout?: () => void;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                <AvatarFallback className="rounded-lg">
                  {user.initials ?? "FS"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                  <AvatarFallback className="rounded-lg">
                    {user.initials ?? "FS"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <BadgeCheck />
                Cuenta
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CreditCard />
                Supervisor
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings2 />
                Preferencias
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {languageOptions?.length ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe />
                    Idioma
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
                        <BadgeCheck />
                        <span>
                          {option.label}
                          {currentLanguage === option.value ? " (activo)" : ""}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : null}
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  onToggleTheme?.();
                }}
              >
                <MoonStar />
                Cambiar tema
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onLogout?.();
              }}
            >
              <LogOut />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
