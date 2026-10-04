/**
 * Checkpoint Component - Flowtomic UI
 *
 * Componente de checkpoint display
 */

import { BookmarkIcon, type LucideProps } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms";

export type CheckpointProps = ComponentProps<"div">;

export function Checkpoint({ className, children, ...props }: CheckpointProps) {
  return (
    <div
      data-slot="checkpoint"
      className={cn("flex items-center gap-2 overflow-hidden text-muted-foreground", className)}
      {...props}
    >
      <Separator className="flex-1" />
      {children}
      <Separator className="flex-1" />
    </div>
  );
}
Checkpoint.displayName = "Checkpoint";

export type CheckpointIconProps = LucideProps;

export function CheckpointIcon({ className, children, ...props }: CheckpointIconProps) {
  return (
    children ?? (
      <BookmarkIcon
        data-slot="checkpoint-icon"
        className={cn("size-4 shrink-0", className)}
        {...props}
      />
    )
  );
}
CheckpointIcon.displayName = "CheckpointIcon";

export type CheckpointTriggerProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};

export function CheckpointTrigger({
  children,
  className,
  variant = "ghost",
  size = "sm",
  tooltip,
  ...props
}: CheckpointTriggerProps) {
  const button = (
    <Button
      data-slot="checkpoint-trigger"
      className={cn("shrink-0 text-muted-foreground text-[13px]", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent align="start" side="bottom">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    button
  );
}
CheckpointTrigger.displayName = "CheckpointTrigger";
