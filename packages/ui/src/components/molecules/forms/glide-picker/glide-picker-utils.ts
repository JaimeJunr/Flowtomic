import type * as React from "react";

export type GlidePickerOptionObject = {
  value: string;
  label: React.ReactNode;
  tag?: string;
};

export type GlidePickerOptionInput = string | GlidePickerOptionObject;

/** Aceita string pura ou objeto; sempre devolve o objeto. */
export function normalizeOption(option: GlidePickerOptionInput): GlidePickerOptionObject {
  if (typeof option === "string") return { value: option, label: option };
  if (typeof option?.value !== "string") {
    throw new TypeError(
      `invalid option: received ${JSON.stringify(option)}, expected a string or { value: string; label: ReactNode; tag?: string }`
    );
  }
  return option;
}

/** A saída leva 2/3 do tempo da entrada. */
export function exitDuration(popMs: number): number {
  return (popMs * 2) / 3;
}

/**
 * Linha onde a pílula deve estar: a destacada agora; senão, com `remember`,
 * a última que foi destacada; senão, a escolhida (null = sem pílula).
 */
export function pillTarget(
  highlightedIndex: number | null,
  selectedIndex: number | null,
  remember: boolean,
  lastIndex: number | null
): number | null {
  if (highlightedIndex !== null) return highlightedIndex;
  if (remember && lastIndex !== null) return lastIndex;
  return selectedIndex;
}
