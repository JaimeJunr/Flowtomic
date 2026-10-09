export type SpotlightShape = "circle" | "beam";

type RectEdges = { left: number; top: number; right: number; bottom: number };

/** Stops do gradiente em %: cor cheia até `solid`, some até `end`. softness 0 cola os dois (borda nítida). */
export function gradientStops(softness: number): { solid: number; end: number } {
  if (Number.isNaN(softness)) {
    throw new Error("gradientStops: received NaN, expected a number between 0 and 1");
  }
  const clamped = Math.min(1, Math.max(0, softness));
  return { solid: Math.round((1 - clamped) * 100), end: 100 };
}

/** 1 dentro do retângulo, caindo linear até 0 na distância `proximity`. */
export function proximityFade(rect: RectEdges, x: number, y: number, proximity: number): number {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return 1;
  if (proximity <= 0) return 0;
  return Math.max(0, 1 - distance / proximity);
}

// Constante de tempo (ms) por unidade de smoothing: 0,3 dá ~120 ms de atraso.
const FOLLOW_TAU_MS = 400;

/** Passo exponencial até o alvo, independente da taxa de quadros. smoothing 0 = gruda. */
export function follow(current: number, target: number, smoothing: number, dt: number): number {
  if (smoothing <= 0) return target;
  const alpha = 1 - Math.exp(-Math.max(0, dt) / (smoothing * FOLLOW_TAU_MS));
  return current + (target - current) * alpha;
}

const BEAM_TILT = 0.6;

/** Feixe de palco: elipse alta e estreita ancorada no topo, deslocada em direção ao ponteiro. */
export function beamGradient(
  x: number,
  _y: number,
  width: number,
  height: number
): { anchorX: number; radiusX: number; radiusY: number } {
  return {
    anchorX: width / 2 + (x - width / 2) * BEAM_TILT,
    radiusX: Math.max(width * 0.18, 24),
    radiusY: height * 1.1,
  };
}

const AMBIENT_CYCLE_MS = 12000;
const AMBIENT_REACH = 0.35;

/** Curva de Lissajous lenta (ciclo de 12 s) que mantém a luz dentro do cartão. */
export function ambientPosition(timeMs: number, width: number, height: number) {
  const phase = (2 * Math.PI * timeMs) / AMBIENT_CYCLE_MS;
  return {
    x: width / 2 + Math.sin(phase) * width * AMBIENT_REACH,
    y: height / 2 + Math.sin(2 * phase + Math.PI / 2) * height * AMBIENT_REACH,
  };
}

export type SpotlightTone = "brand" | "neutral";

/**
 * Cor da luz, sempre por token. O neutro (primeiro plano do tema) vira mancha cinza no modo
 * claro; por isso o padrão é o tom da marca (medido no Storybook em 09/10/2026).
 */
export function lightColor(percentExpression: string, tone: SpotlightTone = "brand"): string {
  const token = tone === "brand" ? "var(--primary)" : "var(--foreground)";
  return `color-mix(in oklab, ${token} ${percentExpression}, transparent)`;
}

export function lightGradient(shape: SpotlightShape, softness: number, color: string): string {
  const { solid, end } = gradientStops(softness);
  const stops = `${color} 0%, ${color} ${solid}%, transparent ${end}%`;
  return shape === "beam"
    ? `radial-gradient(ellipse var(--brx) var(--bry) at var(--bx) 0px, ${stops})`
    : `radial-gradient(circle var(--ss) at var(--sx) var(--sy), ${stops})`;
}

const MASK_LAYER = "linear-gradient(currentColor, currentColor)";

/** Recorta a camada só na borda de 1px: miolo (content-box) subtraído do todo. */
export const BORDER_MASK_STYLE = {
  maskImage: `${MASK_LAYER}, ${MASK_LAYER}`,
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
  WebkitMaskImage: `${MASK_LAYER}, ${MASK_LAYER}`,
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
} as const;

type PointerListener = (clientX: number, clientY: number) => void;

const listeners = new Set<PointerListener>();

function dispatchPointer(event: PointerEvent): void {
  for (const listener of listeners) listener(event.clientX, event.clientY);
}

/** Um único listener de pointermove no window para N cartões; sai quando o último desmonta. */
export function subscribePointer(listener: PointerListener): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("pointermove", dispatchPointer);
  return () => {
    if (!listeners.delete(listener)) return;
    if (listeners.size === 0) window.removeEventListener("pointermove", dispatchPointer);
  };
}
