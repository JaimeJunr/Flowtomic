export const ORBIT_SHAPES = [
  "ellipse",
  "circle",
  "square",
  "star",
  "heart",
  "infinity",
  "wave",
] as const;

export type OrbitShape = (typeof ORBIT_SHAPES)[number];
export type OrbitDirection = "normal" | "reverse";
export type Point = readonly [number, number];

export type OrbitPathOptions = {
  radiusX: number;
  radiusY: number;
  radius: number;
  starPoints: number;
  starInnerRatio: number;
  /** Largura / altura da area medida. */
  aspect: number;
};

const CENTER = 50;
const WAVE_SAMPLES = 32;

const fmt = (n: number): string => String(Number(n.toFixed(3)));
const pt = (x: number, y: number): string => `${fmt(x)} ${fmt(y)}`;

function ellipseD(rx: number, ry: number): string {
  // sweep 1: sentido horario na tela, igual ao de ellipsePoint.
  return `M ${pt(CENTER + rx, CENTER)} A ${rx} ${ry} 0 1 1 ${pt(CENTER - rx, CENTER)} A ${rx} ${ry} 0 1 1 ${pt(CENTER + rx, CENTER)} Z`;
}

function squareD(rx: number, ry: number): string {
  const [x0, x1, y0, y1] = [CENTER - rx, CENTER + rx, CENTER - ry, CENTER + ry];
  return `M ${pt(x0, y0)} L ${pt(x1, y0)} L ${pt(x1, y1)} L ${pt(x0, y1)} Z`;
}

function starD(points: number, rx: number, ry: number, ratio: number): string {
  if (!Number.isInteger(points) || points < 2) {
    throw new Error(
      `orbitPath: starPoints received ${JSON.stringify(points)}, expected an integer >= 2`
    );
  }
  const total = points * 2;
  const vertices = Array.from({ length: total }, (_, k) => {
    const angle = -Math.PI / 2 + (k * Math.PI) / points;
    const f = k % 2 === 0 ? 1 : ratio;
    return pt(CENTER + rx * f * Math.cos(angle), CENTER + ry * f * Math.sin(angle));
  });
  return `M ${vertices[0]} ${vertices
    .slice(1)
    .map((v) => `L ${v}`)
    .join(" ")} Z`;
}

/** Converte coordenadas unitarias (centro em 0,0) para o viewBox, com raio por eixo. */
function scaled(rx: number, ry: number, ...coords: number[]): string {
  return coords.map((c, i) => fmt(CENTER + c * (i % 2 === 0 ? rx : ry))).join(" ");
}

function heartD(rx: number, ry: number): string {
  return `M ${scaled(rx, ry, 0, 0.9)} C ${scaled(rx, ry, -1.5, -0.1, -0.9, -1.2, 0, -0.45)} C ${scaled(rx, ry, 0.9, -1.2, 1.5, -0.1, 0, 0.9)} Z`;
}

function infinityD(rx: number, ry: number): string {
  const loops = [
    [0.4, -0.5, 1, -0.5, 1, 0],
    [1, 0.5, 0.4, 0.5, 0, 0],
    [-0.4, -0.5, -1, -0.5, -1, 0],
    [-1, 0.5, -0.4, 0.5, 0, 0],
  ];
  return `M ${scaled(rx, ry, 0, 0)} ${loops.map((c) => `C ${scaled(rx, ry, ...c)}`).join(" ")} Z`;
}

function waveD(rx: number, ry: number): string {
  const half = Math.min(rx * 1.2, CENTER - 2);
  const amplitude = ry * 0.3;
  const band = ry * 0.2;
  const y = (x: number, offset: number) =>
    CENTER + offset + amplitude * Math.sin(((x - (CENTER - half)) / half) * Math.PI * 2);
  const xs = Array.from(
    { length: WAVE_SAMPLES + 1 },
    (_, k) => CENTER - half + (2 * half * k) / WAVE_SAMPLES
  );
  const forward = xs.map((x) => pt(x, y(x, -band)));
  const back = [...xs].reverse().map((x) => pt(x, y(x, band)));
  return `M ${forward[0]} ${[...forward.slice(1), ...back].map((p) => `L ${p}`).join(" ")} Z`;
}

/**
 * Raios horizontal e vertical (unidades do viewBox) de um raio em % do MENOR
 * lado da area: o viewBox estica com a area, entao cada eixo compensa o seu.
 */
export function shapeRadii(radius: number, aspect: number): Point {
  return [radius * Math.min(1, 1 / aspect), radius * Math.min(1, aspect)];
}

/** Caminho `d` num viewBox 0..100, centrado em (50,50). */
export function orbitPath(shape: OrbitShape, o: OrbitPathOptions): string {
  const [rx, ry] = shapeRadii(o.radius, o.aspect);
  switch (shape) {
    case "ellipse":
      return ellipseD(o.radiusX, o.radiusY);
    case "circle":
      return ellipseD(rx, ry);
    case "square":
      return squareD(rx, ry);
    case "star":
      return starD(o.starPoints, rx, ry, o.starInnerRatio);
    case "heart":
      return heartD(rx, ry);
    case "infinity":
      return infinityD(rx, ry);
    case "wave":
      return waveD(rx, ry);
  }
}

/** Gira (x,y) em volta de (50,50), em graus, no espaco de pixels (largura = aspect, altura = 1). */
export function rotatePoint(x: number, y: number, deg: number, aspect = 1): Point {
  const rad = (deg * Math.PI) / 180;
  const [dx, dy] = [(x - CENTER) * aspect, y - CENTER];
  return [
    CENTER + (dx * Math.cos(rad) - dy * Math.sin(rad)) / aspect,
    CENTER + dx * Math.sin(rad) + dy * Math.cos(rad),
  ];
}

/** Matriz SVG equivalente a rotatePoint: o viewBox nao e uniforme, entao `rotate()` entortaria. */
export function rotationTransform(deg: number, aspect: number): string {
  const rad = (deg * Math.PI) / 180;
  const [c, s] = [Math.cos(rad), Math.sin(rad)];
  const [a, b, cc, d] = [c, aspect * s, -s / aspect, c];
  const e = CENTER - (a * CENTER + cc * CENTER);
  const f = CENTER - (b * CENTER + d * CENTER);
  return `matrix(${[a, b, cc, d, e, f].map(fmt).join(" ")})`;
}

/** Posicao do item `index` de `count` no caminho, em [0,1), para a fase `phase`. */
export function itemFraction(
  phase: number,
  index: number,
  count: number,
  direction: OrbitDirection
): number {
  const signed = direction === "reverse" ? -phase : phase;
  const value = (signed + index / count) % 1;
  return value < 0 ? value + 1 : value;
}

/** Amostra analitica da elipse, usada quando o ambiente nao mede o <path>. */
export function ellipsePoint(fraction: number, rx: number, ry: number): Point {
  const angle = fraction * Math.PI * 2;
  return [CENTER + rx * Math.cos(angle), CENTER + ry * Math.sin(angle)];
}
