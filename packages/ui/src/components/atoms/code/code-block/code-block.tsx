/**
 * CodeBlock Component - Flowtomic UI
 *
 * Componente de bloco de código com syntax highlighting usando Shiki
 */

import type { Element } from "hast";
import { CheckIcon, CopyIcon } from "lucide-react";
import { type ComponentProps, createContext, useContext, useEffect, useRef, useState } from "react";
import { type BundledLanguage, codeToHtml, type ShikiTransformer } from "shiki";
import { cn } from "@/lib/utils";
import { Button } from "../../actions/button";

/** `text` é o texto puro do shiki, para linguagem que ele não conhece. */
export type CodeBlockLanguage = BundledLanguage | "text";

export type CodeBlockProps = ComponentProps<"div"> & {
  code: string;
  language: CodeBlockLanguage;
  showLineNumbers?: boolean;
  /** Max height in pixels; overflow becomes scrollable when set. */
  maxHeight?: number;
  /** When true, scrollbars are visible when content overflows. */
  showScrollbars?: boolean;
  /** Mostra a linguagem no cabeçalho. Sem ela e sem ações (`children`), não há cabeçalho. */
  showLanguage?: boolean;
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
  language: CodeBlockLanguage,
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

export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  maxHeight,
  showScrollbars = false,
  showLanguage = true,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const [darkHtml, setDarkHtml] = useState<string>("");

  useEffect(() => {
    // cancelado por execução: um realce antigo que chega atrasado nunca entra na tela
    let cancelled = false;
    // espera o texto parar de mudar (streaming) antes de pedir o realce
    const timer = setTimeout(() => {
      highlightCode(code, language, showLineNumbers)
        .then(([light, dark]) => {
          if (cancelled) return;
          setHtml(light);
          setDarkHtml(dark);
        })
        .catch(() => {
          // sem realce, o texto puro continua na tela
        });
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, language, showLineNumbers]);

  const highlighted = html !== "";
  const preClass =
    "[&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&_code]:font-mono [&_code]:text-sm";

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        data-slot="code-block"
        className={cn(
          "group relative w-full rounded-md border bg-background text-foreground",
          maxHeight != null || showScrollbars ? "overflow-auto" : "overflow-hidden",
          className
        )}
        style={maxHeight != null ? { maxHeight: `${maxHeight}px` } : undefined}
        data-language={language}
        {...props}
      >
        {showLanguage || children ? (
          <div
            data-slot="code-block-header"
            className="flex min-h-9 items-center justify-between gap-2 border-b py-0.5 pr-1 pl-4"
          >
            <span
              data-slot="code-block-language"
              className="font-mono text-xs text-muted-foreground"
            >
              {language}
            </span>
            {children && <div className="flex items-center gap-1">{children}</div>}
          </div>
        ) : null}
        {highlighted ? (
          <>
            <div
              className={cn(preClass, "dark:hidden")}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: "this is needed for syntax highlighting"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <div
              className={cn(preClass, "hidden dark:block")}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: "this is needed for syntax highlighting"
              dangerouslySetInnerHTML={{ __html: darkHtml }}
            />
          </>
        ) : (
          <pre
            data-slot="code-block-fallback"
            className="m-0 overflow-x-auto p-4 font-mono text-sm"
          >
            <code>{code}</code>
          </pre>
        )}
      </div>
    </CodeBlockContext.Provider>
  );
}
CodeBlock.displayName = "CodeBlock";

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export function CodeBlockCopyButton({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useContext(CodeBlockContext);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Button
      data-slot="code-block-copy-button"
      aria-label={isCopied ? "Copiado" : "Copiar código"}
      className={cn("h-8 shrink-0 gap-1.5 px-2", isCopied && "text-success", className)}
      onClick={copyToClipboard}
      size={isCopied ? "sm" : "icon-sm"}
      variant="ghost"
      {...props}
    >
      {children ??
        (isCopied ? (
          <>
            <CheckIcon aria-hidden="true" size={14} />
            Copiado
          </>
        ) : (
          <CopyIcon aria-hidden="true" size={14} />
        ))}
    </Button>
  );
}
CodeBlockCopyButton.displayName = "CodeBlockCopyButton";
