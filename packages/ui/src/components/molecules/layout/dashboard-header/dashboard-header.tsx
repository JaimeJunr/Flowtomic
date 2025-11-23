/**
 * DashboardHeader - Componente Visual
 *
 * Header com busca, notificações e perfil do usuário
 */

import { Bell, MessageSquare, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Input } from "../../../atoms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
   * Placeholder do campo de busca
   * @default "Search task"
   */
  searchPlaceholder?: string;

  /**
   * Atalho de teclado para busca
   * @default "⌘F"
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
   * Callback quando o perfil é clicado
   */
  onProfileClick?: () => void;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Obtém iniciais do nome
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Componente de header do dashboard
 */
export function DashboardHeader({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search task",
  searchShortcut = "⌘F",
  user,
  notifications = [],
  messages = [],
  onNotificationClick,
  onMessageClick,
  onProfileClick,
  className,
}: DashboardHeaderProps) {
  const unreadNotifications = notifications.filter((n) => n.unread).length;
  const unreadMessages = messages.filter((m) => m.unread).length;

  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 border-b bg-background px-6 py-4",
        className
      )}
    >
      {/* Busca */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9 pr-20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {searchShortcut}
        </div>
      </div>

      {/* Ações do Header */}
      <div className="flex items-center gap-2">
        {/* Mensagens */}
        {messages.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {messages.map((message) => (
                <DropdownMenuItem
                  key={message.id}
                  onClick={() => onMessageClick?.(message)}
                  className={cn(message.unread && "bg-accent")}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{message.title}</div>
                    {message.description && (
                      <div className="text-xs text-muted-foreground">{message.description}</div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Notificações */}
        {notifications.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => onNotificationClick?.(notification)}
                  className={cn(notification.unread && "bg-accent")}
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{notification.title}</div>
                    {notification.description && (
                      <div className="text-xs text-muted-foreground">
                        {notification.description}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Perfil do Usuário */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.avatar ? <User className="h-4 w-4" /> : getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProfileClick}>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
