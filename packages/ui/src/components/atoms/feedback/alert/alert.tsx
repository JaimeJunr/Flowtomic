import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/60 text-destructive [&>svg]:text-destructive bg-destructive/10 dark:bg-destructive/20",
        success:
          "border-success/60 text-success [&>svg]:text-success bg-success/10 dark:bg-success/20",
        warning:
          "border-warning/60 text-warning [&>svg]:text-warning bg-warning/10 dark:bg-warning/20",
        info: "border-info/60 text-info [&>svg]:text-info bg-info/10 dark:bg-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {}

export interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {}

/** Alert - Container principal do alert. */
function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
Alert.displayName = "Alert";

/**
 * Props do componente AlertTitle.
 */
export type AlertTitleProps = React.ComponentProps<"h5">;

/** AlertTitle - Título do alert. */
function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}
AlertTitle.displayName = "AlertTitle";

/**
 * Props do componente AlertDescription.
 */
export type AlertDescriptionProps = React.ComponentProps<"div">;

/** AlertDescription - Descrição do alert. */
function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
