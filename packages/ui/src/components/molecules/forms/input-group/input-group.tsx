/**
 * InputGroup Component - Flowtomic UI
 *
 * Componente para agrupar inputs com addons e botões
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../../../atoms";

export type InputGroupProps = React.HTMLAttributes<HTMLDivElement>;
export type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "block-start" | "block-end" | "inline-start" | "inline-end";
};
export type InputGroupButtonProps = ButtonProps;
export type InputGroupTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * InputGroup - Container principal do input group
 */
const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
InputGroup.displayName = "InputGroup";

/**
 * InputGroupAddon - Addon do input group (para ícones, prefixos, sufixos)
 */
const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        align === "block-start" && "self-start",
        align === "block-end" && "self-end",
        align === "inline-start" && "order-first",
        align === "inline-end" && "order-last",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
InputGroupAddon.displayName = "InputGroupAddon";

/**
 * InputGroupButton - Botão do input group
 */
const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} className={cn("shrink-0", className)} {...props} />
  )
);
InputGroupButton.displayName = "InputGroupButton";

/**
 * InputGroupTextarea - Textarea do input group
 */
const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, InputGroupTextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex-1 resize-none bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
InputGroupTextarea.displayName = "InputGroupTextarea";

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea };
