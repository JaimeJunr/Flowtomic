/**
 * Conversation Component - Flowtomic UI
 *
 * Componente de conversation container com scroll
 */

import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import * as React from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { cn } from "@/lib/utils";
import { Button } from "../../atoms";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = React.forwardRef<
  React.ElementRef<typeof StickToBottom>,
  ConversationProps
>(({ className, ...props }, ref) => (
  <StickToBottom
    ref={ref}
    className={cn("relative flex-1 overflow-y-auto", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
));
Conversation.displayName = "Conversation";

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = React.forwardRef<
  React.ElementRef<typeof StickToBottom.Content>,
  ConversationContentProps
>(({ className, ...props }, ref) => (
  <StickToBottom.Content
    ref={ref}
    className={cn("flex flex-col gap-8 p-4", className)}
    {...props}
  />
));
ConversationContent.displayName = "ConversationContent";

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = React.forwardRef<HTMLDivElement, ConversationEmptyStateProps>(
  (
    {
      className,
      title = "No messages yet",
      description = "Start a conversation to see messages here",
      icon,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div className="space-y-1">
            <h3 className="font-medium text-sm">{title}</h3>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
        </>
      )}
    </div>
  )
);
ConversationEmptyState.displayName = "ConversationEmptyState";

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = React.forwardRef<
  HTMLButtonElement,
  ConversationScrollButtonProps
>(({ className, ...props }, ref) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  if (isAtBottom) {
    return null;
  }

  return (
    <Button
      ref={ref}
      className={cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full", className)}
      onClick={handleScrollToBottom}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      <ArrowDownIcon className="size-4" />
    </Button>
  );
});
ConversationScrollButton.displayName = "ConversationScrollButton";
