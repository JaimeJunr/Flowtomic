export type DriftDirection = "up" | "down";

export type PlaneAngles = { depth: number; tilt: number; turn: number; roll: number };

export const MIN_ROWS = 4;
export const MIN_COLUMNS = 1;
export const MAX_COLUMNS = 12;
/** A parede é maior que a área para não mostrar canto depois da inclinação. */
export const PLANE_SCALE = 1.5;
/** Graus máximos de paralaxe por unidade de `parallax`. */
export const PARALLAX_DEGREES = 8;

/**
 * Reparte os itens em colunas (coluna c recebe c, c+columns, ...). Coluna com menos de `minRows`
 * repete a própria lista, e coluna sem item parte da lista inteira girada, para o laço não ter buraco.
 */
export function distribute<T>(items: T[], columns: number, minRows = MIN_ROWS): T[][] {
  return Array.from({ length: columns }, (_, c) => {
    const own = items.filter((_, i) => i % columns === c);
    const base = own.length > 0 ? own : rotate(items, c);
    const rows = Math.max(minRows, base.length);
    return Array.from({ length: rows }, (_, i) => base[i % base.length]);
  });
}

function rotate<T>(list: T[], by: number): T[] {
  const n = list.length;
  return list.map((_, i) => list[(i + by) % n]);
}

/** Velocidade em px/s com sinal (negativo sobe). Colunas pares seguem `direction`, ímpares o oposto. */
export function columnSpeed(
  column: number,
  columns: number,
  speed: number,
  variance: number,
  direction: DriftDirection
): number {
  if (!Number.isInteger(column) || column < 0 || column >= columns) {
    throw new Error(
      `columnSpeed: received column ${column}, expected an integer in 0..${columns - 1}`
    );
  }
  const base = direction === "up" ? -1 : 1;
  const sign = column % 2 === 0 ? base : -base;
  // Seno com passo irracional: varia de coluna em coluna sem aleatoriedade (SSR estável).
  const spread = Math.sin(column * 2.39);
  return sign * speed * (1 + variance * spread);
}

export function listHeight(rows: number, tileHeight: number, gap: number): number {
  return rows * (tileHeight + gap);
}

/** Mantém o offset em (-altura, 0]: com a lista duplicada, o laço fecha sem salto. */
export function wrapOffset(offset: number, height: number): number {
  if (height <= 0) return 0;
  return ((offset % height) - height) % height || 0;
}

/** Linhas por coluna para cobrir a parede inteira em qualquer ponto do laço. */
export function rowsNeeded(areaHeight: number, tileHeight: number, gap: number): number {
  const rows = Math.ceil((areaHeight * PLANE_SCALE) / (tileHeight + gap)) + 1;
  return Math.max(MIN_ROWS, rows);
}

export function fadeMask(fade: number): string | undefined {
  if (fade <= 0) return undefined;
  const inner = Number(((1 - fade) * 60).toFixed(2));
  return `radial-gradient(ellipse at center, black ${inner}%, transparent 100%)`;
}

export function planeTransform(angles: PlaneAngles, offsetX: number, offsetY: number): string {
  const { depth, tilt, turn, roll } = angles;
  const rx = Number((tilt + offsetX).toFixed(3));
  const ry = Number((turn + offsetY).toFixed(3));
  return `translateZ(${-depth}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${roll}deg)`;
}

type DriftOptions = {
  itemCount: number;
  columns: number;
  variance: number;
  fade: number;
  dim: number;
};

export function validateDriftOptions(o: DriftOptions): void {
  if (o.itemCount < 1) {
    throw new Error(`DriftWall: items received ${o.itemCount} items, expected at least 1`);
  }
  if (!Number.isInteger(o.columns) || o.columns < MIN_COLUMNS || o.columns > MAX_COLUMNS) {
    throw new Error(
      `DriftWall: columns received ${o.columns}, expected an integer in ${MIN_COLUMNS}..${MAX_COLUMNS}`
    );
  }
  for (const key of ["variance", "fade", "dim"] as const) {
    const value = o[key];
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`DriftWall: ${key} received ${value}, expected a number in 0..1`);
    }
  }
}
