/**
 * Suggestion Component - Flowtomic UI
 *
 * Componente de suggestions list com scroll
 */

import type { ComponentProps } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ScrollArea, ScrollBar } from "../../../atoms";

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = React.forwardRef<React.ElementRef<typeof ScrollArea>, SuggestionsProps>(
  ({ className, children, ...props }, ref) => (
    <ScrollArea ref={ref} className="w-full overflow-x-auto whitespace-nowrap" {...props}>
      <div className={cn("flex w-max flex-nowrap items-center gap-2", className)}>{children}</div>
      <ScrollBar className="hidden" orientation="horizontal" />
    </ScrollArea>
  )
);
Suggestions.displayName = "Suggestions";

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(
  (
    { suggestion, onClick, className, variant = "outline", size = "sm", children, ...props },
    ref
  ) => {
    const handleClick = () => {
      onClick?.(suggestion);
    };

    return (
      <Button
        ref={ref}
        className={cn("cursor-pointer rounded-full px-4", className)}
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
);
Suggestion.displayName = "Suggestion";
