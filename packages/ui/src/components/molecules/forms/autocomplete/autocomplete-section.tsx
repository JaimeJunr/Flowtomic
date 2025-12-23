/**
 * AutocompleteSection - Seção de agrupamento de items
 *
 * Subcomponente para modo composição
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutocompleteSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Título da seção
   */
  title?: string;

  /**
   * Conteúdo da seção (items)
   */
  children?: React.ReactNode;
}

const AutocompleteSection = React.forwardRef<HTMLDivElement, AutocompleteSectionProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn("space-y-1", className)}
        role="group"
        aria-label={title}
      >
        {title && (
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{title}</div>
        )}
        <ul role="group" className="space-y-0.5">
          {children}
        </ul>
      </div>
    );
  }
);

AutocompleteSection.displayName = "AutocompleteSection";

export { AutocompleteSection };
