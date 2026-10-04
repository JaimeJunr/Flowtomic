/**
 * Suggestion Component - Flowtomic UI
 *
 * Componente de suggestions list com scroll
 */

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Button, ScrollArea, ScrollBar } from "../../../atoms";

export type SuggestionsProps = ComponentProps<typeof ScrollArea> & {
  /**
   * `scroll` (padrão): faixa de uma linha que rola de lado, acima do campo de mensagem.
   * `wrap`: quebra linha e centraliza, para o estado vazio da conversa.
   */
  layout?: "scroll" | "wrap";
};

export function Suggestions({
  className,
  children,
  layout = "scroll",
  ...props
}: SuggestionsProps) {
  if (layout === "wrap") {
    return (
      <div
        data-slot="suggestions"
        className={cn("flex flex-wrap items-center justify-center gap-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
      <div className={cn("flex w-max flex-nowrap items-center gap-2", className)}>{children}</div>
      {/* barra visível: sem ela, quem usa mouse não descobre as sugestões escondidas */}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
Suggestions.displayName = "Suggestions";

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export function Suggestion({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "default",
  children,
  ...props
}: SuggestionProps) {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button
      data-slot="suggestion"
      className={cn("cursor-pointer rounded-md px-4 shadow-none", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
}
Suggestion.displayName = "Suggestion";
