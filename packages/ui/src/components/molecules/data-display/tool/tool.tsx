/**
 * Tool Component - Flowtomic UI
 *
 * Componente de tool display com collapsible
 */

import type { ToolUIPart } from "ai";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import * as React from "react";
import { isValidElement } from "react";
import { cn } from "@/lib/utils";
import {
  Badge,
  CodeBlock,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../atoms";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = React.forwardRef<React.ElementRef<typeof Collapsible>, ToolProps>(
  ({ className, ...props }, ref) => (
    <Collapsible
      ref={ref}
      className={cn("not-prose mb-4 w-full rounded-md border", className)}
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

const getStatusBadge = (status: ToolUIPart["state"]) => {
  type ExtendedState =
    | ToolUIPart["state"]
    | "approval-requested"
    | "approval-responded"
    | "output-denied";
  const labels: Partial<Record<ExtendedState, string>> = {
    "input-streaming": "Pending",
    "input-available": "Running",
    "approval-requested": "Awaiting Approval",
    "approval-responded": "Responded",
    "output-available": "Completed",
    "output-error": "Error",
    "output-denied": "Denied",
  };

  const icons: Partial<Record<ExtendedState, ReactNode>> = {
    "input-streaming": <CircleIcon className="size-4" />,
    "input-available": <ClockIcon className="size-4 animate-pulse" />,
    "approval-requested": <ClockIcon className="size-4 text-yellow-600" />,
    "approval-responded": <CheckCircleIcon className="size-4 text-blue-600" />,
    "output-available": <CheckCircleIcon className="size-4 text-green-600" />,
    "output-error": <XCircleIcon className="size-4 text-red-600" />,
    "output-denied": <XCircleIcon className="size-4 text-orange-600" />,
  };

  return (
    <Badge className="gap-1.5 rounded-full text-xs" variant="secondary">
      {icons[status]}
      {labels[status]}
    </Badge>
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
        <span className="font-medium text-sm">{title ?? type.split("-").slice(1).join("-")}</span>
        {getStatusBadge(state)}
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
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Parameters
      </h4>
      <div className="rounded-md bg-muted/50">
        <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
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
      Output = <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />;
    } else if (typeof output === "string") {
      Output = <CodeBlock code={output} language="json" />;
    }

    return (
      <div ref={ref} className={cn("space-y-2 p-4", className)} {...props}>
        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {errorText ? "Error" : "Result"}
        </h4>
        <div
          className={cn(
            "overflow-x-auto rounded-md text-xs [&_table]:w-full",
            errorText ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-foreground"
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
