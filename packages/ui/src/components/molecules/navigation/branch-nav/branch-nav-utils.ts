/** Distância entre a ponta do galho e o rótulo, em px. */
export const BRANCH_GAP = 4;

type BranchGeometry = { centerY: number; corner: number; endX: number };

/** Raio limitado ao que cabe na linha e entre o tronco e a ponta do galho. */
function geometry(
  index: number,
  rowHeight: number,
  trunkX: number,
  indent: number,
  radius: number
): BranchGeometry {
  const endX = indent - BRANCH_GAP;
  const corner = Math.max(0, Math.min(radius, rowHeight / 2, endX - trunkX));
  return { centerY: index * rowHeight + rowHeight / 2, corner, endX };
}

/** Galho: sai do tronco, curva com `radius` e segue reto até `indent - 4`. */
export function branchPath(
  index: number,
  rowHeight: number,
  trunkX: number,
  indent: number,
  radius: number
): string {
  const { centerY, corner, endX } = geometry(index, rowHeight, trunkX, indent, radius);
  const curve = `Q ${trunkX} ${centerY} ${trunkX + corner} ${centerY}`;
  return `M ${trunkX} ${centerY - corner} ${curve} H ${endX}`;
}

/** Tronco do topo até o centro do último filho. */
export function trunkPath(count: number, rowHeight: number, trunkX: number): string {
  return `M ${trunkX} 0 V ${Math.max(0, count - 1) * rowHeight + rowHeight / 2}`;
}

/** Traço de destaque: tronco do topo até o galho do filho ativo, num path só. */
export function activePath(
  index: number,
  rowHeight: number,
  trunkX: number,
  indent: number,
  radius: number
): string {
  const { centerY, corner, endX } = geometry(index, rowHeight, trunkX, indent, radius);
  const curve = `Q ${trunkX} ${centerY} ${trunkX + corner} ${centerY}`;
  return `M ${trunkX} 0 V ${centerY - corner} ${curve} H ${endX}`;
}

const CURVE_SAMPLES = 16;

/** Comprimento da curva quadrática do canto, por amostragem (o canto é simétrico). */
function cornerLength(corner: number): number {
  let length = 0;
  let prevX = 0;
  let prevY = 0;
  for (let step = 1; step <= CURVE_SAMPLES; step += 1) {
    const t = step / CURVE_SAMPLES;
    const x = t * t * corner;
    const y = 2 * t * (1 - t) * corner + t * t * corner;
    length += Math.hypot(x - prevX, y - prevY);
    prevX = x;
    prevY = y;
  }
  return length;
}

/** Comprimento, em px, do path devolvido por `activePath` com os mesmos argumentos. */
export function activePathLength(
  index: number,
  rowHeight: number,
  trunkX: number,
  indent: number,
  radius: number
): number {
  const { centerY, corner, endX } = geometry(index, rowHeight, trunkX, indent, radius);
  const vertical = centerY - corner;
  const horizontal = endX - trunkX - corner;
  return vertical + cornerLength(corner) + horizontal;
}

export type BranchNavLeafLike = { value: string };

/** Valor inicial: o informado, senão o primeiro filho da primeira seção aberta, senão a primeira folha do topo. */
export function initialValue(
  items: ReadonlyArray<{ value?: string; children?: ReadonlyArray<BranchNavLeafLike> }>,
  open: ReadonlySet<number>,
  defaultValue?: string
): string | undefined {
  if (defaultValue !== undefined) return defaultValue;
  const openIndex = [...open].sort((a, b) => a - b).find((i) => items[i]?.children?.length);
  if (openIndex !== undefined) return items[openIndex]?.children?.[0]?.value;
  return items.find((item) => item.children === undefined)?.value;
}

/** `defaultOpen` (número, lista ou -1) vira o conjunto de índices abertos, validando o intervalo. */
export function normalizeOpen(defaultOpen: number | number[], length: number): Set<number> {
  const list = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  for (const index of list) {
    if (!Number.isInteger(index) || index < -1 || index >= length) {
      throw new RangeError(
        `branch-nav: invalid defaultOpen index: received ${JSON.stringify(index)}, expected an integer from -1 to ${length - 1}`
      );
    }
  }
  return new Set(list.filter((index) => index >= 0));
}
