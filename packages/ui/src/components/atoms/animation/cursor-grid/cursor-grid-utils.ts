export type FalloffKind = "linear" | "smooth" | "sharp";

export type GridCell = { index: number; col: number; row: number; dist: number };

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

const CURVES: Record<FalloffKind, (t: number) => number> = {
  linear: (t) => t,
  smooth: (t) => t * t * (3 - 2 * t),
  sharp: (t) => t * t * t,
};

/** Converte a proximidade `t` (0 na borda do raio, 1 no ponteiro) em brilho. */
export function falloffCurve(kind: FalloffKind, t: number): number {
  return CURVES[kind](clamp01(t));
}

/** Cai do pico a 0: fica parado até `holdTime` e depois desce linear em `fadeDuration`. */
export function cellAlpha(
  peak: number,
  elapsed: number,
  holdTime: number,
  fadeDuration: number
): number {
  if (elapsed <= holdTime) return peak;
  if (fadeDuration <= 0) return 0;
  return Math.max(0, peak * (1 - (elapsed - holdTime) / fadeDuration));
}

export function gridSize(
  width: number,
  height: number,
  cellSize: number
): { cols: number; rows: number } {
  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    throw new Error(
      `gridSize: received cellSize ${JSON.stringify(cellSize)}, expected a number > 0`
    );
  }
  return { cols: Math.ceil(width / cellSize), rows: Math.ceil(height / cellSize) };
}

/** Células da grade cujo centro está dentro de `radius` do ponto `p`. */
export function cellsInRadius(
  cols: number,
  rows: number,
  cellSize: number,
  p: { x: number; y: number },
  radius: number
): GridCell[] {
  const first = (v: number) => Math.max(0, Math.floor((v - radius) / cellSize));
  const last = (v: number, max: number) => Math.min(max - 1, Math.floor((v + radius) / cellSize));
  const cells: GridCell[] = [];
  for (let row = first(p.y); row <= last(p.y, rows); row++) {
    for (let col = first(p.x); col <= last(p.x, cols); col++) {
      const dist = Math.hypot((col + 0.5) * cellSize - p.x, (row + 0.5) * cellSize - p.y);
      if (dist < radius) cells.push({ index: row * cols + col, col, row, dist });
    }
  }
  return cells;
}

export function pulseRadius(speed: number, elapsedMs: number): number {
  return (speed * elapsedMs) / 1000;
}

/** `dist` é a distância do centro da célula à origem do pulso. */
export function pulseHitsCell(radius: number, dist: number, cellSize: number): boolean {
  return Math.abs(dist - radius) < cellSize / 2;
}

export function isPulseDone(radius: number, width: number, height: number): boolean {
  return radius > Math.hypot(width, height);
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
