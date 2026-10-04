// Ideia das "parts" de uma linha do shadcn-ui/chatbot-template (MIT) — ver
// packages/ui/THIRD_PARTY_NOTICES.md. O card Tool (JSON) continua para depuração.
import { AlertCircle, Loader2 } from "lucide-react";
import type * as React from "react";
import { Shimmer } from "@/components/atoms/animation/shimmer";
import { cn } from "@/lib/utils";

export type ToolStatusLineState = "running" | "done" | "error";

export interface ToolStatusLineProps extends Omit<React.ComponentProps<"div">, "children"> {
  state: ToolStatusLineState;
  /** O que a ferramenta fez ("Buscou na web por") ou está fazendo ("Buscando na web por"). */
  label: string;
  /** Ícone do estado `done`; em `running` vira spinner e em `error` vira alerta. */
  icon?: React.ReactNode;
  /** O valor em mono: a busca, o arquivo, um link. */
  detail?: React.ReactNode;
  /** Extra pequeno depois do valor: código de erro, contagem. */
  meta?: React.ReactNode;
}

function ToolStatusLineIcon({ state, icon }: Pick<ToolStatusLineProps, "state" | "icon">) {
  if (state === "running") {
    return <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" />;
  }
  if (state === "error") {
    return (
      <AlertCircle
        aria-hidden="true"
        data-slot="tool-status-line-error-icon"
        className="size-4 shrink-0"
      />
    );
  }
  return icon ? (
    <span aria-hidden="true" className="flex shrink-0 [&_svg]:size-4">
      {icon}
    </span>
  ) : null;
}

function ToolStatusLine({
  state,
  label,
  icon,
  detail,
  meta,
  className,
  ...props
}: ToolStatusLineProps) {
  return (
    <div
      data-slot="tool-status-line"
      data-state={state}
      aria-busy={state === "running" ? true : undefined}
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm",
        state === "error" ? "text-destructive" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      <ToolStatusLineIcon state={state} icon={icon} />
      {state === "running" ? <Shimmer as="span">{label}</Shimmer> : <span>{label}</span>}
      {/* espaço real entre as partes: o gap do flex não aparece para o leitor de tela */}
      {detail ? " " : null}
      {detail ? (
        <span
          className={cn(
            "min-w-0 break-all font-mono text-[13px]",
            state === "error" ? "text-destructive" : "text-foreground"
          )}
        >
          {detail}
        </span>
      ) : null}
      {meta ? " " : null}
      {meta ? (
        <span data-slot="tool-status-line-meta" className="font-mono text-xs">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

ToolStatusLine.displayName = "ToolStatusLine";

export { ToolStatusLine };
