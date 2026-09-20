/**
 * TimeInput - Átomo para entrada de hora (input type="time").
 * Estilo consistente com o design system; aceita className e props nativas do input.
 * Quando disabled, um overlay cobre o input (bloqueia interação) sem usar disabled/readOnly,
 * para o ícone nativo do relógio permanecer visível.
 */

import React from "react";
import { cn } from "@/lib/utils";

const timeInputBaseClasses =
  "rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-w-[100px]";

const timeInputDisabledClasses = "bg-muted text-muted-foreground";

export interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Classes CSS adicionais */
  className?: string;
}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, disabled, onFocus, ...props }, ref) => {
    const isDisabled = Boolean(disabled);
    return (
      <span className="relative inline-block">
        <input
          type="time"
          className={cn(timeInputBaseClasses, isDisabled && timeInputDisabledClasses, className)}
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
TimeInput.displayName = "TimeInput";

export { TimeInput, timeInputBaseClasses, timeInputDisabledClasses };
