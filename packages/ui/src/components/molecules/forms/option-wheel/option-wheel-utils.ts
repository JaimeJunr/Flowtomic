export type WheelSide = "left" | "right";

export type OptionLayoutOptions = {
  fontSize: number;
  spacing: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: WheelSide;
};

export type OptionLayout = {
  /** Deslocamento horizontal em rem (positivo = para a direita). */
  x: number;
  /** Deslocamento vertical em rem. */
  y: number;
  /** Rotação em graus. */
  angle: number;
  opacity: number;
  /** Desfoque em px. */
  blur: number;
};

/** Suavização exponencial: independe da taxa de quadros e nunca passa do alvo. */
export function approach(
  position: number,
  target: number,
  dtMs: number,
  smoothing: number
): number {
  if (!(smoothing > 0)) {
    throw new Error(
      `approach: received smoothing=${JSON.stringify(smoothing)}, expected a number > 0`
    );
  }
  return position + (target - position) * (1 - Math.exp(-dtMs / smoothing));
}

export function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

/** Distância assinada mais curta numa lista circular de `count` itens. */
export function circularDistance(distance: number, count: number): number {
  const half = count / 2;
  return wrapIndex(distance + half, count) - half;
}

export function stepIndex(index: number, delta: number, count: number, loop: boolean): number {
  if (loop) return wrapIndex(index + delta, count);
  return Math.min(count - 1, Math.max(0, index + delta));
}

export function optionLayout(d: number, opts: OptionLayoutOptions): OptionLayout {
  const step = opts.fontSize * opts.spacing;
  const sign = opts.side === "left" ? 1 : -1;
  const tiltRad = (opts.tilt * Math.PI) / 180;
  const theta = d * opts.tilt;
  const radius = tiltRad > 0 ? step / tiltRad : 0;
  const x = tiltRad > 0 ? opts.curve * radius * (1 - Math.cos(d * tiltRad)) : 0;
  const distance = Math.abs(d);
  return {
    x: sign * x,
    y: d * step,
    // Em side=left o texto aponta para o centro da roda (à direita): sobe conforme desce.
    angle: -sign * theta + 0,
    opacity: Math.max(opts.minOpacity, 1 - distance * opts.fade),
    blur: distance * opts.blur,
  };
}
