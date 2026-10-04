/**
 * ButtonGroup - Molécula
 *
 * Componente composto que agrupa múltiplos botões relacionados
 * com estilização consistente e suporte a orientação horizontal/vertical
 */

import type * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonGroupProps extends React.ComponentProps<"fieldset"> {
  orientation?: "horizontal" | "vertical";
  /**
   * Se true, força todos os botões a terem a mesma largura
   * Útil para grupos de botões onde a consistência visual é importante
   */
  equalWidth?: boolean;
}

function ButtonGroup({
  className,
  orientation = "horizontal",
  equalWidth = false,
  ...props
}: ButtonGroupProps) {
  return (
    <fieldset
      data-slot="button-group"
      className={cn(
        "inline-flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        "[&>*:first-child]:rounded-r-none [&>*:first-child]:rounded-l-md",
        "[&>*:last-child]:rounded-l-none [&>*:last-child]:rounded-r-md",
        "[&>*:not(:first-child):not(:last-child)]:rounded-none",
        "[&>*:not(:first-child)]:-ml-px",
        orientation === "vertical" && "[&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:ml-0",
        "[&>*:hover]:z-10 [&>*:focus]:z-10",
        equalWidth && "[&>*]:flex-1 [&>*]:min-w-0",
        className
      )}
      {...props}
    />
  );
}
ButtonGroup.displayName = "ButtonGroup";

export interface ButtonGroupSeparatorProps extends React.ComponentProps<"hr"> {
  orientation?: "horizontal" | "vertical";
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <hr
      data-slot="button-group-separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border border-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      {...props}
    />
  );
}
ButtonGroupSeparator.displayName = "ButtonGroupSeparator";

export interface ButtonGroupTextProps extends React.ComponentProps<"div"> {}

function ButtonGroupText({ className, ...props }: ButtonGroupTextProps) {
  return (
    <div
      data-slot="button-group-text"
      className={cn("px-3 py-2 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
ButtonGroupText.displayName = "ButtonGroupText";

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
