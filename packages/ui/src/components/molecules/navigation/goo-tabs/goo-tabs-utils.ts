export type Rng = () => number;

export type ParticlePath = {
  /** Ângulo de saída em graus. */
  angle: number;
  outX: number;
  outY: number;
  inX: number;
  inY: number;
  /** Variação aleatória da duração em ms, entre -300 e +300. */
  durationOffset: number;
};

// accent e secondary são quase brancos no tema claro: somem sobre o fundo da barra.
export const PARTICLE_COLORS = ["bg-primary", "bg-primary/80", "bg-primary/60"] as const;

/** Gerador pseudoaleatório determinístico: mesma semente, mesma sequência. */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Trajetória da bolinha `index`: sai até `distances[0]` e volta até `distances[1]`. */
export function particlePath(
  index: number,
  count: number,
  distances: [number, number],
  rand: Rng
): ParticlePath {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`particlePath: received count=${count}, expected integer >= 1`);
  }
  const spacing = 360 / count;
  // Ruído de até um quarto do espaçamento, para o leque não ficar regular demais.
  const noise = (rand() - 0.5) * 2 * (spacing / 4);
  const angle = index * spacing + noise;
  const rad = (angle * Math.PI) / 180;
  const [outer, inner] = distances;
  return {
    angle,
    outX: Math.cos(rad) * outer,
    outY: Math.sin(rad) * outer,
    inX: Math.cos(rad) * inner,
    inY: Math.sin(rad) * inner,
    durationOffset: (rand() - 0.5) * 600,
  };
}

/** `useId` devolve caracteres que não servem em `url(#id)`; sobra só [A-Za-z0-9_-]. */
export function filterIdFrom(rawId: string): string {
  return `goo-tabs-${rawId.replace(/[^A-Za-z0-9_-]/g, "")}`;
}

export function particleDuration(base: number, offset: number): number {
  return Math.max(100, base + offset);
}
