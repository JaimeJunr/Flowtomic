export type Rect = { left: number; top: number; width: number; height: number };
export type EdgeState = { angle: number; proximity: number };

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

function assertRect(rect: Rect): void {
  if (!(rect.width > 0) || !(rect.height > 0)) {
    throw new Error(
      `edgeState: received width: ${rect.width}, height: ${rect.height}, expected width and height > 0`
    );
  }
}

/** Distância do ponteiro ao retângulo: negativa dentro (até a borda), positiva fora. */
function signedDistance(rect: Rect, x: number, y: number): number {
  const dx = Math.max(rect.left - x, x - (rect.left + rect.width), 0);
  const dy = Math.max(rect.top - y, y - (rect.top + rect.height), 0);
  const outside = Math.hypot(dx, dy);
  if (outside > 0) return outside;
  const inside = Math.min(
    x - rect.left,
    rect.left + rect.width - x,
    y - rect.top,
    rect.top + rect.height - y
  );
  return -inside;
}

/**
 * Ângulo do centro até o ponteiro (0 = topo, horário, como `conic-gradient(from ...)`)
 * e proximidade 0..1 da borda mais próxima. Fora do cartão a proximidade cai até 0
 * em `reach` px; dentro, em `sensitivity`% da metade do menor lado.
 */
export function edgeState(
  rect: Rect,
  x: number,
  y: number,
  sensitivity: number,
  reach = 0
): EdgeState {
  assertRect(rect);
  const dx = x - (rect.left + rect.width / 2);
  const dy = y - (rect.top + rect.height / 2);
  const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  const distance = signedDistance(rect, x, y);
  if (distance > 0) {
    return { angle, proximity: reach > 0 ? 1 - clamp01(distance / reach) : 0 };
  }
  const zone = (sensitivity / 100) * (Math.min(rect.width, rect.height) / 2);
  return { angle, proximity: zone > 0 ? 1 - clamp01(-distance / zone) : 0 };
}

type RangeProps = { edgeSensitivity: number; coneSpread: number; intensity: number };

function assertRange(name: string, value: number, min: number, max: number): void {
  if (!(value >= min && value <= max)) {
    throw new Error(
      `EdgeGlowCard ${name}: received ${JSON.stringify(value)}, expected a number between ${min} and ${max}`
    );
  }
}

export function validateEdgeGlowProps(props: RangeProps): void {
  assertRange("edgeSensitivity", props.edgeSensitivity, 0, 100);
  assertRange("coneSpread", props.coneSpread, 5, 45);
  assertRange("intensity", props.intensity, 0.1, 3);
}

/** `coneSpread` (%) vira a meia-abertura do cone em graus. */
export const spreadDegrees = (coneSpread: number): number => coneSpread * 1.8;

const round = (v: number): number => Math.round(v * 100) / 100;

export function coneMask(spread: number): string {
  // Bordas do cone em degradê: com corte seco, o halo desfocado vira uma cunha de lados duros.
  return `conic-gradient(from calc(var(--angle) - ${spread}deg), transparent 0deg, black ${round(spread * 0.6)}deg, black ${round(spread * 1.4)}deg, transparent ${spread * 2}deg)`;
}

// accent e secondary ficam escuros no modo escuro e apagavam o anel; o primary clareado com o
// foreground acende nos dois temas.
export const RING_GRADIENT =
  "conic-gradient(var(--primary), color-mix(in oklch, var(--primary), var(--foreground) 45%), var(--primary), color-mix(in oklch, var(--primary), var(--foreground) 25%), var(--primary))";

export const ringOpacity = (intensity: number): string =>
  `min(1, calc(var(--proximity) * ${intensity}))`;

export const glowOpacity = (intensity: number): string =>
  `min(1, calc(var(--proximity) * ${intensity} * 0.9))`;

// Recorta o fundo para sobrar só o anel (content-box menos border-box).
export const RING_MASK_STYLE = {
  maskImage: "linear-gradient(black 0 0), linear-gradient(black 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: "linear-gradient(black 0 0), linear-gradient(black 0 0)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
} as const;
