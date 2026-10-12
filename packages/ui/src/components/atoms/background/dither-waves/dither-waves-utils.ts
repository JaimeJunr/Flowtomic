export const MAX_TRAIL = 12;
/** Depois disso exp(-idade * 2) já apagou o rastro a ponto de não aparecer. */
export const TRAIL_LIFETIME = 3;

/** Ponto do rastro em coordenadas normalizadas (0-1, y para cima) e instante no relógio do uTime. */
export type TrailPoint = { x: number; y: number; start: number };

export type DitherPattern = "bayer4" | "bayer8" | "lines";

const PATTERNS: readonly DitherPattern[] = ["bayer4", "bayer8", "lines"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Inteiro de 2 a 8 tons por canal. */
export function clampLevels(value: number): number {
  return clamp(Math.round(value), 2, 8);
}

/** Inteiro de 1 a 8: bloco fracionário borraria a grade. */
export function clampPixelSize(value: number): number {
  return clamp(Math.round(value), 1, 8);
}

export function clampContrast(value: number): number {
  return clamp(value, 0.5, 2);
}

/** Escala zero dividiria o domínio do ruído por zero. */
export function clampScale(value: number): number {
  return clamp(value, 0.1, 10);
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

export function patternIndex(pattern: DitherPattern): number {
  const index = PATTERNS.indexOf(pattern);
  if (index < 0) {
    throw new Error(
      `Received pattern ${JSON.stringify(pattern)}; expected one of ${PATTERNS.join(", ")}`
    );
  }
  return index;
}

// Quadrantes [topo-esq, topo-dir, base-esq, base-dir] da construção recursiva da matriz de Bayer.
const QUADRANT_OFFSET = [0, 2, 3, 1];

function bayerRank(x: number, y: number, size: number): number {
  if (size === 1) return 0;
  const half = size / 2;
  const quadrant = (y >= half ? 2 : 0) + (x >= half ? 1 : 0);
  return QUADRANT_OFFSET[quadrant] + 4 * bayerRank(x % half, y % half, half);
}

/** Limiar de 0 a 1 da célula (x, y) na matriz de Bayer n x n (4 ou 8); espelha o shader. */
export function bayerThreshold(x: number, y: number, n: number): number {
  if (n !== 4 && n !== 8) throw new Error(`Received matrix size ${n}; expected 4 or 8`);
  const cx = ((Math.floor(x) % n) + n) % n;
  const cy = ((Math.floor(y) % n) + n) % n;
  return bayerRank(cx, cy, n) / (n * n);
}

/** Acrescenta um ponto; ao passar de `max`, descarta o mais velho. */
export function pushTrail(
  list: readonly TrailPoint[],
  point: TrailPoint,
  max = MAX_TRAIL
): TrailPoint[] {
  const next = [...list, point];
  return next.length > max ? next.slice(next.length - max) : next;
}

/** Mantém só os pontos que ainda apagam alguma coisa. */
export function activeTrail(list: readonly TrailPoint[], time: number): TrailPoint[] {
  return list.filter((point) => time - point.start < TRAIL_LIFETIME);
}

/** Empacota o rastro como vec3[12] (x, y, instante) e a contagem de pontos vivos. */
export function trailUniforms(list: readonly TrailPoint[]): { data: Float32Array; count: number } {
  const data = new Float32Array(MAX_TRAIL * 3);
  const visible = list.slice(-MAX_TRAIL);
  visible.forEach((point, i) => {
    data[i * 3] = point.x;
    data[i * 3 + 1] = point.y;
    data[i * 3 + 2] = point.start;
  });
  return { data, count: visible.length };
}

type RectLike = { left: number; top: number; width: number; height: number };

/** Posição do ponteiro normalizada em 0-1, com y para cima (como o gl_FragCoord). */
export function pointerTarget(
  clientX: number,
  clientY: number,
  rect: RectLike
): { x: number; y: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: clamp((clientX - rect.left) / rect.width, 0, 1),
    y: clamp(1 - (clientY - rect.top) / rect.height, 0, 1),
  };
}

/** Pontilhado de CSS puro para quando não há WebGL. */
export function fallbackBackground(token: string): {
  backgroundImage: string;
  backgroundSize: string;
} {
  return {
    backgroundImage: `radial-gradient(circle, color-mix(in oklch, var(${token}) 40%, transparent) 1px, transparent 1.5px)`,
    backgroundSize: "4px 4px",
  };
}
