/**
 * Message Component - Flowtomic UI
 *
 * Componente de mensagem com branches e attachments
 */

import type { FileUIPart, UIMessage } from "ai";
import { ChevronLeftIcon, ChevronRightIcon, PaperclipIcon, XIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactElement } from "react";
import * as React from "react";
import { createContext, memo, useContext, useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../atoms";
import { ButtonGroup, ButtonGroupText } from "../../forms/button-group";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, from, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group flex w-full max-w-[80%] gap-2",
        from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
        className
      )}
      {...props}
    />
  )
);
Message.displayName = "Message";

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "is-user:dark flex w-fit flex-col gap-2 overflow-hidden text-sm",
        "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
        "group-[.is-assistant]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
MessageContent.displayName = "MessageContent";

export type MessageActionsProps = ComponentProps<"div">;

export const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  )
);
MessageActions.displayName = "MessageActions";

export type MessageActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

export const MessageAction = React.forwardRef<HTMLButtonElement, MessageActionProps>(
  ({ tooltip, children, label, variant = "ghost", size = "icon-sm", ...props }, ref) => {
    const button = (
      <Button ref={ref} size={size} type="button" variant={variant} {...props}>
        {children}
        <span className="sr-only">{label || tooltip}</span>
      </Button>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }
);
MessageAction.displayName = "MessageAction";

type MessageBranchContextType = {
  currentBranch: number;
  totalBranches: number;
  goToPrevious: () => void;
  goToNext: () => void;
  branches: ReactElement[];
  setBranches: (branches: ReactElement[]) => void;
};

const MessageBranchContext = createContext<MessageBranchContextType | null>(null);

const useMessageBranch = () => {
  const context = useContext(MessageBranchContext);

  if (!context) {
    throw new Error("MessageBranch components must be used within MessageBranch");
  }

  return context;
};

export type MessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  defaultBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
};

export const MessageBranch = React.forwardRef<HTMLDivElement, MessageBranchProps>(
  ({ defaultBranch = 0, onBranchChange, className, ...props }, ref) => {
    const [currentBranch, setCurrentBranch] = useState(defaultBranch);
    const [branches, setBranches] = useState<ReactElement[]>([]);

    const handleBranchChange = (newBranch: number) => {
      setCurrentBranch(newBranch);
      onBranchChange?.(newBranch);
    };

    const goToPrevious = () => {
      const newBranch = currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
      handleBranchChange(newBranch);
    };

    const goToNext = () => {
      const newBranch = currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
      handleBranchChange(newBranch);
    };

    const contextValue: MessageBranchContextType = {
      currentBranch,
      totalBranches: branches.length,
      goToPrevious,
      goToNext,
      branches,
      setBranches,
    };

    return (
      <MessageBranchContext.Provider value={contextValue}>
        <div ref={ref} className={cn("grid w-full gap-2 [&>div]:pb-0", className)} {...props} />
      </MessageBranchContext.Provider>
    );
  }
);
MessageBranch.displayName = "MessageBranch";

export type MessageBranchContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageBranchContent = React.forwardRef<HTMLDivElement, MessageBranchContentProps>(
  ({ children, ...props }, ref) => {
    const { currentBranch, setBranches, branches } = useMessageBranch();
    const childrenArray = Array.isArray(children) ? children : [children];

    // Use useEffect to update branches when they change
    useEffect(() => {
      if (branches.length !== childrenArray.length) {
        setBranches(childrenArray);
      }
    }, [childrenArray, branches, setBranches]);

    return (
      <>
        {childrenArray.map((branch, index) => (
          <div
            ref={ref}
            className={cn(
              "grid gap-2 overflow-hidden [&>div]:pb-0",
              index === currentBranch ? "block" : "hidden"
            )}
            key={branch.key || index}
            {...props}
          >
            {branch}
          </div>
        ))}
      </>
    );
  }
);
MessageBranchContent.displayName = "MessageBranchContent";

export type MessageBranchSelectorProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const MessageBranchSelector = React.forwardRef<HTMLDivElement, MessageBranchSelectorProps>(
  ({ className, from, ...props }, ref) => {
    const { totalBranches } = useMessageBranch();

    // Don't render if there's only one branch
    if (totalBranches <= 1) {
      return null;
    }

    return (
      <ButtonGroup
        ref={ref}
        className="[&>*:not(:first-child)]:rounded-l-md [&>*:not(:last-child)]:rounded-r-md"
        orientation="horizontal"
        {...props}
      />
    );
  }
);
MessageBranchSelector.displayName = "MessageBranchSelector";

export type MessageBranchPreviousProps = ComponentProps<typeof Button>;

export const MessageBranchPrevious = React.forwardRef<
  HTMLButtonElement,
  MessageBranchPreviousProps
>(({ children, ...props }, ref) => {
  const { goToPrevious, totalBranches } = useMessageBranch();

  return (
    <Button
      ref={ref}
      aria-label="Previous branch"
      disabled={totalBranches <= 1}
      onClick={goToPrevious}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <ChevronLeftIcon size={14} />}
    </Button>
  );
});
MessageBranchPrevious.displayName = "MessageBranchPrevious";

export type MessageBranchNextProps = ComponentProps<typeof Button>;

export const MessageBranchNext = React.forwardRef<HTMLButtonElement, MessageBranchNextProps>(
  ({ children, className, ...props }, ref) => {
    const { goToNext, totalBranches } = useMessageBranch();

    return (
      <Button
        ref={ref}
        aria-label="Next branch"
        disabled={totalBranches <= 1}
        onClick={goToNext}
        size="icon-sm"
        type="button"
        variant="ghost"
        {...props}
      >
        {children ?? <ChevronRightIcon size={14} />}
      </Button>
    );
  }
);
MessageBranchNext.displayName = "MessageBranchNext";

export type MessageBranchPageProps = HTMLAttributes<HTMLSpanElement>;

export const MessageBranchPage = React.forwardRef<HTMLSpanElement, MessageBranchPageProps>(
  ({ className, ...props }, ref) => {
    const { currentBranch, totalBranches } = useMessageBranch();

    return (
      <ButtonGroupText
        ref={ref}
        className={cn("border-none bg-transparent text-muted-foreground shadow-none", className)}
        {...props}
      >
        {currentBranch + 1} of {totalBranches}
      </ButtonGroupText>
    );
  }
);
MessageBranchPage.displayName = "MessageBranchPage";

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

export const MessageResponse = memo(
  React.forwardRef<HTMLDivElement, MessageResponseProps>(({ className, ...props }, ref) => (
    <Streamdown
      ref={ref}
      className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      {...props}
    />
  )),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
MessageResponse.displayName = "MessageResponse";

export type MessageAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: FileUIPart;
  className?: string;
  onRemove?: () => void;
};

export const MessageAttachment = React.forwardRef<HTMLDivElement, MessageAttachmentProps>(
  ({ data, className, onRemove, ...props }, ref) => {
    const filename = data.filename || "";
    const mediaType = data.mediaType?.startsWith("image/") && data.url ? "image" : "file";
    const isImage = mediaType === "image";
    const attachmentLabel = filename || (isImage ? "Image" : "Attachment");

    return (
      <div
        ref={ref}
        className={cn("group relative size-24 overflow-hidden rounded-lg", className)}
        {...props}
      >
        {isImage ? (
          <>
            <img
              alt={filename || "attachment"}
              className="size-full object-cover"
              height={100}
              src={data.url}
              width={100}
            />
            {onRemove && (
              <Button
                aria-label="Remove attachment"
                className="absolute top-2 right-2 size-6 rounded-full bg-background/80 p-0 opacity-0 backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100 [&>svg]:size-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                type="button"
                variant="ghost"
              >
                <XIcon />
                <span className="sr-only">Remove</span>
              </Button>
            )}
          </>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex size-full shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <PaperclipIcon className="size-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{attachmentLabel}</p>
              </TooltipContent>
            </Tooltip>
            {onRemove && (
              <Button
                aria-label="Remove attachment"
                className="size-6 shrink-0 rounded-full p-0 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 [&>svg]:size-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                type="button"
                variant="ghost"
              >
                <XIcon />
                <span className="sr-only">Remove</span>
              </Button>
            )}
          </>
        )}
      </div>
    );
  }
);
MessageAttachment.displayName = "MessageAttachment";

export type MessageAttachmentsProps = ComponentProps<"div">;

export const MessageAttachments = React.forwardRef<HTMLDivElement, MessageAttachmentsProps>(
  ({ children, className, ...props }, ref) => {
    if (!children) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn("ml-auto flex w-fit flex-wrap items-start gap-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MessageAttachments.displayName = "MessageAttachments";

export type MessageToolbarProps = ComponentProps<"div">;

export const MessageToolbar = React.forwardRef<HTMLDivElement, MessageToolbarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-4 flex w-full items-center justify-between gap-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);
MessageToolbar.displayName = "MessageToolbar";
