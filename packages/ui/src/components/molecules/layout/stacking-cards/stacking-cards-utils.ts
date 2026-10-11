export type StackCardMeasure = {
  /** Topo atual do cartão (getBoundingClientRect). */
  top: number;
  /** Onde o cartão prende, na mesma coordenada de `top`. */
  pinTop: number;
  /** itemGap + altura do cartão anterior: percurso entre começar a cobrir e pousar. */
  travel: number;
};

export type LayerOptions = {
  itemScale: number;
  minScale: number;
  dimAmount: number;
  blurAmount: number;
};

export type LayerStyle = { scale: number; dim: number; blur: number };

export type StackTop = number | `${number}%` | `${number}px`;

export const MAX_DIM = 0.8;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Quantos cartões "por cima" cobrem o cartão `index`, de forma contínua (0 a n-1-index). */
export function coveredCount(index: number, cards: readonly StackCardMeasure[]): number {
  let total = 0;
  for (let j = index + 1; j < cards.length; j++) {
    const { top, pinTop, travel } = cards[j];
    if (travel <= 0) {
      total += top <= pinTop ? 1 : 0;
    } else {
      total += clamp01(1 - (top - pinTop) / travel);
    }
  }
  return total;
}

export function layerStyle(covered: number, opts: LayerOptions): LayerStyle {
  return {
    scale: Math.max(opts.minScale, 1 - covered * opts.itemScale),
    dim: Math.min(MAX_DIM, covered * opts.dimAmount),
    blur: covered * opts.blurAmount,
  };
}

type ParsedStackTop = { value: number; unit: "px" | "%" };

export function parseStackTop(stackTop: StackTop): ParsedStackTop {
  if (typeof stackTop === "number" && Number.isFinite(stackTop)) {
    return { value: stackTop, unit: "px" };
  }
  if (typeof stackTop === "string") {
    const match = /^(-?\d+(?:\.\d+)?)(px|%)$/.exec(stackTop.trim());
    if (match) return { value: Number(match[1]), unit: match[2] as "px" | "%" };
  }
  throw new Error(
    `stackTop inválido: recebi ${JSON.stringify(stackTop)}; esperado número (px) ou texto como "15%" ou "80px"`
  );
}

/** Valor CSS do `top` sticky do cartão `index`. */
export function stickyTop(stackTop: StackTop, index: number, stackOffset: number): string {
  const { value, unit } = parseStackTop(stackTop);
  const extra = index * stackOffset;
  if (unit === "px") return `${value + extra}px`;
  return extra === 0 ? `${value}%` : `calc(${value}% + ${extra}px)`;
}

/** Mesmo ponto de `stickyTop`, em pixels, dado o alto da área visível. */
export function pinOffset(
  stackTop: StackTop,
  index: number,
  stackOffset: number,
  viewportHeight: number
): number {
  const { value, unit } = parseStackTop(stackTop);
  const base = unit === "px" ? value : (value / 100) * viewportHeight;
  return base + index * stackOffset;
}
