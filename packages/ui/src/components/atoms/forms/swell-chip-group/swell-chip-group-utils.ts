import type * as React from "react";

export type SwellChipItem =
  | string
  | { value: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean };

export type NormalizedChip = {
  value: string;
  label: React.ReactNode;
  icon: React.ReactNode | undefined;
  disabled: boolean;
};

const SPRING_STIFFNESS = 320;

export function normalizeItems(items: SwellChipItem[]): NormalizedChip[] {
  return items.map((item) =>
    typeof item === "string"
      ? { value: item, label: item, icon: undefined, disabled: false }
      : { value: item.value, label: item.label, icon: item.icon, disabled: item.disabled ?? false }
  );
}

/** Deslocamento em X do chip: 0 para o escolhido; os demais fogem dele (esquerda negativo, direita positivo). */
export function neighbourOffset(
  index: number,
  selectedIndex: number,
  selectedWidth: number,
  swell: number,
  push: number
): number {
  if (index === selectedIndex) return 0;
  const distance = (selectedWidth * swell) / 2 + push;
  return index < selectedIndex ? -distance : distance;
}

/** Atraso em ms da cascata: cresce com a distância até o escolhido. */
export function staggerDelayMs(index: number, selectedIndex: number, staggerMs: number): number {
  return Math.abs(index - selectedIndex) * staggerMs;
}

export function springStiffness(): number {
  return SPRING_STIFFNESS;
}

/** bounce 0 = amortecimento crítico (seco); quanto maior o bounce, menor o amortecimento e mais oscila. */
export function springDamping(bounce: number): number {
  if (!(bounce >= 0 && bounce <= 1)) {
    throw new Error(`springDamping: received bounce ${bounce}, expected a number between 0 and 1`);
  }
  return 2 * Math.sqrt(SPRING_STIFFNESS) * (1 - bounce);
}
