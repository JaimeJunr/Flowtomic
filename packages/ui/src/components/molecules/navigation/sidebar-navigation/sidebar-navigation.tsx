/**
 * SidebarNavigation - Componente Visual
 *
 * Menu lateral completo com logo, seções de navegação e card de download mobile
 */

import { CheckCircle2, Download, LogOut, Settings } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, Separator } from "../../../atoms";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../atoms/layout";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface MobileAppCard {
  title: string;
  description?: string;
  buttonText?: string;
  onDownload?: () => void;
}

export interface SidebarNavigationProps {
  /**
   * Logo do aplicativo
   */
  logo?: React.ReactNode;

  /**
   * Título do aplicativo
   * @default "Flowtomic"
   */
  appName?: string;

  /**
   * Itens do menu principal
   */
  menuItems?: NavigationItem[];

  /**
   * Itens do menu geral (Settings, Help, Logout)
   */
  generalItems?: NavigationItem[];

  /**
   * Card de download mobile
   */
  mobileAppCard?: MobileAppCard;

  /**
   * Callback quando um item é clicado
   */
  onNavigate?: (item: NavigationItem) => void;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Componente de navegação lateral
 */
export function SidebarNavigation({
  logo,
  appName = "Flowtomic",
  menuItems = [],
  generalItems = [],
  mobileAppCard,
  onNavigate,
  className,
}: SidebarNavigationProps) {
  const defaultMenuItems: NavigationItem[] =
    menuItems.length > 0
      ? menuItems
      : [
          { id: "dashboard", label: "Dashboard", active: true },
          { id: "tasks", label: "Tasks" },
          { id: "calendar", label: "Calendar" },
          { id: "analytics", label: "Analytics" },
          { id: "team", label: "Team" },
        ];

  const defaultGeneralItems: NavigationItem[] =
    generalItems.length > 0
      ? generalItems
      : [
          { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
          { id: "help", label: "Help" },
          { id: "logout", label: "Logout", icon: <LogOut className="h-4 w-4" /> },
        ];

  const handleItemClick = (item: NavigationItem) => {
    onNavigate?.(item);
    item.onClick?.();
  };

  return (
    <Sidebar className={cn("border-r", className)}>
      <SidebarContent>
        {/* Logo/Header */}
        <div className="flex items-center gap-2 px-4 py-6">
          {logo || (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{appName}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {defaultMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item)}
                    isActive={item.active}
                    asChild={!!item.href}
                  >
                    {item.href ? (
                      <a href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <>
                        {item.icon}
                        <span>{item.label}</span>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Menu Geral */}
        <SidebarGroup>
          <SidebarGroupLabel>GENERAL</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {defaultGeneralItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item)}
                    isActive={item.active}
                    asChild={!!item.href}
                  >
                    {item.href ? (
                      <a href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <>
                        {item.icon}
                        <span>{item.label}</span>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Card de Download Mobile */}
        {mobileAppCard && (
          <>
            <Separator className="mt-auto" />
            <div className="p-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">{mobileAppCard.title}</div>
                    {mobileAppCard.description && (
                      <div className="text-xs opacity-90">{mobileAppCard.description}</div>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-3"
                      onClick={mobileAppCard.onDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {mobileAppCard.buttonText || "Download our Mobile App"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
