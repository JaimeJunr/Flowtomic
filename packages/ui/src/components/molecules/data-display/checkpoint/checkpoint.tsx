/**
 * Checkpoint Component - Flowtomic UI
 *
 * Componente de checkpoint display
 */

import { BookmarkIcon, type LucideProps } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Separator, Tooltip, TooltipContent, TooltipTrigger } from "../../../atoms";

export type CheckpointProps = HTMLAttributes<HTMLDivElement>;

export const Checkpoint = React.forwardRef<HTMLDivElement, CheckpointProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-0.5 text-muted-foreground overflow-hidden", className)}
      {...props}
    >
      {children}
      <Separator />
    </div>
  )
);
Checkpoint.displayName = "Checkpoint";

export type CheckpointIconProps = LucideProps;

export const CheckpointIcon = React.forwardRef<SVGSVGElement, CheckpointIconProps>(
  ({ className, children, ...props }, ref) =>
    children ?? <BookmarkIcon ref={ref} className={cn("size-4 shrink-0", className)} {...props} />
);
CheckpointIcon.displayName = "CheckpointIcon";

export type CheckpointTriggerProps = ComponentProps<typeof Button> & {
  tooltip?: string;
};

export const CheckpointTrigger = React.forwardRef<HTMLButtonElement, CheckpointTriggerProps>(
  ({ children, className, variant = "ghost", size = "sm", tooltip, ...props }, ref) =>
    tooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} size={size} type="button" variant={variant} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent align="start" side="bottom">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    ) : (
      <Button ref={ref} size={size} type="button" variant={variant} {...props}>
        {children}
      </Button>
    )
);
CheckpointTrigger.displayName = "CheckpointTrigger";
