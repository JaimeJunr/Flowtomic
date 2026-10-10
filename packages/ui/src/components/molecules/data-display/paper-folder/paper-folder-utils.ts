export type PaperPose = { x: number; y: number; rotate: number };

export type FrontState = "closed" | "hover" | "open";

type MagnetRect = Pick<DOMRect, "left" | "top" | "width" | "height">;

// Poses em % do tamanho da própria folha; a do meio é a de pasta com uma folha só.
const POSES: readonly PaperPose[] = [
  { x: -120, y: -70, rotate: -15 },
  { x: 10, y: -70, rotate: 15 },
  { x: -50, y: -100, rotate: 5 },
];

const SIZES = [
  { width: 70, height: 80 },
  { width: 80, height: 70 },
  { width: 90, height: 60 },
] as const;

export function paperPose(index: number, count: number): PaperPose {
  if (!Number.isInteger(index) || index < 0 || index >= count || count > POSES.length) {
    throw new Error(
      `paperPose: invalid index, received ${index} of ${count}, expected integer in [0, count) with count between 1 and 3`
    );
  }
  return count === 1 ? POSES[2] : POSES[index];
}

export function paperSize(index: number, count: number): { width: number; height: number } {
  return SIZES[count === 1 ? 1 : index];
}

export function paperPoseTransform(pose: PaperPose): string {
  return `translate(${pose.x}%, ${pose.y}%) rotate(${pose.rotate}deg)`;
}

export function closedPaperTransform(peeking: boolean): string {
  return `translate(-50%, ${peeking ? -10 : 10}%)`;
}

export function frontTransform(state: FrontState): string {
  if (state === "open") return "skew(15deg) scaleY(0.6)";
  // Hover entreabre pela metade do caminho da pasta aberta.
  if (state === "hover") return "skew(7.5deg) scaleY(0.8)";
  return "none";
}

export function magnetOffset(
  rect: MagnetRect,
  x: number,
  y: number,
  strength: number
): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error(
      `magnetOffset: invalid rect, received ${rect.width}x${rect.height}, expected positive width and height`
    );
  }
  const dx = x - (rect.left + rect.width / 2);
  const dy = y - (rect.top + rect.height / 2);
  return { x: dx * strength, y: dy * strength };
}
