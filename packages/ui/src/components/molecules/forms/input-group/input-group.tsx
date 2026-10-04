/**
 * InputGroup Component - Flowtomic UI
 *
 * Componente para agrupar inputs com addons e botões
 */

import type * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../../../atoms";

export type InputGroupProps = React.ComponentProps<"div">;
export type InputGroupAddonProps = React.ComponentProps<"div"> & {
  align?: "block-start" | "block-end" | "inline-start" | "inline-end";
};
export type InputGroupButtonProps = ButtonProps;
export type InputGroupTextareaProps = React.ComponentProps<"textarea">;

/**
 * InputGroup - Container principal do input group
 */
function InputGroup({ className, children, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        // addon de bloco (cabeçalho/rodapé) empilha o grupo: campo numa linha, barra na outra
        "has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:flex-col",
        "has-[>[data-align=block-end]]:items-stretch has-[>[data-align=block-start]]:items-stretch",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
InputGroup.displayName = "InputGroup";

/**
 * InputGroupAddon - Addon do input group (para ícones, prefixos, sufixos)
 */
function InputGroupAddon({
  className,
  align = "inline-start",
  children,
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex items-center",
        align === "block-start" && "order-first w-full",
        align === "block-end" && "order-last w-full",
        align === "inline-start" && "order-first",
        align === "inline-end" && "order-last",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
InputGroupAddon.displayName = "InputGroupAddon";

/**
 * InputGroupButton - Botão do input group
 */
function InputGroupButton({ className, ...props }: InputGroupButtonProps) {
  return <Button data-slot="input-group-button" className={cn("shrink-0", className)} {...props} />;
}
InputGroupButton.displayName = "InputGroupButton";

/**
 * InputGroupTextarea - Textarea do input group
 */
function InputGroupTextarea({ className, ...props }: InputGroupTextareaProps) {
  return (
    <textarea
      data-slot="input-group-textarea"
      className={cn(
        "flex-1 resize-none bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
InputGroupTextarea.displayName = "InputGroupTextarea";

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea };
