export type Point = { x: number; y: number };
export type EvasiveAxis = "both" | "x" | "y";
export type EvasiveWall = "clamp" | "bounce";
export type Bounds = { min: number; max: number };

const DODGE_THRESHOLD = 0.5;
// Só rearma bem perto de casa, para a pílula tremendo na borda não contar várias fugas.
const REARM_THRESHOLD = 0.25;

/** Deslocamento da pílula em relação a casa: foge do ponteiro, mais forte quanto mais perto. */
export function fleeOffset(
  pointer: Point,
  home: Point,
  reach: number,
  radius: number,
  falloff: number,
  axis: EvasiveAxis
): Point {
  const dx = home.x - pointer.x;
  const dy = home.y - pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance >= radius) return { x: 0, y: 0 };
  const strength = reach * (1 - distance / radius) ** falloff;
  if (axis === "x") return { x: (dx < 0 ? -1 : 1) * strength, y: 0 };
  if (axis === "y") return { x: 0, y: (dy < 0 ? -1 : 1) * strength };
  // Ponteiro exatamente em cima de casa: sem direção definida, foge para a direita.
  if (distance === 0) return { x: strength, y: 0 };
  return { x: (dx / distance) * strength, y: (dy / distance) * strength };
}

/** Mantém a posição dentro de `bounds`: `clamp` corta, `bounce` dobra o excesso para dentro. */
export function applyWall(position: number, bounds: Bounds, wall: EvasiveWall): number {
  const { min, max } = bounds;
  if (wall === "clamp") return Math.min(max, Math.max(min, position));
  const span = max - min;
  if (span <= 0) return min;
  // Reflexão periódica: aguenta excessos maiores que o próprio campo.
  const wrapped = (((position - min) % (2 * span)) + 2 * span) % (2 * span);
  return min + (wrapped <= span ? wrapped : 2 * span - wrapped);
}

/** Histerese da contagem: conta ao passar de 50% do reach e só rearma quando volta para perto de casa. */
export function countsAsDodge(
  armed: boolean,
  displacement: number,
  reach: number
): { armed: boolean; counted: boolean } {
  if (armed && displacement > reach * DODGE_THRESHOLD) return { armed: false, counted: true };
  if (!armed && displacement < reach * REARM_THRESHOLD) return { armed: true, counted: false };
  return { armed, counted: false };
}

/** Fala da pílula: avança a cada fuga, trava na penúltima, e a última é só de quem desistiu. */
export function tauntFor(dodges: number, taunts: string[], gaveUp: boolean): string {
  if (taunts.length === 0) return "";
  if (gaveUp) return taunts[taunts.length - 1];
  return taunts[Math.min(dodges, Math.max(taunts.length - 2, 0))];
}

export function assertPatience(patience: number): void {
  if (!Number.isFinite(patience) || patience < 1) {
    throw new RangeError(
      `EvasiveTarget: invalid patience: received ${patience}, expected a number >= 1`
    );
  }
}
