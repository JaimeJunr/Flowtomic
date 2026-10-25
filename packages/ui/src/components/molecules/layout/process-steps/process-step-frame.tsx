import type * as React from "react";
import { cn } from "@/lib/utils";

export type ProcessStepFrameProps = React.ComponentProps<"div"> & {
  /** Nome da janela, à direita da barra de topo. */
  title?: React.ReactNode;
  tone?: "light" | "dark";
  /** Esconde o quadro do leitor de tela: o texto do passo já diz o que ele mostra. */
  decorative?: boolean;
};

const MUTED_DOT = "bg-[color-mix(in_oklch,var(--muted-foreground)_30%,transparent)]";

/** Quadro de mini-mock com barra de janela, para o `preview` de um passo. */
function ProcessStepFrame({
  title,
  tone = "light",
  decorative = true,
  className,
  children,
  ...props
}: ProcessStepFrameProps) {
  return (
    <div
      data-slot="process-step-frame"
      aria-hidden={decorative ? true : undefined}
      inert={decorative ? true : undefined}
      className={cn(
        // `dark` no próprio quadro: painel escuro nos dois modos, sem inverter com bg-foreground.
        "flex aspect-[16/10] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-shadow",
        tone === "dark" && "dark",
        className
      )}
      {...props}
    >
      <div className="flex h-8 shrink-0 items-center gap-1.5 border-b border-border px-3">
        <span className="size-2 rounded-full bg-primary" />
        <span className={cn("size-2 rounded-full", MUTED_DOT)} />
        <span className={cn("size-2 rounded-full", MUTED_DOT)} />
        {title ? (
          <span className="ml-auto truncate text-xs text-muted-foreground">{title}</span>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 p-4">{children}</div>
    </div>
  );
}
ProcessStepFrame.displayName = "ProcessStepFrame";

export { ProcessStepFrame };
