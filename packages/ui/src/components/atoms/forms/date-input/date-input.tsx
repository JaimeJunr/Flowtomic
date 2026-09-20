/**
 * DateInput - Átomo para entrada de data (input type="date").
 * Estilo consistente com o design system; aceita className e props nativas do input.
 * Quando disabled, um overlay cobre o input (bloqueia interação) sem usar disabled/readOnly,
 * para o ícone nativo do calendário permanecer visível.
 */

import React from "react";
import { cn } from "@/lib/utils";

const dateInputBaseClasses =
  "rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-w-[140px]";

const dateInputDisabledClasses = "bg-muted text-muted-foreground";

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Classes CSS adicionais */
  className?: string;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, disabled, onFocus, ...props }, ref) => {
    const isDisabled = Boolean(disabled);
    return (
      <span className="relative inline-block">
        <input
          type="date"
          className={cn(dateInputBaseClasses, isDisabled && dateInputDisabledClasses, className)}
          ref={ref}
          tabIndex={isDisabled ? -1 : undefined}
          aria-disabled={isDisabled ? true : undefined}
          onFocus={isDisabled ? (e) => e.target.blur() : onFocus}
          {...props}
        />
        {isDisabled && (
          <span className="absolute inset-0 cursor-not-allowed rounded-md" aria-hidden />
        )}
      </span>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput, dateInputBaseClasses, dateInputDisabledClasses };
