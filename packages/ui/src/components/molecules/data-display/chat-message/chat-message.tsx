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
    badgeClassName: "bg-info/10 text-info",
    containerClassName: "bg-info/10 border-info",
    senderClassName: "text-info",
  },
  ACTION: {
    label: "ACTION",
    badgeClassName: "bg-warning/10 text-warning",
    containerClassName: "bg-warning/10 border-warning",
    senderClassName: "text-warning",
  },
  SAY: {
    label: "SAY",
    badgeClassName: "bg-success/10 text-success",
    containerClassName: "bg-success/10 border-success",
    senderClassName: "text-success",
  },
};

const defaultSenderConfig: ChatMessageProps["senderConfig"] = {
  Sistema: {
    containerClassName: "text-center text-muted-foreground text-sm italic",
    isSystem: true,
  },
  Mestre: {
    containerClassName: "bg-info/10 border-l-4 border-info p-4 rounded-r",
    senderClassName: "text-info text-sm font-medium",
  },
  Narrador: {
    containerClassName: "bg-info/10 border-l-4 border-info p-4 rounded-r",
    senderClassName: "text-info text-sm font-medium",
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
      containerClassName: "bg-muted border-l-4 border-warning p-4 rounded-r",
      senderClassName: "text-warning",
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
            message.isSummary ? "bg-accent/40 border-l-4 border-primary" : "",
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
          message.isSummary ? "bg-accent/40 border-l-4 border-primary" : "",
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
                  className="p-1 hover:bg-accent rounded transition-colors"
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
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>
        <div className="text-foreground">{renderContent()}</div>
        {showTimestamp && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
