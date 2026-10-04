/**
 * AutocompleteSection - Seção de agrupamento de items
 *
 * Subcomponente para modo composição
 */

import type * as React from "react";
import { cn } from "@/lib/utils";

export interface AutocompleteSectionProps extends React.ComponentProps<"div"> {
  /**
   * Título da seção
   */
  title?: string;

  /**
   * Conteúdo da seção (items)
   */
  children?: React.ReactNode;
}

function AutocompleteSection({ className, title, children, ...props }: AutocompleteSectionProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Agrupamento em menu de autocomplete
    <div
      data-slot="autocomplete-section"
      {...props}
      className={cn("space-y-1", className)}
      role="group"
      aria-label={title}
    >
      {title && (
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{title}</div>
      )}
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

AutocompleteSection.displayName = "AutocompleteSection";

export { AutocompleteSection };
