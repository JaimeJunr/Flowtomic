/**
 * ChatLog Component - Flowtomic UI
 *
 * Container de mensagens de chat com scroll automático,
 * suporte a filtros customizáveis, header com controles e empty state
 */

import type { ComponentProps, ReactNode } from "react";
import { useEffect } from "react";
import { useStickToBottomContext } from "use-stick-to-bottom";
import {
  ChatMessage,
  type ChatMessageData,
  type ChatMessageProps,
} from "@/components/molecules/data-display/chat-message";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/organisms/conversation";
import { cn } from "@/lib/utils";

export interface ChatLogProps extends ComponentProps<"div"> {
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

// Com autoScroll desligado, solta a trava do StickToBottom a cada mensagem nova, para a
// conversa não seguir o fim sozinha. Precisa morar dentro do <Conversation> (usa o contexto).
function ReleaseScrollLock({ messageCount }: { messageCount: number }) {
  const { stopScroll } = useStickToBottomContext();
  // biome-ignore lint/correctness/useExhaustiveDependencies: roda de novo a cada mensagem nova, de propósito
  useEffect(() => {
    stopScroll();
  }, [stopScroll, messageCount]);
  return null;
}

export function ChatLog({
  messages,
  onMessageEdit,
  onMessageDelete,
  onMessageViewContext,
  emptyState,
  emptyStateTitle = "Nenhuma mensagem ainda",
  emptyStateDescription = "Envie a primeira mensagem para começar.",
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
}: ChatLogProps) {
  return (
    <div data-slot="chat-log" className={cn("h-full flex flex-col", className)} {...props}>
      {/* Header com controles */}
      {headerActions && (
        <div className="flex items-center justify-between p-3 bg-muted border-b border-border">
          {headerActions}
        </div>
      )}

      {/* Filtros */}
      {filters && <div className="border-b border-border">{filters}</div>}

      {/* Container de mensagens com scroll */}
      <Conversation
        initial={autoScroll ? "smooth" : false}
        className="flex-1 overflow-y-auto px-1 sm:px-2 bg-muted/50 rounded-lg border border-border"
      >
        <ConversationContent className="p-4 text-foreground leading-relaxed space-y-3 sm:space-y-4">
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
        {autoScroll ? null : <ReleaseScrollLock messageCount={messages.length} />}
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}

ChatLog.displayName = "ChatLog";
