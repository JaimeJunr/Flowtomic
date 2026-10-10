export const CAPTION_MAX_TILT = 12;

// Velocidade em px/s; 1200 px/s já chega ao teto de inclinação.
const CAPTION_TILT_PER_PX_S = 0.01;

type RectLike = { left: number; top: number; width: number; height: number };

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

/** Ângulos do cartão para o ponteiro em (x, y), normalizado de -1 a 1 a partir do centro. */
export function tiltAngles(
  rect: RectLike,
  x: number,
  y: number,
  amplitude: number
): { rotateX: number; rotateY: number } {
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error(
      `tiltAngles: received width=${rect.width}, height=${rect.height}, expected positive width and height`
    );
  }
  const dx = clamp(((x - rect.left) / rect.width) * 2 - 1, 1);
  const dy = clamp(((y - rect.top) / rect.height) * 2 - 1, 1);
  return { rotateX: -dy * amplitude || 0, rotateY: dx * amplitude || 0 };
}

/** Inclinação da legenda (graus) proporcional à velocidade horizontal do ponteiro (px/s). */
export function captionTilt(velocityX: number): number {
  return clamp(velocityX * CAPTION_TILT_PER_PX_S, CAPTION_MAX_TILT) || 0;
}
