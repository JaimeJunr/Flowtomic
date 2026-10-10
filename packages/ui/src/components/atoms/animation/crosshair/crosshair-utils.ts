const FRAME_MS = 1000 / 60;
const MAX_SMOOTHING = 0.99;

export type Rect = { left: number; top: number; width: number; height: number };
export type LockBox = { x: number; y: number; width: number; height: number; label: string };

/**
 * Aproxima `current` de `target` a cada quadro. `smoothing` 0 gruda no alvo; o
 * resultado independe da taxa de quadros porque `dt` entra no expoente.
 */
export function follow(current: number, target: number, smoothing: number, dt: number): number {
  if (!Number.isFinite(smoothing) || smoothing < 0) {
    throw new Error(
      `follow: received smoothing ${JSON.stringify(smoothing)}, expected a number >= 0`
    );
  }
  if (smoothing === 0) return target;
  const keep = Math.min(smoothing, MAX_SMOOTHING);
  const factor = 1 - (1 - keep) ** (Math.max(dt, 0) / FRAME_MS);
  return current + (target - current) * factor;
}

export function formatCoord(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`formatCoord: received ${JSON.stringify(value)}, expected a finite number`);
  }
  return String(Math.round(value));
}

export function lockLabel(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)}`;
}

/** Retângulo do alvo em coordenadas da área, crescido de `pad` em cada lado. */
export function lockBox(target: Rect, area: Rect, pad: number): LockBox {
  return {
    x: target.left - area.left - pad,
    y: target.top - area.top - pad,
    width: target.width + pad * 2,
    height: target.height + pad * 2,
    label: lockLabel(target.width, target.height),
  };
}

export function sameLockBox(a: LockBox | null, b: LockBox | null): boolean {
  if (!a || !b) return a === b;
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.label === b.label
  );
}

/** Só mouse e caneta têm ponteiro "pairando"; toque não desenha a mira. */
export function isHoverPointer(pointerType: string): boolean {
  return pointerType === "mouse" || pointerType === "pen";
}

/**
 * Transform de um segmento de linha que para a `gap` px do ponteiro. O segmento
 * ocupa 100% da área e é deslocado por `--cx`/`--cy`, então nenhum quadro mexe em layout.
 */
export function segmentTransform(axis: "x" | "y", side: "before" | "after", gap: number): string {
  if (!Number.isFinite(gap) || gap < 0) {
    throw new Error(
      `segmentTransform: received gap ${JSON.stringify(gap)}, expected a number >= 0`
    );
  }
  const pointer = axis === "x" ? "var(--cx)" : "var(--cy)";
  const move = axis === "x" ? "translateX" : "translateY";
  return side === "before"
    ? `${move}(calc(${pointer} - ${gap}px - 100%))`
    : `${move}(calc(${pointer} + ${gap}px))`;
}
