export const MAX_TILT_DEG = 8;
export const MAX_PULL_PX = 6;
const MIN_ITEMS = 1;
const MAX_ITEMS = 12;
const MAX_PARTICLES = 30;

/** Padrão bento (2x2 nos índices 2 e 3; 6 itens fecham 4x3 sem buraco): só vale a partir do breakpoint lg, onde a grade tem 4 colunas. */
export function bentoSpan(index: number): string {
  if (index === 2 || index === 3) return "lg:col-span-2 lg:row-span-2";
  return "";
}

export type ParticleSeed = { x: number; y: number; duration: number; delay: number };

// mulberry32: gerador pequeno e determinístico, para a SSR e o cliente concordarem.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function particleSeeds(count: number, seed: number): ParticleSeed[] {
  const next = rng(seed * 9973 + 17);
  return Array.from({ length: count }, () => ({
    x: next() * 100,
    y: next() * 100,
    duration: 2 + next() * 2,
    delay: next() * 2,
  }));
}

/** 1 com o ponteiro dentro; cai a 0 a radius/2 px de distância. */
export function glowFor(distance: number, radius: number): number {
  const reach = radius / 2;
  if (reach <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - distance / reach));
}

type Edges = { left: number; top: number; right: number; bottom: number };

export function rectDistance(rect: Edges, x: number, y: number): number {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

export function rippleDiameter(width: number, height: number, x: number, y: number): number {
  const far = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  return 2 * far;
}

/** Posição do ponteiro no cartão, de -1 (início) a 1 (fim) em cada eixo. */
export function tiltFor(x: number, y: number, width: number, height: number) {
  const norm = (value: number, size: number) =>
    size <= 0 ? 0 : Math.min(1, Math.max(-1, (value / size) * 2 - 1));
  return { px: norm(x, width), py: norm(y, height) };
}

export function validateBentoProps(itemCount: number, particleCount: number): void {
  if (itemCount < MIN_ITEMS || itemCount > MAX_ITEMS) {
    throw new RangeError(
      `BentoGlowGrid: items deve ter ${MIN_ITEMS}..${MAX_ITEMS} itens, recebeu ${itemCount}`
    );
  }
  if (particleCount < 0 || particleCount > MAX_PARTICLES) {
    throw new RangeError(
      `BentoGlowGrid: particleCount deve estar em 0..${MAX_PARTICLES}, recebeu ${particleCount}`
    );
  }
}
