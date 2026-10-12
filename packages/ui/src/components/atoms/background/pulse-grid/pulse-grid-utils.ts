export const MAX_RIPPLES = 8;
/** Depois disso a onda já decaiu (exp(-age * 1.2)) a ponto de não aparecer. */
export const RIPPLE_LIFETIME = 6;

/** Onda em coordenadas normalizadas (0-1, y para cima, como o gl_FragCoord). */
export type Ripple = { x: number; y: number; start: number; strength: number };

export type RippleUniforms = {
  positions: Float32Array;
  strengths: Float32Array;
  count: number;
};

export type PulseGridVariant = "lines" | "dots" | "cross";

const VARIANTS: readonly PulseGridVariant[] = ["lines", "dots", "cross"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampUnit(value: number): number {
  return clamp(value, 0, 1);
}

export function clampCellSize(value: number): number {
  return clamp(value, 8, 200);
}

export function clampLineWidth(value: number): number {
  return clamp(value, 0.5, 4);
}

export function clampRippleStrength(value: number): number {
  return clamp(value, 0, 2);
}

export function assertColorToken(token: string): void {
  if (!token.startsWith("--")) {
    throw new Error(`Received token ${JSON.stringify(token)}; expected format "--token-name"`);
  }
}

export function variantIndex(variant: PulseGridVariant): number {
  const index = VARIANTS.indexOf(variant);
  if (index < 0) {
    throw new Error(
      `Received variant ${JSON.stringify(variant)}; expected one of ${VARIANTS.join(", ")}`
    );
  }
  return index;
}

/** Acrescenta uma onda; ao passar de `max`, descarta a mais velha. */
export function pushRipple(list: readonly Ripple[], ripple: Ripple, max = MAX_RIPPLES): Ripple[] {
  const next = [...list, ripple];
  return next.length > max ? next.slice(next.length - max) : next;
}

/** Mantém só as ondas que ainda têm o que mostrar. */
export function activeRipples(list: readonly Ripple[], time: number): Ripple[] {
  return list.filter((ripple) => time - ripple.start < RIPPLE_LIFETIME);
}

/** Ondas automáticas vencidas até `time`, e o instante da próxima. Intervalo 0 desliga. */
export function dueAutoRipples(
  nextAt: number,
  time: number,
  interval: number
): { starts: number[]; next: number } {
  if (!(interval > 0)) return { starts: [], next: nextAt };
  const starts: number[] = [];
  let next = nextAt;
  // Aba parada por muito tempo: não solta uma rajada de ondas atrasadas.
  if (time - next > MAX_RIPPLES * interval) next = time;
  while (next <= time) {
    starts.push(next);
    next += interval;
  }
  return { starts, next };
}

/** Empacota as ondas vivas nos arrays de uniforms, em pixels de dispositivo. */
export function rippleUniforms(
  list: readonly Ripple[],
  width: number,
  height: number
): RippleUniforms {
  const positions = new Float32Array(MAX_RIPPLES * 3);
  const strengths = new Float32Array(MAX_RIPPLES);
  const visible = list.slice(-MAX_RIPPLES);
  visible.forEach((ripple, i) => {
    positions[i * 3] = ripple.x * width;
    positions[i * 3 + 1] = ripple.y * height;
    positions[i * 3 + 2] = ripple.start;
    strengths[i] = ripple.strength;
  });
  return { positions, strengths, count: visible.length };
}

/** Pixels de dispositivo por pixel CSS; o jsdom mede 0 e cai no devicePixelRatio. */
export function deviceScale(canvasWidth: number, clientWidth: number, ratio: number): number {
  return clientWidth > 0 ? canvasWidth / clientWidth : ratio;
}

/** Aproxima `current` de `target` por `factor` a cada quadro; encosta quando está muito perto. */
export function stepToward(current: number, target: number, factor: number): number {
  const next = current + (target - current) * factor;
  return Math.abs(target - next) < 0.0005 ? target : next;
}

type RectLike = { left: number; top: number; width: number; height: number };

/** Posição do ponteiro normalizada em 0-1, com y para cima (como o gl_FragCoord). */
export function pointerTarget(
  clientX: number,
  clientY: number,
  rect: RectLike
): { x: number; y: number } | null {
  if (rect.width === 0 || rect.height === 0) return null;
  return {
    x: clampUnit((clientX - rect.left) / rect.width),
    y: clampUnit(1 - (clientY - rect.top) / rect.height),
  };
}

/** Grade de CSS puro para quando não há WebGL. */
export function fallbackBackground(token: string, cellSize: number): CSSBackground {
  const line = `color-mix(in oklch, var(${token}) 15%, transparent)`;
  const size = clampCellSize(cellSize);
  return {
    backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
  };
}

type CSSBackground = { backgroundImage: string; backgroundSize: string };
