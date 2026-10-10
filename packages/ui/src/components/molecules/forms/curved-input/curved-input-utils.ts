export type Point = { x: number; y: number };

export function clampRadius(radius: number, height: number): number {
  return Math.min(radius, height / 2);
}

// Parabola da linha central: nas pontas y = bend, no meio y = 0 (o meio "sobe" bend).
function centerY(t: number, bend: number): number {
  return bend * (1 - 2 * t) ** 2;
}

function centerSlope(t: number, bend: number): number {
  return -4 * bend * (1 - 2 * t);
}

export function pointOnCurve(t: number, width: number, bend: number): Point {
  return { x: width * t, y: centerY(t, bend) };
}

type Segment = { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number };

// Como o controle fica em width/2, x e linear em t: o sub-trecho entre x0 e x1 e outra quadratica.
function segment(x0: number, x1: number, width: number, bend: number, dy: number): Segment {
  const t0 = x0 / width;
  const t1 = x1 / width;
  const y0 = centerY(t0, bend);
  const cy = y0 + (centerSlope(t0, bend) * (t1 - t0)) / 2;
  return { x0, y0: y0 + dy, cx: (x0 + x1) / 2, cy: cy + dy, x1, y1: centerY(t1, bend) + dy };
}

const fmt = (n: number): string => String(Math.round(n * 100) / 100);

export function centerPath(x0: number, x1: number, width: number, bend: number): string {
  const s = segment(x0, x1, width, bend, 0);
  return `M${fmt(s.x0)} ${fmt(s.y0)} Q${fmt(s.cx)} ${fmt(s.cy)} ${fmt(s.x1)} ${fmt(s.y1)}`;
}

function reverseQuad(s: Segment): string {
  return `Q${fmt(s.cx)} ${fmt(s.cy)} ${fmt(s.x0)} ${fmt(s.y0)}`;
}

export function barOutline(width: number, height: number, bend: number, radius: number): string {
  return outlineBetween(0, width, width, height, bend, radius);
}

// Forma da barra entre xa e xb (usada pela barra inteira e pelo botao).
export function outlineBetween(
  xa: number,
  xb: number,
  width: number,
  height: number,
  bend: number,
  radius: number
): string {
  const r = clampRadius(radius, height);
  const h = height / 2;
  const top = segment(xa + r, xb - r, width, bend, -h);
  const bottom = segment(xa + r, xb - r, width, bend, h);
  const topEnd = top.y1;
  const bottomEnd = bottom.y1;
  return [
    `M${fmt(top.x0)} ${fmt(top.y0)}`,
    `Q${fmt(top.cx)} ${fmt(top.cy)} ${fmt(top.x1)} ${fmt(topEnd)}`,
    `A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(xb)} ${fmt(topEnd + r)}`,
    `L${fmt(xb)} ${fmt(bottomEnd - r)}`,
    `A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(xb - r)} ${fmt(bottomEnd)}`,
    reverseQuad(bottom),
    `A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(xa)} ${fmt(bottom.y0 - r)}`,
    `L${fmt(xa)} ${fmt(top.y0 + r)}`,
    `A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(top.x0)} ${fmt(top.y0)}`,
    "Z",
  ].join(" ");
}

export function scrollOffset(_textLen: number, caretLen: number, trackLen: number): number {
  return caretLen > trackLen ? caretLen - trackLen : 0;
}

export function viewBoxFor(
  width: number,
  height: number,
  bend: number
): { minY: number; width: number; height: number } {
  const pad = Math.abs(bend) + height / 2;
  return { minY: -pad, width, height: pad * 2 };
}

// Ponto da curva central na posicao x, com o angulo (graus) da tangente.
export function pointAtX(x: number, width: number, bend: number): Point & { angle: number } {
  const t = Math.min(1, Math.max(0, x / width));
  const slope = centerSlope(t, bend) / width;
  return { x, y: centerY(t, bend), angle: (Math.atan(slope) * 180) / Math.PI };
}
