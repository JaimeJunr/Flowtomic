/**
 * Sources Component - Flowtomic UI
 *
 * Componente de sources collapsible
 */

import { ChevronDownIcon, ExternalLink } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../atoms";

export type SourcesProps = ComponentProps<"div">;

export function Sources({ className, ...props }: SourcesProps) {
  return (
    <Collapsible
      data-slot="sources"
      className={cn("not-prose mb-4 text-muted-foreground text-[13px]", className)}
      {...props}
    />
  );
}
Sources.displayName = "Sources";

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export function SourcesTrigger({ className, count, children, ...props }: SourcesTriggerProps) {
  return (
    <CollapsibleTrigger
      data-slot="sources-trigger"
      className={cn("flex items-center gap-2 text-muted-foreground text-[13px]", className)}
      {...props}
    >
      {children ?? (
        <>
          <p className="font-medium">
            Usou {count} {count === 1 ? "fonte" : "fontes"}
          </p>
          <ChevronDownIcon className="h-4 w-4" />
        </>
      )}
    </CollapsibleTrigger>
  );
}
SourcesTrigger.displayName = "SourcesTrigger";

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export function SourcesContent({ className, ...props }: SourcesContentProps) {
  return (
    <CollapsibleContent
      data-slot="sources-content"
      className={cn(
        "mt-3 flex w-fit flex-col gap-2",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    />
  );
}
SourcesContent.displayName = "SourcesContent";

/**
 * Endereço que pode virar link: http(s) ou caminho relativo. `javascript:`, `data:` e afins
 * (vindos do modelo ou de uma busca) não passam. Quem decide é o parser de URL do navegador,
 * que já normaliza maiúsculas e espaços como `  JavaScript:`.
 */
export function isSafeSourceUrl(href: string | undefined): href is string {
  if (!href) return false;
  try {
    const { protocol } = new URL(href, "https://flowtomic.invalid");
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Tira fontes repetidas pela `url`, mantendo a ordem da primeira aparição. */
export function uniqueSources<T extends { url: string }>(sources: T[]): T[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

export type SourceProps = ComponentProps<"a">;

export function Source({ href, title, children, ...props }: SourceProps) {
  const content = children ?? (
    <>
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
      <span className="block font-mono">{title}</span>
    </>
  );
  // endereço perigoso: mostra o nome da fonte, mas sem link para clicar
  if (!isSafeSourceUrl(href)) {
    return (
      <span data-slot="source" className="flex items-center gap-2">
        {content}
      </span>
    );
  }
  return (
    <a
      data-slot="source"
      className="flex items-center gap-2"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
    >
      {content}
    </a>
  );
}
Source.displayName = "Source";
