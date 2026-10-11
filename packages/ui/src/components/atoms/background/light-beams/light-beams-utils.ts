export type LightBeamsOrigin =
  | "top-center"
  | "top-left"
  | "top-right"
  | "left"
  | "right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right";

export type OriginPoint = {
  /** Posição em uv (0-1, y para cima), sempre um pouco fora da área. */
  x: number;
  y: number;
  /** Vetor da origem para o centro (0.5, 0.5). */
  dirX: number;
  dirY: number;
};

/** Giro máximo do leque, em radianos, quando o ponteiro chega à borda. */
export const maxPointerAngle = 0.25;

const OUT = 0.08;
const POINTS: Record<LightBeamsOrigin, [number, number]> = {
  "top-center": [0.5, 1 + OUT],
  "top-left": [0, 1 + OUT],
  "top-right": [1, 1 + OUT],
  left: [-OUT, 0.6],
  right: [1 + OUT, 0.6],
  "bottom-center": [0.5, -OUT],
  "bottom-left": [0, -OUT],
  "bottom-right": [1, -OUT],
};

export function originPoint(origin: LightBeamsOrigin): OriginPoint {
  const point = POINTS[origin];
  if (!point) {
    throw new Error(
      `Received origin ${JSON.stringify(origin)}; expected one of ${Object.keys(POINTS).join(", ")}`
    );
  }
  const [x, y] = point;
  return { x, y, dirX: Math.round((0.5 - x) * 1e6) / 1e6, dirY: Math.round((0.5 - y) * 1e6) / 1e6 };
}

export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

/** Ângulo-alvo do leque para o x normalizado (0-1) do ponteiro. */
export function pointerAngle(x: number): number {
  return (clampUnit(x) - 0.5) * 2 * maxPointerAngle;
}

/** Aproxima `current` de `target` por `factor` a cada quadro; encosta quando está muito perto. */
export function stepToward(current: number, target: number, factor: number): number {
  const next = current + (target - current) * factor;
  return Math.abs(target - next) < 0.0005 ? target : next;
}

function percent(value: number): string {
  return `${Math.round(value * 10000) / 100}%`;
}

/** Gradiente radial que parte da origem, para quando não há WebGL. */
export function fallbackBackground(token: string, origin: LightBeamsOrigin): string {
  const { x, y } = originPoint(origin);
  const tint = `color-mix(in oklch, var(${token}) 35%, transparent)`;
  return `radial-gradient(circle at ${percent(x)} ${percent(1 - y)}, ${tint}, transparent 70%)`;
}
