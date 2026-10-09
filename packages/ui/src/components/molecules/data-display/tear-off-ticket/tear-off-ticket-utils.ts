export type Seam = "left" | "right" | "top" | "bottom";

export type PieceMaskParams = {
  /** Lado da peça em que fica a linha picotada. */
  seam: Seam;
  /** Comprimento da linha picotada, em px. */
  length: number;
  /** Profundidade da peça a partir da linha, em px. */
  depth: number;
  holes: number;
  holeSize: number;
  notch: number;
  /** Pontes rompidas (da mais longe da dobradiça para a mais perto): a borda recua. */
  broken?: number;
};

const DEG_PER_PX = 0.5;
const BREAK_GAP_PX = 3;

function assertFinite(name: string, value: number, min: number): void {
  if (!Number.isFinite(value) || value < min) {
    throw new RangeError(`invalid ${name}: received ${name} ${value}, expected a number >= ${min}`);
  }
}

function assertInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`invalid ${name}: received ${name} ${value}, expected an integer >= 0`);
  }
}

/** Centros dos furos ao longo da linha, uniformemente espaçados e longe das pontas. */
export function perforationHoles(length: number, holes: number, _holeSize: number): number[] {
  assertFinite("length", length, 0);
  assertInteger("holes", holes);
  return Array.from({ length: holes }, (_, index) => ((index + 1) * length) / (holes + 1));
}

/** Pontes de papel entre entalhe, furos e entalhe. */
export function bridgeCount(holes: number): number {
  assertInteger("holes", holes);
  return holes + 1;
}

/** Quantas pontes já romperam; a mais longe da dobradiça rompe primeiro. */
export function tearProgress(angle: number, tearAngle: number, holes: number): number {
  assertFinite("tearAngle", tearAngle, Number.MIN_VALUE);
  const bridges = bridgeCount(holes);
  const fraction = Math.min(Math.max(angle / tearAngle, 0), 1);
  return Math.floor(fraction * bridges);
}

/** Ganho do arraste: o papel resiste mais enquanto está inteiro. */
export function foldGain(resistance: number, brokenFraction: number): number {
  const clamped = Math.min(Math.max(resistance, 0), 1);
  return 1 - clamped * (1 - Math.min(Math.max(brokenFraction, 0), 1));
}

export function nextFoldAngle(
  angle: number,
  deltaPx: number,
  tearAngle: number,
  resistance: number,
  holes: number
): number {
  const broken = tearProgress(angle, tearAngle, holes) / bridgeCount(holes);
  return Math.max(0, angle + deltaPx * DEG_PER_PX * foldGain(resistance, broken));
}

type Point = { x: number; y: number };

// Mapeia (u ao longo da linha, d para dentro da peça) para a tela, e diz se o mapa espelha.
function seamFrame(seam: Seam, depth: number) {
  const frames: Record<Seam, { at: (u: number, d: number) => Point; mirrored: boolean }> = {
    right: { at: (u, d) => ({ x: depth - d, y: u }), mirrored: false },
    left: { at: (u, d) => ({ x: d, y: u }), mirrored: true },
    top: { at: (u, d) => ({ x: u, y: d }), mirrored: false },
    bottom: { at: (u, d) => ({ x: u, y: depth - d }), mirrored: true },
  };
  return frames[seam];
}

/** Contorno `path` da peça: furos vazados em semicírculo e entalhes nas pontas da linha. */
export function pieceMask(params: PieceMaskParams): string {
  const { seam, length, depth, holes, holeSize, notch, broken = 0 } = params;
  assertFinite("length", length, 1);
  assertFinite("depth", depth, 1);
  const { at, mirrored } = seamFrame(seam, depth);
  const sweep = mirrored ? 1 : 0;
  const fmt = (p: Point) => `${round(p.x)} ${round(p.y)}`;
  const arc = (r: number, to: Point) => `A${r} ${r} 0 0 ${sweep} ${fmt(to)}`;
  const centers = perforationHoles(length, holes, holeSize);
  const edges = [notch, ...centers.flatMap((c) => [c - holeSize, c + holeSize]), length - notch];
  const parts: string[] = [`M${fmt(at(notch, 0))}`];
  for (let bridge = 0; bridge <= holes; bridge++) {
    const from = edges[bridge * 2];
    const to = edges[bridge * 2 + 1];
    if (bridge < broken) {
      parts.push(
        `L${fmt(at(from, BREAK_GAP_PX))}`,
        `L${fmt(at(to, BREAK_GAP_PX))}`,
        `L${fmt(at(to, 0))}`
      );
    } else {
      parts.push(`L${fmt(at(to, 0))}`);
    }
    if (bridge < holes) parts.push(arc(holeSize, at(to + holeSize * 2, 0)));
  }
  parts.push(
    arc(notch, at(length, notch)),
    `L${fmt(at(length, depth))}`,
    `L${fmt(at(0, depth))}`,
    `L${fmt(at(0, notch))}`,
    arc(notch, at(notch, 0)),
    "Z"
  );
  return parts.join(" ");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Máscara CSS (`url(data:svg)`) para uma peça de `width` × `height` px. */
export function maskImageFor(width: number, height: number, path: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><path d='${path}' fill='black'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
