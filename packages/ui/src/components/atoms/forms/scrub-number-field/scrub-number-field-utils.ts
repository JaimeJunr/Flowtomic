export type ScrubOptions = {
  step: number;
  /** Pixels por passo. */
  sensitivity: number;
  multiplier: number;
};

export type RangeOptions = { min: number; max: number; step: number };

/** Casas decimais que o passo define (0.25 -> 2). */
export function decimalsFromStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) {
    throw new RangeError(`invalid step: received step ${step}, expected a number greater than 0`);
  }
  const [, fraction = ""] = step.toString().split(".");
  return fraction.length;
}

/** Casas extras que o multiplicador fino exige; sempre pelo menos uma, para não cortar valor fracionário. */
function extraDecimals(multiplier: number): number {
  return multiplier < 1 ? Math.max(1, Math.ceil(-Math.log10(multiplier))) : 1;
}

export function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

/** Valor sem limitar: Δpassos = round(dx / sensitivity) * multiplier. Fine (<1) ganha casas extras. */
export function scrubValue(start: number, dx: number, options: ScrubOptions): number {
  const { step, sensitivity, multiplier } = options;
  if (!Number.isFinite(sensitivity) || sensitivity <= 0) {
    throw new RangeError(
      `invalid sensitivity: received sensitivity ${sensitivity}, expected a number greater than 0`
    );
  }
  const steps = Math.round(dx / sensitivity);
  const decimals = decimalsFromStep(step) + extraDecimals(multiplier);
  return roundTo(start + steps * multiplier * step, decimals);
}

/** Curva assintótica: o excesso é comprimido e nunca passa de `reach` além do limite. */
export function rubberBand(raw: number, min: number, max: number, reachPct: number): number {
  const reach = ((max - min) * reachPct) / 100;
  const limit = Math.min(Math.max(raw, min), max);
  if (raw === limit) return raw;
  if (reach <= 0) return limit;
  const excess = Math.abs(raw - limit);
  const stretched = reach * (1 - Math.exp(-excess / reach));
  return raw > limit ? limit + stretched : limit - stretched;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Aceita vírgula ou ponto; limita à faixa e arredonda ao passo. Inválido devolve o fallback. */
export function parseNumberInput(text: string, fallback: number, range: RangeOptions): number {
  const parsed = Number.parseFloat(text.trim().replace(",", "."));
  if (!Number.isFinite(parsed)) return fallback;
  const snapped = Math.round(parsed / range.step) * range.step;
  return roundTo(clamp(snapped, range.min, range.max), decimalsFromStep(range.step));
}

/** Um passo de teclado já limitado; fine ganha uma casa extra como no arrasto. */
export function nudgeValue(
  value: number,
  direction: 1 | -1,
  multiplier: number,
  range: RangeOptions
): number {
  const decimals = decimalsFromStep(range.step) + extraDecimals(multiplier);
  return clamp(
    roundTo(value + direction * multiplier * range.step, decimals),
    range.min,
    range.max
  );
}

export function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(".", ",");
}

/** O sinal negativo é o menos verdadeiro (U+2212), não o hífen. */
export function formatDelta(diff: number, decimals: number): string {
  const sign = diff < 0 ? "−" : "+";
  return `${sign}${formatNumber(Math.abs(diff), decimals)}`;
}
