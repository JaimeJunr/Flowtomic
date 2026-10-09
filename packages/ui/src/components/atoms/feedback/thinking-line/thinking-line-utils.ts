const ONE_DECIMAL = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const DEFAULT_SETTLED_LABEL = "Pensamento concluído";

/** Formata segundos como "2,7 s" (pt-BR, uma casa decimal). */
export function formatThought(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(
      `invalid seconds: received ${seconds}, expected a finite non-negative number`
    );
  }
  return `${ONE_DECIMAL.format(seconds)} s`;
}

type SettledTextInput = { doneLabel: string; showTimer: boolean; seconds: number };

/** Texto exibido depois de assentar: doneLabel > "Pensou por X s" > texto genérico. */
export function settledLabel({ doneLabel, showTimer, seconds }: SettledTextInput): string {
  if (doneLabel) return doneLabel;
  return showTimer ? `Pensou por ${formatThought(seconds)}` : DEFAULT_SETTLED_LABEL;
}

/** Versão falada: "Pensou por 2,7 segundos". */
export function settledAnnouncement({ doneLabel, showTimer, seconds }: SettledTextInput): string {
  if (doneLabel) return doneLabel;
  if (!showTimer) return DEFAULT_SETTLED_LABEL;
  return `Pensou por ${formatThought(seconds).replace(/ s$/, " segundos")}`;
}

/** Assenta quando `working` é false ou quando o relógio alcança `settleAfterS` (> 0). */
export function hasSettled(input: {
  working: boolean;
  settleAfterS: number;
  seconds: number;
}): boolean {
  if (!input.working) return true;
  return input.settleAfterS > 0 && input.seconds >= input.settleAfterS;
}
