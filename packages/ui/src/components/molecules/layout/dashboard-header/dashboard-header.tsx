/**
 * DashboardHeader - Componente Visual
 *
 * Header com busca, mensagens, notificações e o usuário. Só mostra o que funciona:
 * atalho de busca só se quem usa passar um, menu do perfil só com onProfileClick.
 */

import { Bell, MessageSquare, Search } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import { Button, Input } from "../../../atoms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../atoms/actions/dropdown-menu";

export interface DashboardUser {
  name: string;
  email: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  description?: string;
  unread?: boolean;
}

export interface DashboardHeaderProps {
  /**
   * Valor da busca
   */
  searchValue?: string;

  /**
   * Callback quando a busca muda
   */
  onSearchChange?: (value: string) => void;

  /**
   * Placeholder e nome acessível do campo de busca
   * @default "Buscar"
   */
  searchPlaceholder?: string;

  /**
   * Atalho de teclado mostrado no campo. Só aparece se for passado — mostre apenas um
   * atalho que a sua aplicação realmente implementa.
   */
  searchShortcut?: string;

  /**
   * Informações do usuário
   */
  user?: DashboardUser;

  /**
   * Lista de notificações
   */
  notifications?: Notification[];

  /**
   * Lista de mensagens
   */
  messages?: Notification[];

  /**
   * Callback quando uma notificação é clicada
   */
  onNotificationClick?: (notification: Notification) => void;

  /**
   * Callback quando uma mensagem é clicada
   */
  onMessageClick?: (message: Notification) => void;

  /**
   * Callback do item "Perfil". Sem ele, o usuário aparece como texto, sem menu.
   */
  onProfileClick?: () => void;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

function unreadLabel(name: string, unread: number): string {
  if (unread === 0) return name;
  return `${name}, ${unread} ${unread === 1 ? "não lida" : "não lidas"}`;
}

interface InboxMenuProps {
  name: string;
  icon: React.ReactNode;
  items: Notification[];
  onItemClick?: (item: Notification) => void;
}

function InboxMenu({ name, icon, items, onItemClick }: InboxMenuProps) {
  const unread = items.filter((i) => i.unread).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-11"
          aria-label={unreadLabel(name, unread)}
        >
          {icon}
          {unread > 0 && (
            <span
              className="absolute right-0.5 top-1 min-w-4 rounded-full bg-primary px-1 font-mono text-[11px] leading-4 text-primary-foreground"
              aria-hidden="true"
            >
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="items-start gap-2"
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                item.unread ? "bg-primary" : "bg-transparent"
              )}
              aria-hidden="true"
            />
            <span className="flex flex-col">
              <span className="font-medium">{item.title}</span>
              {item.description && (
                <span className="text-[13px] text-muted-foreground">{item.description}</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserIdentity({ user }: { user: DashboardUser }) {
  return (
    <>
      {user.avatar && (
        <img src={user.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover" />
      )}
      <span className="flex min-w-0 max-w-44 flex-col items-start text-left sm:max-w-none">
        <span className="max-w-full truncate text-sm font-medium leading-tight">{user.name}</span>
        <span className="max-w-full truncate font-mono text-xs text-muted-foreground">
          {user.email}
        </span>
      </span>
    </>
  );
}

function UserArea({ user, onProfileClick }: { user: DashboardUser; onProfileClick?: () => void }) {
  if (!onProfileClick) {
    return (
      <div className="flex items-center gap-2 px-2">
        <UserIdentity user={user} />
      </div>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 py-1.5">
          <UserIdentity user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onProfileClick}>Perfil</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Componente de header do dashboard
 */
export function DashboardHeader({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar",
  searchShortcut,
  user,
  notifications = [],
  messages = [],
  onNotificationClick,
  onMessageClick,
  onProfileClick,
  className,
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-background px-4 py-3 md:px-6",
        className
      )}
    >
      <div className="relative w-full md:max-w-md md:flex-1">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={cn("h-11 pl-9", searchShortcut && "pr-20")}
        />
        {searchShortcut && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
            {searchShortcut}
          </kbd>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        {messages.length > 0 && (
          <InboxMenu
            name="Mensagens"
            icon={<MessageSquare className="size-[18px]" aria-hidden="true" />}
            items={messages}
            onItemClick={onMessageClick}
          />
        )}
        {notifications.length > 0 && (
          <InboxMenu
            name="Notificações"
            icon={<Bell className="size-[18px]" aria-hidden="true" />}
            items={notifications}
            onItemClick={onNotificationClick}
          />
        )}
        {user && <UserArea user={user} onProfileClick={onProfileClick} />}
      </div>
    </header>
  );
}
