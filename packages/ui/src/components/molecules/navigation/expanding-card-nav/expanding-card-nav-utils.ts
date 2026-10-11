export const BAR_HEIGHT = 60;
export const BOTTOM_GAP = 8;
export const MAX_GROUPS = 4;

export type CardTone = "primary" | "foreground" | "muted";

/** Altura da barra aberta: barra + conteúdo medido + respiro inferior. */
export function openHeight(contentHeight: number): number {
  if (!Number.isFinite(contentHeight) || contentHeight < 0) {
    throw new RangeError(
      `openHeight: received contentHeight ${contentHeight}, expected a finite number >= 0`
    );
  }
  return BAR_HEIGHT + contentHeight + BOTTOM_GAP;
}

export function assertGroupCount(count: number): void {
  if (count < 1 || count > MAX_GROUPS) {
    throw new RangeError(
      `ExpandingCardNav: received ${count} groups, expected between 1 and ${MAX_GROUPS}`
    );
  }
}

const TONE_CLASSES: Record<CardTone, string> = {
  primary: "bg-primary text-primary-foreground",
  foreground: "bg-foreground text-background",
  muted: "bg-muted text-foreground",
};

export function toneClasses(tone: CardTone = "muted"): string {
  return TONE_CLASSES[tone];
}

/** Atraso de entrada do cartão: escalonado ao abrir, simultâneo ao fechar. */
export function cardTransition(index: number, open: boolean, reduced: boolean) {
  if (reduced) return { duration: 0 };
  if (!open) return { duration: 0.2 };
  return { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay: 0.08 + index * 0.08 };
}
