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
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../atoms";

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

// O tipo vira um ponto de cor ao lado do rótulo: `badgeClassName` pinta o ponto, e a
// mensagem não ganha caixa colorida em volta (DESIGN.md: cor só onde significa algo)
const defaultMessageTypeConfig: ChatMessageProps["messageTypeConfig"] = {
  STORY: { label: "Narração", badgeClassName: "bg-info" },
  ACTION: { label: "Ação", badgeClassName: "bg-warning" },
  SAY: { label: "Fala", badgeClassName: "bg-success" },
};

const defaultSenderConfig: ChatMessageProps["senderConfig"] = {
  Sistema: { isSystem: true },
};

const TIMESTAMP = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const defaultFormatTimestamp = (timestamp: Date | string): string => {
  return TIMESTAMP.format(new Date(timestamp));
};

interface MessageActionsProps {
  id: string | number;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onViewContext?: (id: string | number) => void;
}

function MessageActions({ id, onEdit, onDelete, onViewContext }: MessageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mais opções"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(id)}>
            <Edit className="mr-2 size-4 text-muted-foreground" aria-hidden="true" />
            Editar
          </DropdownMenuItem>
        )}
        {onViewContext && (
          <DropdownMenuItem onClick={() => onViewContext(id)}>
            <Eye className="mr-2 size-4 text-muted-foreground" aria-hidden="true" />
            Ver contexto
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            {(onEdit || onViewContext) && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => onDelete(id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" aria-hidden="true" />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
    const senderCfg = senderConfig[message.sender] ?? {};
    const isSystem = senderCfg.isSystem || message.sender === "Sistema";
    const hasActions = showActions && (onEdit || onDelete || onViewContext);

    const renderContent = (): ReactNode => {
      if (!renderMarkdown) return <span>{message.content}</span>;
      return (
        <ReactMarkdown
          components={{
            strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
            em: ({ ...props }) => <em className="italic" {...props} />,
            p: ({ ...props }) => <span {...props} />,
          }}
        >
          {message.content}
        </ReactMarkdown>
      );
    };

    const timestamp = showTimestamp && (
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        {formatTimestamp(message.timestamp)}
      </span>
    );

    if (isSystem) {
      return (
        <div
          ref={ref}
          id={`message-${message.id}`}
          className={cn(
            "flex items-baseline gap-2.5 py-3.5 text-[13px] text-muted-foreground",
            message.isSummary && "rounded-md bg-surface px-3",
            senderCfg.containerClassName,
            className
          )}
          {...props}
        >
          <span>{message.sender}</span>
          <span className="text-foreground">{renderContent()}</span>
          {timestamp}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        id={`message-${message.id}`}
        className={cn(
          "flex flex-col gap-1 border-b border-border py-3.5",
          message.isSummary && "rounded-md bg-surface px-3",
          typeConfig?.containerClassName ?? senderCfg.containerClassName,
          className
        )}
        {...props}
      >
        <div className="flex min-h-8 items-center gap-2.5">
          <span
            className={cn(
              "font-semibold",
              typeConfig?.senderClassName ?? senderCfg.senderClassName
            )}
          >
            {message.sender}
          </span>
          {typeConfig && (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <span
                aria-hidden="true"
                className={cn(
                  "size-[7px] rounded-full bg-muted-foreground",
                  typeConfig.badgeClassName
                )}
              />
              {typeConfig.label}
            </span>
          )}
          {timestamp}
          {hasActions && (
            <MessageActions
              id={message.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewContext={onViewContext}
            />
          )}
        </div>
        <div className="text-foreground">{renderContent()}</div>
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
