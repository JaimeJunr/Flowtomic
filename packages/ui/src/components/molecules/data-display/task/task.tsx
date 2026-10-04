/**
 * Task Component - Flowtomic UI
 *
 * Componente de task item com collapsible
 */

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../atoms";

export type TaskItemFileProps = ComponentProps<"div">;

export function TaskItemFile({ children, className, ...props }: TaskItemFileProps) {
  return (
    <div
      data-slot="task-item-file"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-secondary px-1.5 py-0.5 font-mono text-foreground text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
TaskItemFile.displayName = "TaskItemFile";

export type TaskItemProps = ComponentProps<"div">;

export function TaskItem({ children, className, ...props }: TaskItemProps) {
  return (
    <div
      data-slot="task-item"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}
TaskItem.displayName = "TaskItem";

export type TaskProps = ComponentProps<typeof Collapsible>;

export function Task({ defaultOpen = true, className, ...props }: TaskProps) {
  return (
    <Collapsible data-slot="task" className={cn(className)} defaultOpen={defaultOpen} {...props} />
  );
}
Task.displayName = "Task";

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title: string;
};

export function TaskTrigger({ children, className, title, ...props }: TaskTriggerProps) {
  return (
    <CollapsibleTrigger
      data-slot="task-trigger"
      asChild
      className={cn("group", className)}
      {...props}
    >
      {children ?? (
        <div className="flex w-full cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground">
          <SearchIcon className="size-4" />
          <p className="text-sm">{title}</p>
          <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </div>
      )}
    </CollapsibleTrigger>
  );
}
TaskTrigger.displayName = "TaskTrigger";

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;

export function TaskContent({ children, className, ...props }: TaskContentProps) {
  return (
    <CollapsibleContent
      data-slot="task-content"
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    >
      <div className="mt-4 space-y-2 border-muted border-l-2 pl-4">{children}</div>
    </CollapsibleContent>
  );
}
TaskContent.displayName = "TaskContent";
