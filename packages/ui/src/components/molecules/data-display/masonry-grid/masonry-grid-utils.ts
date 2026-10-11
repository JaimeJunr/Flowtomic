export type Breakpoint = [minWidth: number, columns: number];

export type MasonryAnimateFrom = "top" | "bottom" | "left" | "right" | "center" | "random";

export type MasonryBox = { x: number; y: number; w: number; h: number };

export type MasonryPlacement = MasonryBox & { id: string };

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  [1500, 5],
  [1000, 4],
  [600, 3],
  [400, 2],
  [0, 1],
];

/** Distância de onde o item nasce em relação ao destino. */
const ENTRY_OFFSET = 100;

/** Primeiro breakpoint (do maior para o menor) cuja largura mínima cabe em `width`. */
export function columnsFor(width: number, breakpoints: Breakpoint[]): number {
  const match = breakpoints.find(([minWidth]) => width >= minWidth);
  return match ? match[1] : 1;
}

function shortestColumn(heights: number[]): number {
  let best = 0;
  for (let c = 1; c < heights.length; c++) {
    // Estritamente menor: em empate fica a coluna da esquerda.
    if (heights[c] < heights[best]) best = c;
  }
  return best;
}

export function layoutMasonry(
  items: ReadonlyArray<{ id: string; height: number }>,
  width: number,
  columns: number,
  gap: number
): { items: MasonryPlacement[]; height: number } {
  if (!(columns >= 1)) {
    throw new Error(`layoutMasonry: columns must be >= 1, received ${columns}`);
  }
  if (!(width >= 0)) {
    throw new Error(`layoutMasonry: width must be >= 0, received ${width}`);
  }
  const colWidth = Math.max(0, (width - gap * (columns - 1)) / columns);
  const heights = new Array<number>(columns).fill(0);
  const placed = items.map((item) => {
    const col = shortestColumn(heights);
    const placement = {
      id: item.id,
      x: col * (colWidth + gap),
      y: heights[col],
      w: colWidth,
      h: item.height,
    };
    heights[col] += item.height + gap;
    return placement;
  });
  const tallest = Math.max(0, ...heights);
  return { items: placed, height: items.length === 0 ? 0 : tallest - gap };
}

const RANDOM_ORDER = ["top", "bottom", "left", "right"] as const;

/** Posição de onde o item parte antes de ir para `target`. */
export function startPosition(
  from: MasonryAnimateFrom,
  index: number,
  target: MasonryBox,
  root: { width: number; height: number }
): { x: number; y: number } {
  const direction = from === "random" ? RANDOM_ORDER[index % 4] : from;
  switch (direction) {
    case "top":
      return { x: target.x, y: target.y - ENTRY_OFFSET };
    case "left":
      return { x: target.x - ENTRY_OFFSET, y: target.y };
    case "right":
      return { x: target.x + ENTRY_OFFSET, y: target.y };
    case "center":
      return { x: root.width / 2 - target.w / 2, y: root.height / 2 - target.h / 2 };
    default:
      return { x: target.x, y: target.y + ENTRY_OFFSET };
  }
}
