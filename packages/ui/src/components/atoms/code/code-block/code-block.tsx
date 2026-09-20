/**
 * CodeBlock Component - Flowtomic UI
 *
 * Componente de bloco de código com syntax highlighting usando Shiki
 */

import type { Element } from "hast";
import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { type BundledLanguage, codeToHtml, type ShikiTransformer } from "shiki";
import { cn } from "@/lib/utils";
import { Button } from "../../actions/button";

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: BundledLanguage;
  showLineNumbers?: boolean;
  /** Max height in pixels; overflow becomes scrollable when set. */
  maxHeight?: number;
  /** When true, scrollbars are visible when content overflows. */
  showScrollbars?: boolean;
};

type CodeBlockContextType = {
  code: string;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
});

const lineNumberTransformer: ShikiTransformer = {
  name: "line-numbers",
  line(node: Element, line: number) {
    node.children.unshift({
      type: "element",
      tagName: "span",
      properties: {
        className: [
          "inline-block",
          "min-w-10",
          "mr-4",
          "text-right",
          "select-none",
          "text-muted-foreground",
        ],
      },
      children: [{ type: "text", value: String(line) }],
    });
  },
};

export async function highlightCode(
  code: string,
  language: BundledLanguage,
  showLineNumbers = false
) {
  const transformers: ShikiTransformer[] = showLineNumbers ? [lineNumberTransformer] : [];

  return await Promise.all([
    codeToHtml(code, {
      lang: language,
      theme: "one-light",
      transformers,
    }),
    codeToHtml(code, {
      lang: language,
      theme: "one-dark-pro",
      transformers,
    }),
  ]);
}

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      showLineNumbers = false,
      maxHeight,
      showScrollbars = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [html, setHtml] = useState<string>("");
    const [darkHtml, setDarkHtml] = useState<string>("");
    const mounted = useRef(false);

    useEffect(() => {
      highlightCode(code, language, showLineNumbers).then(([light, dark]) => {
        if (!mounted.current) {
          setHtml(light);
          setDarkHtml(dark);
          mounted.current = true;
        }
      });

      return () => {
        mounted.current = false;
      };
    }, [code, language, showLineNumbers]);

    return (
      <CodeBlockContext.Provider value={{ code }}>
        <div
          ref={ref}
          className={cn(
            "group relative w-full rounded-md border bg-background text-foreground",
            maxHeight != null || showScrollbars ? "overflow-auto" : "overflow-hidden",
            className
          )}
          style={maxHeight != null ? { maxHeight: `${maxHeight}px` } : undefined}
          {...props}
        >
          <div className="relative">
            <div
              className="overflow-hidden dark:hidden [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&_code]:font-mono [&_code]:text-sm"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: "this is needed for syntax highlighting"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <div
              className="hidden overflow-hidden dark:block [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&_code]:font-mono [&_code]:text-sm"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: "this is needed for syntax highlighting"
              dangerouslySetInnerHTML={{ __html: darkHtml }}
            />
            {children && (
              <div className="absolute top-2 right-2 flex items-center gap-2">{children}</div>
            )}
          </div>
        </div>
      </CodeBlockContext.Provider>
    );
  }
);
CodeBlock.displayName = "CodeBlock";

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = React.forwardRef<HTMLButtonElement, CodeBlockCopyButtonProps>(
  ({ onCopy, onError, timeout = 2000, children, className, ...props }, ref) => {
    const [isCopied, setIsCopied] = useState(false);
    const { code } = useContext(CodeBlockContext);

    const copyToClipboard = async () => {
      if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
        onError?.(new Error("Clipboard API not available"));
        return;
      }

      try {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        onCopy?.();
        setTimeout(() => setIsCopied(false), timeout);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    const Icon = isCopied ? CheckIcon : CopyIcon;

    return (
      <Button
        ref={ref}
        className={cn("shrink-0", className)}
        onClick={copyToClipboard}
        size="icon"
        variant="ghost"
        {...props}
      >
        {children ?? <Icon size={14} />}
      </Button>
    );
  }
);
CodeBlockCopyButton.displayName = "CodeBlockCopyButton";
