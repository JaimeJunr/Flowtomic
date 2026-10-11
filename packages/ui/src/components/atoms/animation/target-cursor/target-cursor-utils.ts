export type Corner = "tl" | "tr" | "br" | "bl";
export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

// Ordem horária: girar um quarto leva o slot i para o slot i + 1.
export const CORNERS: readonly Corner[] = ["tl", "tr", "br", "bl"];

const PARALLAX_FACTOR = 0.08;
const PARALLAX_LIMIT = 8;

function mod(value: number, base: number): number {
  return ((value % base) + base) % base;
}

// Soma 0 para trocar -0 por 0 (Object.is distingue os dois).
function clean(value: number): number {
  return value + 0;
}

/** Posição de cada canto do alvo, relativa ao centro dele, já com a folga. */
export function cornerTargets(rect: Size, padding: number): Record<Corner, Point> {
  if (!Number.isFinite(padding) || padding < 0) {
    throw new Error(
      `cornerTargets: received padding ${JSON.stringify(padding)}, expected a number >= 0`
    );
  }
  const x = rect.width / 2 + padding;
  const y = rect.height / 2 + padding;
  return {
    tl: { x: -x, y: -y },
    tr: { x, y: -y },
    br: { x, y },
    bl: { x: -x, y },
  };
}

/** Múltiplo de 90 graus mais próximo, para as cantoneiras caírem nos cantos. */
export function nearestQuarter(deg: number): number {
  return clean(Math.round(deg / 90) * 90);
}

/** Deslocamento do conjunto em direção ao ponteiro, com teto por eixo. */
export function parallaxOffset(dx: number, dy: number): Point {
  const limit = (v: number) =>
    clean(Math.max(-PARALLAX_LIMIT, Math.min(PARALLAX_LIMIT, v * PARALLAX_FACTOR)));
  return { x: limit(dx), y: limit(dy) };
}

/** Gira o ponto em quartos de volta, no sentido horário da tela (y para baixo). */
export function rotateQuarter(point: Point, quarters: number): Point {
  const { x, y } = point;
  switch (mod(quarters, 4)) {
    case 1:
      return { x: clean(-y), y: clean(x) };
    case 2:
      return { x: clean(-x), y: clean(-y) };
    case 3:
      return { x: clean(y), y: clean(-x) };
    default:
      return { x, y };
  }
}

/** Origem da caixa do braço: nos cantos direito/inferior ele cresce para dentro. */
export function cornerOrigin(corner: Corner, point: Point, cornerSize: number): Point {
  const right = corner === "tr" || corner === "br";
  const bottom = corner === "br" || corner === "bl";
  return { x: point.x - (right ? cornerSize : 0), y: point.y - (bottom ? cornerSize : 0) };
}

/** Origens dos braços na mira livre: quadrado de lado `size` centrado em zero. */
export function freeCornerOrigins(size: number, cornerSize: number): Record<Corner, Point> {
  const targets = cornerTargets({ width: size, height: size }, 0);
  return originsFrom(targets, cornerSize);
}

function originsFrom(points: Record<Corner, Point>, cornerSize: number): Record<Corner, Point> {
  const result = {} as Record<Corner, Point>;
  for (const corner of CORNERS) result[corner] = cornerOrigin(corner, points[corner], cornerSize);
  return result;
}

/**
 * Origens dos braços travados no alvo, no quadro do grupo girado `quarters` quartos:
 * o braço i vai parar no slot (i + quarters) depois do giro, então o ponto é
 * desgirado antes. Sem isso, um alvo retangular recebe os braços trocados.
 */
export function lockedCornerOrigins(
  rect: Size,
  padding: number,
  cornerSize: number,
  quarters: number
): Record<Corner, Point> {
  const targets = cornerTargets(rect, padding);
  const result = {} as Record<Corner, Point>;
  CORNERS.forEach((corner, index) => {
    const slot = CORNERS[mod(index + quarters, 4)];
    const point = rotateQuarter(targets[slot], -quarters);
    result[corner] = cornerOrigin(corner, point, cornerSize);
  });
  return result;
}

/** Graus a girar em `seconds` para dar uma volta a cada `spinDuration` s. */
export function spinStep(seconds: number, spinDuration: number): number {
  if (!Number.isFinite(spinDuration) || spinDuration < 0) {
    throw new Error(
      `spinStep: received spinDuration ${JSON.stringify(spinDuration)}, expected a number >= 0`
    );
  }
  return spinDuration === 0 ? 0 : (360 / spinDuration) * seconds;
}

/** Primeiro raio em px do `border-radius` computado, limitado a `max`. */
export function parseRadius(value: string, max: number): number {
  const first = value.trim().split(/\s+/)[0] ?? "";
  if (first.endsWith("%")) return max;
  const parsed = Number.parseFloat(first);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), max) : 0;
}
