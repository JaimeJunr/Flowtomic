/**
 * ChatLog Component - Flowtomic UI
 *
 * Container de mensagens de chat com scroll automático,
 * suporte a filtros customizáveis, header com controles e empty state
 */

import type { HTMLAttributes, ReactNode } from "react";
import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  ChatMessage,
  type ChatMessageData,
  type ChatMessageProps,
} from "../../molecules/data-display/chat-message";
import { Conversation, ConversationContent, ConversationEmptyState } from "../conversation";

export interface ChatLogProps extends HTMLAttributes<HTMLDivElement> {
  messages: ChatMessageData[];
  onMessageEdit?: (id: string | number) => void;
  onMessageDelete?: (id: string | number) => void;
  onMessageViewContext?: (id: string | number) => void;
  emptyState?: ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  headerActions?: ReactNode;
  filters?: ReactNode;
  className?: string;
  messageTypeConfig?: ChatMessageProps["messageTypeConfig"];
  senderConfig?: ChatMessageProps["senderConfig"];
  formatTimestamp?: ChatMessageProps["formatTimestamp"];
  renderMarkdown?: boolean;
  showActions?: boolean;
  showTimestamp?: boolean;
  autoScroll?: boolean;
}

export const ChatLog = React.forwardRef<HTMLDivElement, ChatLogProps>(
  (
    {
      messages,
      onMessageEdit,
      onMessageDelete,
      onMessageViewContext,
      emptyState,
      emptyStateTitle = "Nenhuma mensagem ainda",
      emptyStateDescription = "Comece a conversar para ver mensagens aqui",
      headerActions,
      filters,
      className,
      messageTypeConfig,
      senderConfig,
      formatTimestamp,
      renderMarkdown = true,
      showActions = true,
      showTimestamp = true,
      autoScroll = true,
      ...props
    },
    ref
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      if (autoScroll && messages.length > 0) {
        scrollToBottom();
      }
    }, [messages, autoScroll]);

    return (
      <div ref={ref} className={cn("h-full flex flex-col", className)} {...props}>
        {/* Header com controles */}
        {headerActions && (
          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            {headerActions}
          </div>
        )}

        {/* Filtros */}
        {filters && <div className="border-b border-gray-200 dark:border-gray-700">{filters}</div>}

        {/* Container de mensagens com scroll */}
        <Conversation className="flex-1 overflow-y-auto px-1 sm:px-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <ConversationContent className="p-4 text-gray-900 dark:text-gray-200 leading-relaxed space-y-3 sm:space-y-4">
            {messages.length === 0
              ? emptyState || (
                  <ConversationEmptyState
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                  />
                )
              : messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onEdit={onMessageEdit}
                    onDelete={onMessageDelete}
                    onViewContext={onMessageViewContext}
                    renderMarkdown={renderMarkdown}
                    messageTypeConfig={messageTypeConfig}
                    senderConfig={senderConfig}
                    formatTimestamp={formatTimestamp}
                    showActions={showActions}
                    showTimestamp={showTimestamp}
                  />
                ))}
          </ConversationContent>
          <div ref={messagesEndRef} />
        </Conversation>
      </div>
    );
  }
);

ChatLog.displayName = "ChatLog";
