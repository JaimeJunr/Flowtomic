/**
 * Checkpoint Component - Flowtomic UI
 *
 * Componente de checkpoint display
 */

import { BookmarkIcon, type LucideProps } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms";

export type CheckpointProps = HTMLAttributes<HTMLDivElement>;

export const Checkpoint = React.forwardRef<HTMLDivElement, CheckpointProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 overflow-hidden text-muted-foreground", className)}
      {...props}
    >
      <Separator className="flex-1" />
      {children}
      <Separator className="flex-1" />
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
  ({ children, className, variant = "ghost", size = "sm", tooltip, ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
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
);
CheckpointTrigger.displayName = "CheckpointTrigger";
