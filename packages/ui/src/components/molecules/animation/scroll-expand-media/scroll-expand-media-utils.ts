export type FrameOptions = {
  startWidth: number;
  startHeight: number;
  startRadius: number;
  endRadius: number;
  mediaZoom: number;
};

export type Frame = {
  widthPct: number;
  heightPct: number;
  radius: number;
  zoom: number;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Progresso da expansão (0..1) a partir do progresso bruto da seção (0..1). */
export function expandProgress(raw: number, scrollDistance: number, holdDistance: number): number {
  if (!(scrollDistance > 0)) {
    throw new Error(
      `scroll-expand-media: invalid scrollDistance: received ${scrollDistance}, expected a number > 0`
    );
  }
  const total = scrollDistance + holdDistance;
  return clamp01((raw * total) / scrollDistance);
}

/** Ease-out cúbico: abre rápido e assenta devagar ao chegar na tela cheia. */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function frameAt(p: number, opts: FrameOptions): Frame {
  const e = easeOutCubic(clamp01(p));
  return {
    widthPct: lerp(opts.startWidth, 100, e),
    heightPct: lerp(opts.startHeight, 100, e),
    radius: lerp(opts.startRadius, opts.endRadius, e),
    zoom: lerp(opts.mediaZoom, 1, e),
  };
}
