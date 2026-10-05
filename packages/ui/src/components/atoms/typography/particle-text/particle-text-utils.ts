import { parseCssColor, type RgbColor, readThemeColor } from "@/lib/read-theme-color";

export type Target = { x: number; y: number };

export type Particle = {
  /** Início (espalhado), alvo e atraso de saída, em px e ms. */
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  delay: number;
  highlight: boolean;
  phase: number;
  /** Deslocamento e velocidade da mola de repulsão. */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

type PixelBuffer = { data: ArrayLike<number>; width: number; height: number };

type BuildOptions = { scatterPx: number; staggerMs: number; highlightRatio: number };

const OPAQUE_ALPHA = 128;

/** mulberry32: gerador com semente, para o espalhamento ser reprodutível. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function textSeed(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

function collectTargets(image: PixelBuffer, step: number): Target[] {
  const targets: Target[] = [];
  for (let y = 0; y < image.height; y += step) {
    for (let x = 0; x < image.width; x += step) {
      if (image.data[(y * image.width + x) * 4 + 3] >= OPAQUE_ALPHA) targets.push({ x, y });
    }
  }
  return targets;
}

/** Pixels opacos numa grade de passo `density`; o passo cresce até caber em `maxPoints`. */
export function sampleTargets(image: PixelBuffer, density: number, maxPoints: number): Target[] {
  let step = Math.max(1, Math.round(density));
  let targets = collectTargets(image, step);
  while (targets.length > maxPoints) {
    step = Math.max(step + 1, Math.ceil(step * Math.sqrt(targets.length / maxPoints)));
    targets = collectTargets(image, step);
  }
  return targets;
}

function toParticle(target: Target, options: BuildOptions, rng: () => number): Particle {
  const angle = rng() * Math.PI * 2;
  const radius = rng() * options.scatterPx;
  return {
    sx: target.x + Math.cos(angle) * radius,
    sy: target.y + Math.sin(angle) * radius,
    tx: target.x,
    ty: target.y,
    delay: rng() * options.staggerMs,
    highlight: rng() < options.highlightRatio,
    phase: rng() * Math.PI * 2,
    ox: 0,
    oy: 0,
    vx: 0,
    vy: 0,
  };
}

/** Os pontos de destaque vão para o fim da lista, para o desenho trocar de cor uma vez só. */
export function buildParticles(
  targets: Target[],
  options: BuildOptions,
  rng: () => number
): Particle[] {
  const particles = targets.map((target) => toParticle(target, options, rng));
  return [...particles.filter((p) => !p.highlight), ...particles.filter((p) => p.highlight)];
}

const easeOutCubic = (progress: number): number => 1 - (1 - progress) ** 3;

export function positionAt(
  particle: Pick<Particle, "sx" | "sy" | "tx" | "ty" | "delay">,
  elapsedMs: number,
  gatherMs: number,
  out: Target = { x: 0, y: 0 }
): Target {
  const raw = gatherMs > 0 ? (elapsedMs - particle.delay) / gatherMs : 1;
  const eased = easeOutCubic(Math.min(1, Math.max(0, raw)));
  out.x = particle.sx + (particle.tx - particle.sx) * eased;
  out.y = particle.sy + (particle.ty - particle.sy) * eased;
  return out;
}

/** Empurra para longe do ponteiro; (dx, dy) é do ponteiro até o ponto. */
export function repelForce(
  dx: number,
  dy: number,
  radius: number,
  strength: number,
  out: Target = { x: 0, y: 0 }
): Target {
  const distance = Math.hypot(dx, dy);
  if (distance >= radius) {
    out.x = 0;
    out.y = 0;
    return out;
  }
  const magnitude = strength * (1 - distance / radius);
  out.x = distance < 1e-6 ? magnitude : (dx / distance) * magnitude;
  out.y = distance < 1e-6 ? 0 : (dy / distance) * magnitude;
  return out;
}

const hexByte = (channel: number): string =>
  Math.round(Math.min(1, Math.max(0, channel)) * 255)
    .toString(16)
    .padStart(2, "0");

/** O canvas não entende `var(--x)`: a cor resolvida vira hexadecimal. */
export function colorToHex(color: RgbColor): string {
  const alpha = color.a < 1 ? hexByte(color.a) : "";
  return `#${hexByte(color.r)}${hexByte(color.g)}${hexByte(color.b)}${alpha}`;
}

/** Aceita `var(--token)` ou qualquer cor CSS; o que não resolver volta como veio. */
export function resolveCanvasColor(value: string, element: Element, fallback: string): string {
  const token = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/.exec(value.trim());
  const color = token ? readThemeColor(token[1], element) : parseCssColor(value);
  if (color) return colorToHex(color);
  return token ? fallback : value;
}

/**
 * Ponteiro em coordenadas do texto (as dos pontos). O canvas é maior que a raiz por causa
 * da margem, então a posição vem do retângulo do canvas menos a margem. Tudo em px CSS:
 * o devicePixelRatio já está no setTransform do contexto.
 */
export function pointerToTextSpace(
  clientX: number,
  clientY: number,
  canvasRect: { left: number; top: number },
  margin: number
): Target {
  return { x: clientX - canvasRect.left - margin, y: clientY - canvasRect.top - margin };
}

export const SPRING_K = 0.08;
export const SPRING_DAMPING = 0.82;

/**
 * Mola amortecida do deslocamento até 0. A repulsão entra como alvo (força em px), então o
 * deslocamento estabiliza perto da força e volta a 0 quando ela cessa.
 */
export function springStep(
  particle: Pick<Particle, "ox" | "oy" | "vx" | "vy">,
  forceX: number,
  forceY: number
): void {
  particle.vx = (particle.vx + (forceX - particle.ox) * SPRING_K) * SPRING_DAMPING;
  particle.vy = (particle.vy + (forceY - particle.oy) * SPRING_K) * SPRING_DAMPING;
  particle.ox += particle.vx;
  particle.oy += particle.vy;
}
