/**
 * Message Component - Flowtomic UI
 *
 * Componente de mensagem com branches e attachments
 */

import type { FileUIPart, UIMessage } from "ai";
import hardenReactMarkdown from "harden-react-markdown";
import { ChevronLeftIcon, ChevronRightIcon, PaperclipIcon, XIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactElement } from "react";
import * as React from "react";
import { createContext, isValidElement, memo, useContext, useEffect, useState } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { BundledLanguage } from "shiki";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms";
import { CodeBlock, CodeBlockCopyButton } from "@/components/atoms/code/code-block";
import { ButtonGroup, ButtonGroupText } from "@/components/molecules/forms/button-group";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";

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
        ref={ref as React.ForwardedRef<HTMLFieldSetElement>}
        className={cn(
          "[&>*:not(:first-child)]:rounded-l-md [&>*:not(:last-child)]:rounded-r-md",
          className
        )}
        orientation="horizontal"
        {...(props as Omit<React.HTMLAttributes<HTMLFieldSetElement>, "className" | "orientation">)}
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
        ref={ref as React.ForwardedRef<HTMLDivElement>}
        className={cn("border-none bg-transparent text-muted-foreground shadow-none", className)}
        {...props}
      >
        {currentBranch + 1} of {totalBranches}
      </ButtonGroupText>
    );
  }
);
MessageBranchPage.displayName = "MessageBranchPage";

/**
 * Parses markdown text and removes incomplete tokens to prevent partial rendering
 * of links, images, bold, and italic formatting during streaming.
 */
function parseIncompleteMarkdown(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }
  let result = text;
  // Handle incomplete links and images
  // Pattern: [...] or ![...] where the closing ] is missing
  const linkImagePattern = /(!?\[)([^\]]*?)$/;
  const linkMatch = result.match(linkImagePattern);
  if (linkMatch) {
    // If we have an unterminated [ or ![, remove it and everything after
    const startIndex = result.lastIndexOf(linkMatch[1]);
    result = result.substring(0, startIndex);
  }
  // Handle incomplete bold formatting (**)
  const boldPattern = /(\*\*)([^*]*?)$/;
  const boldMatch = result.match(boldPattern);
  if (boldMatch) {
    // Count the number of ** in the entire string
    const asteriskPairs = (result.match(/\*\*/g) || []).length;
    // If odd number of **, we have an incomplete bold - complete it
    if (asteriskPairs % 2 === 1) {
      result = `${result}**`;
    }
  }
  // Handle incomplete italic formatting (__)
  const italicPattern = /(__)([^_]*?)$/;
  const italicMatch = result.match(italicPattern);
  if (italicMatch) {
    // Count the number of __ in the entire string
    const underscorePairs = (result.match(/__/g) || []).length;
    // If odd number of __, we have an incomplete italic - complete it
    if (underscorePairs % 2 === 1) {
      result = `${result}__`;
    }
  }
  // Handle incomplete single asterisk italic (*)
  const singleAsteriskPattern = /(\*)([^*]*?)$/;
  const singleAsteriskMatch = result.match(singleAsteriskPattern);
  if (singleAsteriskMatch) {
    // Count single asterisks that aren't part of **
    const singleAsterisks = result.split("").reduce((acc, char, index) => {
      if (char === "*") {
        // Check if it's part of a ** pair
        const prevChar = result[index - 1];
        const nextChar = result[index + 1];
        if (prevChar !== "*" && nextChar !== "*") {
          return acc + 1;
        }
      }
      return acc;
    }, 0);
    // If odd number of single *, we have an incomplete italic - complete it
    if (singleAsterisks % 2 === 1) {
      result = `${result}*`;
    }
  }
  // Handle incomplete single underscore italic (_)
  const singleUnderscorePattern = /(_)([^_]*?)$/;
  const singleUnderscoreMatch = result.match(singleUnderscorePattern);
  if (singleUnderscoreMatch) {
    // Count single underscores that aren't part of __
    const singleUnderscores = result.split("").reduce((acc, char, index) => {
      if (char === "_") {
        // Check if it's part of a __ pair
        const prevChar = result[index - 1];
        const nextChar = result[index + 1];
        if (prevChar !== "_" && nextChar !== "_") {
          return acc + 1;
        }
      }
      return acc;
    }, 0);
    // If odd number of single _, we have an incomplete italic - complete it
    if (singleUnderscores % 2 === 1) {
      result = `${result}_`;
    }
  }
  // Handle incomplete inline code blocks (`) - but avoid code blocks (```)
  const inlineCodePattern = /(`)([^`]*?)$/;
  const inlineCodeMatch = result.match(inlineCodePattern);
  if (inlineCodeMatch) {
    // Check if we're dealing with a code block (triple backticks)
    const _hasCodeBlockStart = result.includes("```");
    const codeBlockPattern = /```[\s\S]*?```/g;
    const _completeCodeBlocks = (result.match(codeBlockPattern) || []).length;
    const allTripleBackticks = (result.match(/```/g) || []).length;
    // If we have an odd number of ``` sequences, we're inside an incomplete code block
    // In this case, don't complete inline code
    const insideIncompleteCodeBlock = allTripleBackticks % 2 === 1;
    if (!insideIncompleteCodeBlock) {
      // Count the number of single backticks that are NOT part of triple backticks
      let singleBacktickCount = 0;
      for (let i = 0; i < result.length; i++) {
        if (result[i] === "`") {
          // Check if this backtick is part of a triple backtick sequence
          const isTripleStart = result.substring(i, i + 3) === "```";
          const isTripleMiddle = i > 0 && result.substring(i - 1, i + 2) === "```";
          const isTripleEnd = i > 1 && result.substring(i - 2, i + 1) === "```";
          if (!(isTripleStart || isTripleMiddle || isTripleEnd)) {
            singleBacktickCount++;
          }
        }
      }
      // If odd number of single backticks, we have an incomplete inline code - complete it
      if (singleBacktickCount % 2 === 1) {
        result = `${result}\``;
      }
    }
  }
  // Handle incomplete strikethrough formatting (~~)
  const strikethroughPattern = /(~~)([^~]*?)$/;
  const strikethroughMatch = result.match(strikethroughPattern);
  if (strikethroughMatch) {
    // Count the number of ~~ in the entire string
    const tildePairs = (result.match(/~~/g) || []).length;
    // If odd number of ~~, we have an incomplete strikethrough - complete it
    if (tildePairs % 2 === 1) {
      result = `${result}~~`;
    }
  }
  return result;
}

// Create a hardened version of ReactMarkdown
const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown);

const components: Options["components"] = {
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn("ml-4 list-outside list-decimal", className)} {...(props as any)}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn("py-1", className)} {...(props as any)}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn("ml-4 list-outside list-disc", className)} {...(props as any)}>
      {children}
    </ul>
  ),
  hr: ({ node, className, ...props }) => (
    <hr className={cn("my-6 border-border", className)} {...(props as any)} />
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn("font-semibold", className)} {...(props as any)}>
      {children}
    </span>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline", className)}
      rel="noreferrer"
      target="_blank"
      {...(props as any)}
    >
      {children}
    </a>
  ),
  h1: ({ node, children, className, ...props }) => (
    <h1 className={cn("mt-6 mb-2 font-semibold text-3xl", className)} {...(props as any)}>
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2 className={cn("mt-6 mb-2 font-semibold text-2xl", className)} {...(props as any)}>
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn("mt-6 mb-2 font-semibold text-xl", className)} {...(props as any)}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn("mt-6 mb-2 font-semibold text-lg", className)} {...(props as any)}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5 className={cn("mt-6 mb-2 font-semibold text-base", className)} {...(props as any)}>
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn("mt-6 mb-2 font-semibold text-sm", className)} {...(props as any)}>
      {children}
    </h6>
  ),
  table: ({ node, children, className, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table
        className={cn("w-full border-collapse border border-border", className)}
        {...(props as any)}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, className, ...props }) => (
    <thead className={cn("bg-muted/50", className)} {...(props as any)}>
      {children}
    </thead>
  ),
  tbody: ({ node, children, className, ...props }) => (
    <tbody className={cn("divide-y divide-border", className)} {...(props as any)}>
      {children}
    </tbody>
  ),
  tr: ({ node, children, className, ...props }) => (
    <tr className={cn("border-border border-b", className)} {...(props as any)}>
      {children}
    </tr>
  ),
  th: ({ node, children, className, ...props }) => (
    <th className={cn("px-4 py-2 text-left font-semibold text-sm", className)} {...(props as any)}>
      {children}
    </th>
  ),
  td: ({ node, children, className, ...props }) => (
    <td className={cn("px-4 py-2 text-sm", className)} {...(props as any)}>
      {children}
    </td>
  ),
  blockquote: ({ node, children, className, ...props }) => (
    <blockquote
      className={cn(
        "my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic",
        className
      )}
      {...(props as any)}
    >
      {children}
    </blockquote>
  ),
  code: ({ node, className, ...props }) => {
    const inline = node?.position?.start.line === node?.position?.end.line;
    if (!inline) {
      return <code className={className} {...(props as any)} />;
    }
    return (
      <code
        className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-sm", className)}
        {...(props as any)}
      />
    );
  },
  pre: ({ node, className, children }) => {
    let language: BundledLanguage = "javascript";
    if (typeof node?.properties?.className === "string") {
      const lang = node.properties.className.replace("language-", "");
      // Validate that it's a valid BundledLanguage, fallback to javascript
      language = (lang as BundledLanguage) || "javascript";
    }
    // Extract code content from children safely
    let code = "";
    if (
      isValidElement(children) &&
      children.props &&
      typeof (children.props as any).children === "string"
    ) {
      code = (children.props as Record<string, any>).children as string;
    } else if (typeof children === "string") {
      code = children;
    }
    return (
      <CodeBlock className={cn("my-4 h-auto", className)} code={code} language={language}>
        <CodeBlockCopyButton
          onCopy={() => console.log("Copied code to clipboard")}
          onError={() => console.error("Failed to copy code to clipboard")}
        />
      </CodeBlock>
    );
  },
};

export type MessageResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options["children"];
  allowedImagePrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedImagePrefixes"];
  allowedLinkPrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedLinkPrefixes"];
  defaultOrigin?: ComponentProps<ReturnType<typeof hardenReactMarkdown>>["defaultOrigin"];
  parseIncompleteMarkdown?: boolean;
};

const MessageResponseComponent = React.forwardRef<HTMLDivElement, MessageResponseProps>(
  (
    {
      className,
      options,
      children,
      allowedImagePrefixes,
      allowedLinkPrefixes,
      defaultOrigin,
      parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
      ...props
    },
    ref
  ) => {
    // Parse the children to remove incomplete markdown tokens if enabled
    const parsedChildren =
      typeof children === "string" && shouldParseIncompleteMarkdown
        ? parseIncompleteMarkdown(children)
        : children;

    return (
      <div
        ref={ref}
        className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
        {...(props as any)}
      >
        <HardenedMarkdown
          allowedImagePrefixes={allowedImagePrefixes ?? ["*"]}
          allowedLinkPrefixes={allowedLinkPrefixes ?? ["*"]}
          components={components}
          defaultOrigin={defaultOrigin}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkGfm, remarkMath]}
          {...options}
        >
          {parsedChildren}
        </HardenedMarkdown>
      </div>
    );
  }
);
MessageResponseComponent.displayName = "MessageResponse";

export const MessageResponse = memo(
  MessageResponseComponent,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

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
