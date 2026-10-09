export type GenerationStatus = "queued" | "generating" | "refining" | "complete" | "error";

export type StageStyle = {
  blur: number;
  saturate: number;
  opacity: number;
  scale: number;
};

export const STAGE_STYLE: Record<GenerationStatus, StageStyle> = {
  queued: { blur: 24, saturate: 0.2, opacity: 0.35, scale: 1.06 },
  generating: { blur: 14, saturate: 0.5, opacity: 0.7, scale: 1.04 },
  refining: { blur: 4, saturate: 0.85, opacity: 0.95, scale: 1.01 },
  complete: { blur: 0, saturate: 1, opacity: 1, scale: 1 },
  error: { blur: 8, saturate: 0, opacity: 0.4, scale: 1 },
};

export const DEFAULT_LABELS: Record<GenerationStatus, string> = {
  queued: "Na fila",
  generating: "Gerando",
  refining: "Refinando",
  complete: "Pronta",
  error: "Falhou",
};

/** Valor do `filter` CSS do estágio: o motion interpola os dois números entre estágios. */
export function stageFilter(status: GenerationStatus): string {
  const { blur, saturate } = STAGE_STYLE[status];
  return `blur(${blur}px) saturate(${saturate})`;
}

/** Estágios em que a imagem ainda está sendo produzida (faixa, aria-busy e pontinho pulsando). */
export function isWorking(status: GenerationStatus): boolean {
  return status === "queued" || status === "generating" || status === "refining";
}

export function assertStageMs(stageMs: number): void {
  if (!(stageMs >= 0)) {
    throw new Error(`GenerationFrame: received stageMs ${stageMs}, expected a number >= 0`);
  }
}
