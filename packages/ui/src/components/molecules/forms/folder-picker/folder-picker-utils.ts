export type FolderPickerItem = string | { label: string; value: string };

export type ResolvedItem = { label: string; value: string };

export type PackedPill = {
  /** Centro horizontal da pílula em relação ao centro da nuvem, em px. */
  x: number;
  /** Linha da nuvem, 0 = a mais próxima da pasta. */
  row: number;
};

export type FloatMotion = {
  x: number[];
  y: number[];
  duration: number;
  delay: number;
};

export const PILL_HEIGHT_PX = 32;
export const ROW_HEIGHT_PX = 40;
export const CLOUD_LIFT_PX = 24;
const CHAR_WIDTH_PX = 7;
const PILL_PADDING_PX = 32;

export function resolveItems(items: FolderPickerItem[]): ResolvedItem[] {
  return items.map((item, index) => {
    if (typeof item === "string") return { label: item, value: item };
    if (typeof item?.label !== "string" || typeof item?.value !== "string") {
      throw new TypeError(
        `FolderPicker: invalid item at index ${index}: received ${JSON.stringify(item)}, expected a string or { label: string; value: string }`
      );
    }
    return item;
  });
}

/** Estimativa usada quando o layout não mede (jsdom, primeiro quadro). */
export function estimatePillWidth(label: string): number {
  return label.length * CHAR_WIDTH_PX + PILL_PADDING_PX;
}

export function defaultSublabel(count: number): string {
  return count === 1 ? "1 nota" : `${count} notas`;
}

/** Distribui as pílulas em linhas centradas de largura <= 2*spread, de baixo para cima. */
export function packRows(widths: number[], spread: number, gap: number): PackedPill[] {
  const maxRow = spread * 2;
  const rows: number[][] = [];
  let used = 0;
  widths.forEach((width, index) => {
    const current = rows[rows.length - 1];
    const fits = current !== undefined && used + gap + width <= maxRow;
    if (fits) {
      current.push(index);
      used += gap + width;
      return;
    }
    rows.push([index]);
    used = width;
  });
  const packed: PackedPill[] = new Array(widths.length);
  rows.forEach((indexes, row) => {
    const total = indexes.reduce((sum, i) => sum + widths[i], 0) + gap * (indexes.length - 1);
    let cursor = -total / 2;
    for (const i of indexes) {
      packed[i] = { x: cursor + widths[i] / 2, row };
      cursor += widths[i] + gap;
    }
  });
  return packed;
}

/** Inclinação determinística em [-tilt, tilt]; sem aleatório no render. */
export function tiltFor(index: number, tilt: number): number {
  const wave = Math.sin((index + 1) * 12.9898) * 43758.5453;
  const unit = (wave - Math.floor(wave)) * 2 - 1;
  return unit * tilt + 0; // + 0 evita -0
}

/** Oscilação senoidal lenta: fases e durações diferentes por pílula, amplitude proporcional a drift. */
export function floatMotion(index: number, drift: number, delay: number): FloatMotion {
  const amplitude = 6 * Math.min(Math.max(drift, 0), 1);
  const sign = index % 2 === 0 ? 1 : -1;
  const ax = amplitude * (0.6 + (index % 3) * 0.2) * sign;
  const ay = amplitude * (0.5 + ((index + 1) % 3) * 0.25);
  return {
    x: [0, ax, 0, -ax, 0],
    y: [0, -ay, 0, ay, 0],
    duration: 4 + (index % 4) * 0.7,
    delay,
  };
}

export function cloudHeight(rowCount: number): number {
  return CLOUD_LIFT_PX + rowCount * ROW_HEIGHT_PX;
}
