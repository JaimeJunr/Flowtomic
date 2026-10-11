export type FadeEase = "linear" | "easeIn" | "easeOut" | "easeInOut";

export type FadeDirection = "up" | "down" | "left" | "right";

export type FadeVariantsOptions = {
  /** De onde o conteúdo chega. Padrão "up" (vem de baixo e sobe). */
  direction?: FadeDirection;
  /** Deslocamento inicial em px. Padrão 0. */
  distance?: number;
  /** Escala inicial. Padrão 1. */
  scale?: number;
  blur: boolean;
  initialOpacity: number;
  duration: number;
  delay: number;
  ease: FadeEase;
  disappearDuration: number;
  disappearEase: FadeEase;
};

export type FadeState = "hidden" | "shown" | "gone";

type FadeVariant = {
  opacity: number;
  x: number;
  y: number;
  scale: number;
  filter?: string;
  transition?: { duration: number; delay?: number; ease?: FadeEase };
};

/** Ponto de partida do deslocamento: o oposto da direção em que o conteúdo se move. */
export function offsetFor(direction: FadeDirection, distance: number): { x: number; y: number } {
  if (!(distance >= 0)) {
    throw new Error(`FadeInView: distance recebido ${distance}, esperado número >= 0`);
  }
  if (distance === 0) return { x: 0, y: 0 };
  switch (direction) {
    case "up":
      return { x: 0, y: distance };
    case "down":
      return { x: 0, y: -distance };
    case "left":
      return { x: distance, y: 0 };
    case "right":
      return { x: -distance, y: 0 };
  }
}

export function fadeVariants(opts: FadeVariantsOptions): Record<FadeState, FadeVariant> {
  const scale = opts.scale ?? 1;
  if (!(scale > 0)) {
    throw new Error(`FadeInView: scale recebido ${scale}, esperado número > 0`);
  }
  const { x, y } = offsetFor(opts.direction ?? "up", opts.distance ?? 0);
  const blurred = opts.blur ? "blur(10px)" : undefined;
  const clear = opts.blur ? "blur(0px)" : undefined;
  return {
    hidden: {
      opacity: opts.initialOpacity,
      x,
      y,
      scale,
      filter: blurred,
      transition: { duration: 0 },
    },
    shown: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: clear,
      transition: { duration: opts.duration, delay: opts.delay, ease: opts.ease },
    },
    gone: {
      opacity: 0,
      x,
      y,
      scale,
      filter: clear,
      transition: { duration: opts.disappearDuration, ease: opts.disappearEase },
    },
  };
}

/** Segundos entre o início da entrada e o início da saída. */
export function disappearTimerSeconds(
  delay: number,
  duration: number,
  disappearAfter: number
): number {
  return delay + duration + disappearAfter;
}
