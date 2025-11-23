/**
 * Task Component - Flowtomic UI
 *
 * Componente de task item com collapsible
 */

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import type { ComponentProps } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../atoms";

export type TaskItemFileProps = ComponentProps<"div">;

export const TaskItemFile = React.forwardRef<HTMLDivElement, TaskItemFileProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-secondary px-1.5 py-0.5 text-foreground text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TaskItemFile.displayName = "TaskItemFile";

export type TaskItemProps = ComponentProps<"div">;

export const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </div>
  )
);
TaskItem.displayName = "TaskItem";

export type TaskProps = ComponentProps<typeof Collapsible>;

export const Task = React.forwardRef<React.ElementRef<typeof Collapsible>, TaskProps>(
  ({ defaultOpen = true, className, ...props }, ref) => (
    <Collapsible ref={ref} className={cn(className)} defaultOpen={defaultOpen} {...props} />
  )
);
Task.displayName = "Task";

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title: string;
};

export const TaskTrigger = React.forwardRef<HTMLButtonElement, TaskTriggerProps>(
  ({ children, className, title, ...props }, ref) => (
    <CollapsibleTrigger ref={ref} asChild className={cn("group", className)} {...props}>
      {children ?? (
        <div className="flex w-full cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground">
          <SearchIcon className="size-4" />
          <p className="text-sm">{title}</p>
          <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </div>
      )}
    </CollapsibleTrigger>
  )
);
TaskTrigger.displayName = "TaskTrigger";

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;

export const TaskContent = React.forwardRef<HTMLDivElement, TaskContentProps>(
  ({ children, className, ...props }, ref) => (
    <CollapsibleContent
      ref={ref}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    >
      <div className="mt-4 space-y-2 border-muted border-l-2 pl-4">{children}</div>
    </CollapsibleContent>
  )
);
TaskContent.displayName = "TaskContent";
