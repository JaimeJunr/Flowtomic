export type TurnAxis = "y" | "x";

/** Deslocamento mínimo (px) para um gesto deixar de ser clique e virar arrasto. */
export const CLICK_SLOP_PX = 4;
/** Quanto da velocidade (em s) entra na escolha da face ao soltar. */
export const VELOCITY_LOOKAHEAD_S = 0.15;
/** Teto da velocidade levada à soltura (graus/s): no máximo uma face de bônus por gesto. */
export const MAX_VELOCITY = 1200;
// jsdom e elementos sem layout medem 0; sem fallback o arrasto dividiria por zero.
const FALLBACK_SIZE_PX = 288;

/** Múltiplo de 180 mais próximo de onde o cartão chegaria levando a velocidade (graus/s). */
export function settleFace(angle: number, velocity: number): number {
  return Math.round((angle + velocity * VELOCITY_LOOKAHEAD_S) / 180) * 180 + 0;
}

/** Faces viradas para o verso quando o múltiplo de 180 é ímpar. */
export function isBackFace(angle: number): boolean {
  return Math.abs(Math.round(angle / 180)) % 2 === 1;
}

export function resolveDragDistance(dragDistance: number, sizePx: number): number {
  if (!Number.isFinite(dragDistance) || dragDistance < 0) {
    throw new RangeError(
      `invalid dragDistance: received ${String(dragDistance)}, expected a finite number >= 0`
    );
  }
  if (dragDistance > 0) return dragDistance;
  return sizePx > 0 ? sizePx : FALLBACK_SIZE_PX;
}

export function dragAngle(baseAngle: number, delta: number, distance: number): number {
  return baseAngle + (180 * delta) / distance;
}

export function isClick(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) < CLICK_SLOP_PX;
}

/** Escala horizontal da sombra: some quando o cartão fica de lado. */
export function shadowScale(angle: number): number {
  return Math.abs(Math.cos((angle * Math.PI) / 180));
}

export type TiltPose = { rotateX: number; rotateY: number; gx: number; gy: number };

/** Posição do ponteiro (relativa ao cartão, em px) -> inclinação em graus e centro do brilho em %. */
export function tiltPose(
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  tiltMax: number
): TiltPose {
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0, gx: 50, gy: 50 };
  const nx = Math.min(1, Math.max(-1, (offsetX / width) * 2 - 1));
  const ny = Math.min(1, Math.max(-1, (offsetY / height) * 2 - 1));
  return {
    rotateX: -ny * tiltMax + 0,
    rotateY: nx * tiltMax + 0,
    gx: ((nx + 1) / 2) * 100,
    gy: ((ny + 1) / 2) * 100,
  };
}

export function clampVelocity(velocity: number): number {
  return Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, velocity));
}
