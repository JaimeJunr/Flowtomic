/**
 * Snippet Component - Flowtomic UI
 *
 * Componente para exibir snippets de código inline ou multiline
 */

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  useContext,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../actions/button";

export type SnippetVariant = "inline" | "multiline";

export type SnippetProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Conteúdo do snippet
   */
  children: React.ReactNode;
  /**
   * Variante do snippet: inline ou multiline
   * @default "inline"
   */
  variant?: SnippetVariant;
};

type SnippetContextType = {
  code: string;
};

const SnippetContext = createContext<SnippetContextType>({
  code: "",
});

export const Snippet = React.forwardRef<HTMLDivElement, SnippetProps>(
  ({ children, variant = "inline", className, ...props }, ref) => {
    // Extrair código e elementos adicionais (como botão de copiar)
    let code = "";
    const additionalElements: React.ReactNode[] = [];

    // Se children for uma string simples, usar diretamente
    if (typeof children === "string") {
      code = children;
    } else {
      // Processar children como array
      const childrenArray = React.Children.toArray(children);
      const codeParts: string[] = [];

      for (const child of childrenArray) {
        if (typeof child === "string") {
          codeParts.push(child);
        } else if (React.isValidElement(child) && child.type === SnippetCopyButton) {
          additionalElements.push(child);
        } else if (React.isValidElement(child)) {
          // Se for outro elemento React, também pode ser código (ex: <code>)
          const childProps = child.props as { children?: React.ReactNode };
          codeParts.push(String(childProps?.children || child));
        } else {
          codeParts.push(String(child));
        }
      }

      code = codeParts.join("").trim() || String(children);
    }

    const isInline = variant === "inline";

    return (
      <SnippetContext.Provider value={{ code }}>
        <div
          ref={ref}
          className={cn(
            "group relative",
            isInline ? "inline-flex items-center" : "flex flex-col",
            className
          )}
          {...props}
        >
          {isInline ? (
            <code
              className={cn(
                "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
                "text-foreground"
              )}
            >
              {code}
            </code>
          ) : (
            <pre
              className={cn(
                "relative w-full overflow-x-auto rounded-md border bg-muted p-4",
                "font-mono text-sm text-foreground"
              )}
            >
              <code>{code}</code>
            </pre>
          )}
          {additionalElements.length > 0 && (
            <div className={cn(isInline ? "ml-2" : "absolute top-2 right-2")}>
              {additionalElements}
            </div>
          )}
        </div>
      </SnippetContext.Provider>
    );
  }
);
Snippet.displayName = "Snippet";

export type SnippetCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onCopyError?: (error: Error) => void;
  timeout?: number;
};

export const SnippetCopyButton = React.forwardRef<HTMLButtonElement, SnippetCopyButtonProps>(
  ({ onCopy, onCopyError, timeout = 2000, children, className, ...props }, ref) => {
    const [isCopied, setIsCopied] = useState(false);
    const { code } = useContext(SnippetContext);

    const copyToClipboard = async () => {
      if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
        onCopyError?.(new Error("Clipboard API not available"));
        return;
      }

      try {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        onCopy?.();
        setTimeout(() => {
          setIsCopied(false);
        }, timeout);
      } catch (error) {
        onCopyError?.(error as Error);
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
        aria-label={isCopied ? "Copiado" : "Copiar código"}
        {...props}
      >
        {children ?? <Icon size={14} />}
      </Button>
    );
  }
);
SnippetCopyButton.displayName = "SnippetCopyButton";
