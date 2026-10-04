/**
 * Artifact Component - Flowtomic UI
 *
 * Componente de artifact container com header e actions
 */

import { type LucideIcon, XIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../atoms";

export type ArtifactProps = ComponentProps<"div">;

export function Artifact({ className, ...props }: ArtifactProps) {
  return (
    <div
      data-slot="artifact"
      className={cn(
        "flex flex-col overflow-hidden rounded-[10px] border border-border bg-background",
        className
      )}
      {...props}
    />
  );
}
Artifact.displayName = "Artifact";

export type ArtifactHeaderProps = ComponentProps<"div">;

export function ArtifactHeader({ className, ...props }: ArtifactHeaderProps) {
  return (
    <div
      data-slot="artifact-header"
      className={cn(
        "flex items-center justify-between border-border border-b bg-surface px-4 py-3",
        className
      )}
      {...props}
    />
  );
}
ArtifactHeader.displayName = "ArtifactHeader";

export type ArtifactCloseProps = ComponentProps<typeof Button>;

export function ArtifactClose({
  className,
  children,
  size = "sm",
  variant = "ghost",
  ...props
}: ArtifactCloseProps) {
  return (
    <Button
      data-slot="artifact-close"
      aria-label="Fechar"
      className={cn("size-8 p-0 text-muted-foreground hover:text-foreground", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children ?? <XIcon className="size-4" />}
      <span className="sr-only">Fechar</span>
    </Button>
  );
}
ArtifactClose.displayName = "ArtifactClose";

export type ArtifactTitleProps = ComponentProps<"p">;

export function ArtifactTitle({ className, ...props }: ArtifactTitleProps) {
  return (
    <p
      data-slot="artifact-title"
      className={cn("font-medium text-foreground text-sm", className)}
      {...props}
    />
  );
}
ArtifactTitle.displayName = "ArtifactTitle";

export type ArtifactDescriptionProps = ComponentProps<"p">;

export function ArtifactDescription({ className, ...props }: ArtifactDescriptionProps) {
  return (
    <p
      data-slot="artifact-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
ArtifactDescription.displayName = "ArtifactDescription";

export type ArtifactActionsProps = ComponentProps<"div">;

export function ArtifactActions({ className, ...props }: ArtifactActionsProps) {
  return (
    <div
      data-slot="artifact-actions"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}
ArtifactActions.displayName = "ArtifactActions";

export type ArtifactActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
  icon?: LucideIcon;
};

export function ArtifactAction({
  tooltip,
  label,
  icon: Icon,
  children,
  className,
  size = "sm",
  variant = "ghost",
  ...props
}: ArtifactActionProps) {
  const button = (
    <Button
      data-slot="artifact-action"
      className={cn("size-8 p-0 text-muted-foreground hover:text-foreground", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {Icon ? <Icon className="size-4" /> : children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
ArtifactAction.displayName = "ArtifactAction";

export type ArtifactContentProps = ComponentProps<"div">;

export function ArtifactContent({ className, ...props }: ArtifactContentProps) {
  return (
    <div
      data-slot="artifact-content"
      className={cn("flex-1 overflow-auto p-4", className)}
      {...props}
    />
  );
}
ArtifactContent.displayName = "ArtifactContent";
