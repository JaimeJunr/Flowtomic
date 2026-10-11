export type RailSide = "left" | "right";

export type RailPoseOptions = {
  side: RailSide;
  cardWidth: number;
  depth: number;
  spread: number;
  tilt: number;
  falloff: number;
  blur: number;
  visibleCards: number;
};

export type RailPose = {
  x: number;
  z: number;
  rotateY: number;
  /** Opacidade do véu escuro sobre o cartão (0 = nítido, 1 = coberto). */
  veil: number;
  blur: number;
  opacity: number;
  zIndex: number;
};

// `+ 0` converte -0 em 0 (side left multiplica por -1).
const clean = (value: number) => value + 0;

/** Pose de um cartão a `offset` passos do ativo (negativo = já passou). */
export function railPose(offset: number, opts: RailPoseOptions): RailPose {
  const s = opts.side === "right" ? 1 : -1;
  if (offset < 0) {
    return {
      x: clean(-s * opts.cardWidth * 1.1),
      z: 0,
      rotateY: clean(s * opts.tilt),
      veil: 0,
      blur: 0,
      opacity: 0,
      zIndex: 101,
    };
  }
  const brightness = 1 - Math.min(1, offset * opts.falloff);
  return {
    x: clean(s * offset * opts.spread),
    z: clean(-offset * opts.depth),
    rotateY: clean(-s * Math.min(offset, 3) * opts.tilt),
    veil: clean(1 - brightness),
    blur: clean(Math.min(opts.blur, offset * opts.falloff * opts.blur * 2)),
    opacity: offset < opts.visibleCards ? 1 : 0,
    zIndex: 100 - offset,
  };
}

/** Distância do cartão `i` ao ativo; com loop é sempre >= 0. */
export function cycleOffset(i: number, active: number, count: number, loop: boolean): number {
  return loop ? (i - active + count) % count : i - active;
}

/** Próximo índice ao andar `dir` passos, travando nas pontas quando não há loop. */
export function stepIndex(active: number, dir: 1 | -1, count: number, loop: boolean): number {
  const next = active + dir;
  if (loop) return (next + count) % count;
  return Math.min(count - 1, Math.max(0, next));
}

export function assertCarouselOptions(o: {
  count: number;
  visibleCards: number;
  falloff: number;
}): void {
  if (o.count < 1) {
    throw new Error(`DepthRailCarousel: items precisa ter pelo menos 1 item, recebeu ${o.count}`);
  }
  if (!(o.visibleCards >= 1 && o.visibleCards <= 8)) {
    throw new Error(
      `DepthRailCarousel: visibleCards deve estar entre 1 e 8, recebeu ${o.visibleCards}`
    );
  }
  if (!(o.falloff >= 0 && o.falloff <= 1)) {
    throw new Error(`DepthRailCarousel: falloff deve estar entre 0 e 1, recebeu ${o.falloff}`);
  }
}
