/**
 * AutocompleteContext - Context para Compound Components
 *
 * Fornece estado e helpers do hook useAutocomplete para subcomponentes
 */

import type { AutocompleteOption, UseAutocompleteReturn } from "@flowtomic/logic";
import * as React from "react";

export interface AutocompleteContextValue extends UseAutocompleteReturn {
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  maxListboxHeight?: string;
  emptyMessage?: string;
  /** Itens extraídos dos children (modo composição), antes do filtro da busca */
  composedItems?: AutocompleteOption[];
}

export const AutocompleteContext = React.createContext<AutocompleteContextValue | undefined>(
  undefined
);

export function useAutocompleteContext(): AutocompleteContextValue {
  const context = React.useContext(AutocompleteContext);
  if (!context) {
    throw new Error("useAutocompleteContext must be used within Autocomplete component");
  }
  return context;
}
