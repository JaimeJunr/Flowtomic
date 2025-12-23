/**
 * AutocompleteItem - Item da lista de opções
 *
 * Subcomponente para modo composição
 */

import type { AutocompleteOption } from "flowtomic/logic";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useAutocompleteContext } from "./autocomplete-context";

export interface AutocompleteItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /**
   * Valor do item
   */
  value: string;

  /**
   * Se o item está desabilitado
   */
  disabled?: boolean;

  /**
   * Conteúdo do item
   */
  children?: React.ReactNode;
}

const AutocompleteItem = React.forwardRef<HTMLLIElement, AutocompleteItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const context = useAutocompleteContext();

    // Encontrar o item correspondente
    const item = context.filteredItems.find((i: AutocompleteOption) => i.value === value);

    if (!item) {
      // Se não encontrou, criar um item temporário para composição
      const tempItem = {
        value,
        label: typeof children === "string" ? children : value,
        disabled,
      };

      const itemProps = context.getItemProps(tempItem, {
        ...props,
        className,
      });

      return (
        <li {...itemProps} ref={ref} className={cn("cursor-pointer px-2 py-1.5", className)}>
          {children || value}
        </li>
      );
    }

    const itemProps = context.getItemProps(item, {
      ...props,
      className,
    });

    return (
      <li
        {...itemProps}
        ref={ref}
        className={cn(
          "cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          "hover:bg-accent focus:bg-accent",
          item.disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        {children || item.label}
      </li>
    );
  }
);

AutocompleteItem.displayName = "AutocompleteItem";

export { AutocompleteItem };
