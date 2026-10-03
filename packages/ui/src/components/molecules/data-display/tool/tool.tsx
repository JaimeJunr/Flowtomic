/**
 * Tool Component - Flowtomic UI
 *
 * Componente de tool display com collapsible
 */

import type { ToolUIPart } from "ai";
import { ChevronDownIcon, Loader2, WrenchIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import * as React from "react";
import { isValidElement } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock, Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../atoms";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = React.forwardRef<React.ElementRef<typeof Collapsible>, ToolProps>(
  ({ className, ...props }, ref) => (
    <Collapsible
      ref={ref}
      className={cn("not-prose mb-4 w-full rounded-[10px] border border-border", className)}
      {...props}
    />
  )
);
Tool.displayName = "Tool";

export type ToolHeaderProps = {
  title?: string;
  type: ToolUIPart["type"];
  state: ToolUIPart["state"];
  className?: string;
};

const getStatusLabel = (status: ToolUIPart["state"]) => {
  type ExtendedState =
    | ToolUIPart["state"]
    | "approval-requested"
    | "approval-responded"
    | "output-denied";
  const labels: Partial<Record<ExtendedState, string>> = {
    "input-streaming": "Preparando",
    "input-available": "Executando",
    "approval-requested": "Aguardando aprovação",
    "approval-responded": "Respondida",
    "output-available": "Concluída",
    "output-error": "Falhou",
    "output-denied": "Negada",
  };

  const tone =
    status === "output-available"
      ? { text: "text-success", dot: "bg-success" }
      : status === "output-error"
        ? { text: "text-destructive", dot: "bg-destructive" }
        : (status as ExtendedState) === "approval-requested"
          ? { text: "text-warning", dot: "bg-warning" }
          : { text: "text-muted-foreground", dot: "bg-muted-foreground" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px]", tone.text)}>
      {status === "input-available" ? (
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <span aria-hidden="true" className={cn("size-[7px] shrink-0 rounded-full", tone.dot)} />
      )}
      {labels[status]}
    </span>
  );
};

export const ToolHeader = React.forwardRef<HTMLButtonElement, ToolHeaderProps>(
  ({ className, title, type, state, ...props }, ref) => (
    <CollapsibleTrigger
      ref={ref}
      className={cn("flex w-full items-center justify-between gap-4 p-3", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <WrenchIcon className="size-4 text-muted-foreground" />
        <span className="font-mono text-[13px]">{title ?? type.split("-").slice(1).join("-")}</span>
        {getStatusLabel(state)}
      </div>
      <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
  )
);
ToolHeader.displayName = "ToolHeader";

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = React.forwardRef<HTMLDivElement, ToolContentProps>(
  ({ className, ...props }, ref) => (
    <CollapsibleContent
      ref={ref}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    />
  )
);
ToolContent.displayName = "ToolContent";

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export const ToolInput = React.forwardRef<HTMLDivElement, ToolInputProps>(
  ({ className, input, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2 overflow-hidden p-4", className)} {...props}>
      <h4 className="font-medium text-muted-foreground text-[13px]">Parâmetros</h4>
      <div className="rounded-md bg-surface">
        <CodeBlock
          className="border-0 bg-surface font-mono text-[12.5px] [&_pre]:bg-surface! [&_pre]:text-[12.5px]! [&_code]:text-[12.5px]!"
          code={JSON.stringify(input, null, 2)}
          language="json"
        />
      </div>
    </div>
  )
);
ToolInput.displayName = "ToolInput";

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolUIPart["output"];
  errorText: ToolUIPart["errorText"];
};

export const ToolOutput = React.forwardRef<HTMLDivElement, ToolOutputProps>(
  ({ className, output, errorText, ...props }, ref) => {
    if (!(output || errorText)) {
      return null;
    }

    let Output: ReactNode = <div>{output as ReactNode}</div>;

    if (typeof output === "object" && !isValidElement(output)) {
      Output = (
        <CodeBlock
          className="border-0 bg-surface font-mono text-[12.5px] [&_pre]:bg-surface! [&_pre]:text-[12.5px]! [&_code]:text-[12.5px]!"
          code={JSON.stringify(output, null, 2)}
          language="json"
        />
      );
    } else if (typeof output === "string") {
      Output = (
        <CodeBlock
          className="border-0 bg-surface font-mono text-[12.5px] [&_pre]:bg-surface! [&_pre]:text-[12.5px]! [&_code]:text-[12.5px]!"
          code={output}
          language="json"
        />
      );
    }

    return (
      <div ref={ref} className={cn("space-y-2 p-4", className)} {...props}>
        <h4
          className={cn(
            "font-medium text-[13px]",
            errorText ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {errorText ? "Erro" : "Resultado"}
        </h4>
        <div
          className={cn(
            "overflow-x-auto rounded-md font-mono text-[12.5px] [&_table]:w-full",
            errorText ? "bg-destructive/10 text-destructive" : "bg-surface text-foreground"
          )}
        >
          {errorText && <div>{errorText}</div>}
          {Output}
        </div>
      </div>
    );
  }
);
ToolOutput.displayName = "ToolOutput";
