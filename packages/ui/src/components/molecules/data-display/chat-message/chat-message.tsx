/**
 * ChatMessage Component - Flowtomic UI
 *
 * Componente genérico de mensagem de chat com suporte a markdown,
 * tipos de mensagem customizáveis, badges e context menu
 */

import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Badge, Button } from "../../../atoms";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../atoms/actions/context-menu";

export interface ChatMessageData {
  id: string | number;
  content: string;
  sender: string;
  timestamp: Date | string;
  messageType?: string;
  isSummary?: boolean;
}

export interface ChatMessageProps extends HTMLAttributes<HTMLDivElement> {
  message: ChatMessageData;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onViewContext?: (id: string | number) => void;
  renderMarkdown?: boolean;
  messageTypeConfig?: Record<
    string,
    {
      label: string;
      badgeClassName?: string;
      containerClassName?: string;
      senderClassName?: string;
    }
  >;
  senderConfig?: Record<
    string,
    {
      containerClassName?: string;
      senderClassName?: string;
      isSystem?: boolean;
    }
  >;
  formatTimestamp?: (timestamp: Date | string) => string;
  showActions?: boolean;
  showTimestamp?: boolean;
}

const defaultMessageTypeConfig: ChatMessageProps["messageTypeConfig"] = {
  STORY: {
    label: "STORY",
    badgeClassName: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    containerClassName: "bg-blue-100 dark:bg-blue-900/30 border-blue-500",
    senderClassName: "text-blue-700 dark:text-blue-300",
  },
  ACTION: {
    label: "ACTION",
    badgeClassName: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    containerClassName: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500",
    senderClassName: "text-yellow-700 dark:text-yellow-400",
  },
  SAY: {
    label: "SAY",
    badgeClassName: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    containerClassName: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500",
    senderClassName: "text-emerald-700 dark:text-emerald-400",
  },
};

const defaultSenderConfig: ChatMessageProps["senderConfig"] = {
  Sistema: {
    containerClassName: "text-center text-gray-500 dark:text-gray-400 text-sm italic",
    isSystem: true,
  },
  Mestre: {
    containerClassName: "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r",
    senderClassName: "text-blue-700 dark:text-blue-300 text-sm font-medium",
  },
  Narrador: {
    containerClassName: "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r",
    senderClassName: "text-blue-700 dark:text-blue-300 text-sm font-medium",
  },
};

const defaultFormatTimestamp = (timestamp: Date | string): string => {
  return new Date(timestamp).toLocaleString("pt-BR");
};

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      message,
      onEdit,
      onDelete,
      onViewContext,
      renderMarkdown = true,
      messageTypeConfig = defaultMessageTypeConfig,
      senderConfig = defaultSenderConfig,
      formatTimestamp = defaultFormatTimestamp,
      showActions = true,
      showTimestamp = true,
      className,
      ...props
    },
    ref
  ) => {
    const typeConfig = message.messageType ? messageTypeConfig[message.messageType] : undefined;

    const senderCfg = senderConfig[message.sender] || {
      containerClassName:
        "bg-gray-100 dark:bg-gray-800/50 border-l-4 border-yellow-500 p-4 rounded-r",
      senderClassName: "text-yellow-600 dark:text-yellow-400",
    };

    const isSystem = senderCfg.isSystem || message.sender === "Sistema";

    const hasActions = showActions && (onEdit || onDelete || onViewContext);

    const renderTypeBadge = (): ReactNode => {
      if (!message.messageType || !typeConfig) return null;

      return (
        <Badge className={cn("text-[10px] font-medium ml-2", typeConfig.badgeClassName)}>
          {typeConfig.label}
        </Badge>
      );
    };

    const renderContent = (): ReactNode => {
      if (renderMarkdown) {
        return (
          <ReactMarkdown
            components={{
              strong: ({ ...props }) => (
                <strong
                  className={cn(
                    "font-bold",
                    typeConfig?.senderClassName || senderCfg.senderClassName
                  )}
                  {...props}
                />
              ),
              em: ({ ...props }) => <em className="italic" {...props} />,
              p: ({ ...props }) => <span {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        );
      }

      return <span>{message.content}</span>;
    };

    // System message (centered, italic)
    if (isSystem) {
      return (
        <div
          ref={ref}
          id={`message-${message.id}`}
          className={cn(
            message.isSummary ? "bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500" : "",
            senderCfg.containerClassName,
            className
          )}
          {...props}
        >
          {renderContent()}
          {showTimestamp && (
            <div className="mt-1 text-[10px]">{formatTimestamp(message.timestamp)}</div>
          )}
        </div>
      );
    }

    // Regular message with actions
    return (
      <div
        ref={ref}
        id={`message-${message.id}`}
        className={cn(
          message.isSummary ? "bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500" : "",
          typeConfig?.containerClassName || senderCfg.containerClassName,
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-1">
          <div
            className={cn(
              "text-sm font-medium flex items-center gap-2",
              typeConfig?.senderClassName || senderCfg.senderClassName
            )}
          >
            <span>{message.sender}</span>
            {renderTypeBadge()}
          </div>
          {hasActions && (
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded transition-colors"
                  title="Opções da mensagem"
                >
                  <MoreVertical className="w-3 h-4" />
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {onEdit && (
                  <ContextMenuItem onClick={() => onEdit(message.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </ContextMenuItem>
                )}
                {onViewContext && (
                  <ContextMenuItem onClick={() => onViewContext(message.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Contexto
                  </ContextMenuItem>
                )}
                {onDelete && (
                  <ContextMenuItem
                    onClick={() => onDelete(message.id)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>
        <div className="text-gray-900 dark:text-gray-200">{renderContent()}</div>
        {showTimestamp && (
          <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
