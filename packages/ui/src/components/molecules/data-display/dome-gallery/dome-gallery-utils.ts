export type DomeFitBasis = "auto" | "min" | "max" | "width" | "height";

export type DomeTilePlacement = {
  /** Longitude em unidades; fileiras ímpares ficam em meia coluna. */
  col: number;
  /** Latitude em unidades, -2..2 (positivo sobe). */
  row: number;
  sizeX: number;
  sizeY: number;
  /** Índice do item exibido neste ladrilho (repete quando os itens acabam). */
  item: number;
};

export type DomeRotation = { x: number; y: number };

// Equador primeiro: os primeiros ladrilhos do DOM são os que ficam de frente para a pessoa.
const ROW_ORDER = [0, -1, 1, -2, 2];
const FRAME_MS = 16;

export const DOME_MIN_SEGMENTS = 8;
export const DOME_MAX_SEGMENTS = 60;
export const DOME_MIN_FIT = 0.1;
export const DOME_MAX_FIT = 1.5;
export const DOME_DRAG_THRESHOLD = 5;
export const DOME_STOP_VELOCITY = 0.01;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function assertDomeProps(count: number, segments: number, fit: number): void {
  if (!Number.isFinite(count) || count < 1) {
    throw new Error(`DomeGallery: items has ${count} entries, expected at least 1`);
  }
  if (!Number.isFinite(segments) || segments < DOME_MIN_SEGMENTS || segments > DOME_MAX_SEGMENTS) {
    throw new Error(
      `DomeGallery: segments received ${segments}, expected a number from ${DOME_MIN_SEGMENTS} to ${DOME_MAX_SEGMENTS}`
    );
  }
  if (!Number.isFinite(fit) || fit < DOME_MIN_FIT || fit > DOME_MAX_FIT) {
    throw new Error(
      `DomeGallery: fit received ${fit}, expected a number from ${DOME_MIN_FIT} to ${DOME_MAX_FIT}`
    );
  }
}

export function domeTiles(count: number, segments: number): DomeTilePlacement[] {
  if (!Number.isFinite(count) || count < 1) {
    throw new Error(`domeTiles: count received ${count}, expected >= 1`);
  }
  const tiles: DomeTilePlacement[] = [];
  for (const row of ROW_ORDER) {
    const shift = Math.abs(row) % 2 === 1 ? 0.5 : 0;
    for (let col = 0; col < segments; col++) {
      tiles.push({ col: col + shift, row, sizeX: 1, sizeY: 1, item: tiles.length % count });
    }
  }
  return tiles;
}

export function domeRadius(
  width: number,
  height: number,
  fit: number,
  fitBasis: DomeFitBasis,
  minRadius: number,
  maxRadius: number
): number {
  const basis = pickBasis(width, height, fitBasis);
  return clamp(basis * fit, minRadius, maxRadius);
}

function pickBasis(width: number, height: number, fitBasis: DomeFitBasis): number {
  switch (fitBasis) {
    case "min":
      return Math.min(width, height);
    case "max":
      return Math.max(width, height);
    case "width":
      return width;
    case "height":
      return height;
    default: {
      const ratio = height > 0 ? width / height : 1;
      return ratio > 1.3 ? Math.max(width, height) : Math.min(width, height);
    }
  }
}

export function tileTransform(col: number, row: number, unit: number, radius: number): string {
  return `rotateY(${col * unit}deg) rotateX(${-row * unit}deg) translateZ(${-radius}px)`;
}

// Os sinais são negados para a parede acompanhar o dedo: arrastar para a direita
// leva o conteúdo para a direita.
export function sphereTransform(radius: number, rotX: number, rotY: number): string {
  return `translateZ(${radius}px) rotateX(${-rotX}deg) rotateY(${-rotY}deg)`;
}

// Lado do ladrilho que cobre exatamente uma unidade angular no plano tangente.
export function tileSizePx(radius: number, segments: number): number {
  return 2 * radius * Math.tan(Math.PI / segments);
}

export function dragRotation(
  rot: DomeRotation,
  dx: number,
  dy: number,
  sensitivity: number,
  maxVertical: number
): DomeRotation {
  return {
    y: rot.y + dx / sensitivity,
    x: clamp(rot.x - dy / sensitivity, -maxVertical, maxVertical),
  };
}

export function decayVelocity(velocity: number, dtMs: number, dampening: number): number {
  return velocity * 0.95 ** (dampening * (dtMs / FRAME_MS));
}
