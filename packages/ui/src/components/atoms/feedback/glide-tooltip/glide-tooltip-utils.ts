export type GlideSide = "top" | "bottom" | "left" | "right";

export type RectLike = { left: number; top: number; width: number; height: number };
export type SizeLike = { width: number; height: number };
export type Point = { x: number; y: number };

export type WarmthPhase = "cold" | "pending" | "open" | "warm";

export type WarmthState = {
  phase: WarmthPhase;
  /** Gatilho atual; `null` quando ninguém está sob o ponteiro/foco. */
  target: string | null;
  /** Atraso do `pending` atual, lido pelo timer do grupo. */
  delayMs: number;
};

export type WarmthAction =
  | { type: "enter"; id: string; delayMs: number }
  | { type: "leave"; id: string }
  | { type: "elapsed" }
  | { type: "cool" }
  | { type: "close" };

export const GLIDE_GAP_PX = 8;

const OPPOSITE: Record<GlideSide, GlideSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/**
 * Máquina do grupo: cold -> pending -> open -> warm -> cold.
 * Em `open` ou `warm`, entrar em qualquer gatilho abre na hora (é o que faz o rótulo deslizar).
 */
export function warmthReducer(state: WarmthState, action: WarmthAction): WarmthState {
  switch (action.type) {
    case "enter":
      return enter(state, action.id, action.delayMs);
    case "leave":
      return leave(state, action.id);
    case "elapsed":
      return state.phase === "pending" ? { ...state, phase: "open" } : state;
    case "cool":
      return state.phase === "warm"
        ? { phase: "cold", target: null, delayMs: state.delayMs }
        : state;
    case "close":
      return state.phase === "pending" || state.phase === "open"
        ? { phase: "cold", target: null, delayMs: state.delayMs }
        : state;
  }
}

function enter(state: WarmthState, id: string, delayMs: number): WarmthState {
  if (state.phase === "open" && state.target === id) return state;
  if (state.phase === "open" || state.phase === "warm")
    return { phase: "open", target: id, delayMs };
  if (state.phase === "pending" && state.target === id) return state;
  return { phase: delayMs <= 0 ? "open" : "pending", target: id, delayMs };
}

function leave(state: WarmthState, id: string): WarmthState {
  if (state.target !== id) return state;
  if (state.phase === "pending") return { phase: "cold", target: null, delayMs: state.delayMs };
  if (state.phase === "open") return { phase: "warm", target: null, delayMs: state.delayMs };
  return state;
}

/** Posição (canto superior esquerdo) do rótulo, centrado no eixo transversal do gatilho. */
export function placeLabel(
  trigger: RectLike,
  label: SizeLike,
  side: GlideSide,
  gap: number = GLIDE_GAP_PX
): Point {
  const centerX = trigger.left + trigger.width / 2 - label.width / 2;
  const centerY = trigger.top + trigger.height / 2 - label.height / 2;
  switch (side) {
    case "top":
      return { x: centerX, y: trigger.top - label.height - gap };
    case "bottom":
      return { x: centerX, y: trigger.top + trigger.height + gap };
    case "left":
      return { x: trigger.left - label.width - gap, y: centerY };
    case "right":
      return { x: trigger.left + trigger.width + gap, y: centerY };
  }
}

function fits(point: Point, label: SizeLike, side: GlideSide, viewport: SizeLike): boolean {
  if (side === "top") return point.y >= 0;
  if (side === "bottom") return point.y + label.height <= viewport.height;
  if (side === "left") return point.x >= 0;
  return point.x + label.width <= viewport.width;
}

/** Vira só no mesmo eixo (top com bottom, left com right) e só se o lado oposto couber. */
export function resolveSide(
  trigger: RectLike,
  label: SizeLike,
  preferred: GlideSide,
  viewport: SizeLike,
  gap: number = GLIDE_GAP_PX
): GlideSide {
  if (fits(placeLabel(trigger, label, preferred, gap), label, preferred, viewport))
    return preferred;
  const flipped = OPPOSITE[preferred];
  return fits(placeLabel(trigger, label, flipped, gap), label, flipped, viewport)
    ? flipped
    : preferred;
}

/** Lado do gatilho onde o pavio cresce e origem do pop (o rótulo nasce do gatilho). */
export function popOrigin(side: GlideSide): string {
  return { top: "bottom center", bottom: "top center", left: "right center", right: "left center" }[
    side
  ];
}
