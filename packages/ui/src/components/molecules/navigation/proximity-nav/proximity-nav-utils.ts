export type ProximityFalloff = "linear" | "smooth" | "sharp";

/** Influência (0..1) de um ponto a `distance` px do ponteiro na vertical. */
export function proximity(distance: number, radius: number, falloff: ProximityFalloff): number {
  if (!(radius > 0)) {
    throw new Error(`proximity: invalid radius, received ${radius}, expected a number > 0`);
  }
  const u = Math.max(0, 1 - Math.abs(distance) / radius);
  if (falloff === "smooth") return u * u * (3 - 2 * u);
  if (falloff === "sharp") return u * u * u;
  return u;
}

export function formatIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function tickInfluence(before: number, after: number): number {
  return (before + after) / 2;
}
