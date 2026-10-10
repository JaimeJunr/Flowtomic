export type SparkEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

export type SparkGeometry = {
  sparkSize: number;
  sparkRadius: number;
  extraScale: number;
};

export type SparkSegment = { x1: number; y1: number; x2: number; y2: number };

/** `startedAt` fica nulo até o primeiro quadro: assim o relógio é o mesmo do rAF. */
export type Spark = { x: number; y: number; startedAt: number | null };

const EASINGS: Record<SparkEasing, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t,
  "ease-out": (t) => t * (2 - t),
  "ease-in-out": (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

export function applyEasing(easing: SparkEasing, t: number): number {
  return EASINGS[easing](Math.min(1, Math.max(0, t)));
}

/** Ângulo do traço `index` entre `count` traços igualmente espaçados. */
export function sparkAngle(index: number, count: number): number {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(
      `sparkAngle: received sparkCount ${JSON.stringify(count)}, expected an integer >= 1`
    );
  }
  return (2 * Math.PI * index) / count;
}

/** Segmento do traço (relativo ao ponto do clique) para o progresso `p` já suavizado. */
export function sparkSegment(angle: number, p: number, opts: SparkGeometry): SparkSegment {
  const start = p * opts.sparkRadius * opts.extraScale;
  const end = start + opts.sparkSize * (1 - p);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x1: start * cos, y1: start * sin, x2: end * cos, y2: end * sin };
}

/**
 * O canvas não entende `var(--primary)`; um elemento com `color` resolve o token
 * pelo estilo computado.
 */
export function resolveCssColor(host: HTMLElement, value: string): string {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  host.removeChild(probe);
  return resolved || value;
}
