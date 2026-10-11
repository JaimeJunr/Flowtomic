export type HelixOptions = {
  slotCount: number;
  cardsPerTurn: number;
  verticalSpacing: number;
  radius: number;
  rotation: number;
  centerScale: number;
  edgeFade: number;
  edgeBlur: number;
};

export type HelixSlot = {
  angle: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  blur: number;
};

export type HelixMode = "auto" | "drag" | "scroll" | "all";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function slotCountFor(itemCount: number, cardsPerTurn: number): number {
  return Math.max(itemCount, cardsPerTurn * 2);
}

/** Reduz a posição contínua ao intervalo [-n/2, n/2) para o laço não ter emenda. */
export function wrapPosition(t: number, slotCount: number): number {
  const half = slotCount / 2;
  return ((((t + half) % slotCount) + slotCount) % slotCount) - half;
}

export function helixSlot(index: number, progress: number, opts: HelixOptions): HelixSlot {
  const half = opts.slotCount / 2;
  const t = wrapPosition(index - progress, opts.slotCount);
  const angle = opts.rotation + (t * 360) / opts.cardsPerTurn;
  const rad = (angle * Math.PI) / 180;
  const distance = Math.abs(t) / half;
  const scale = 1 + (opts.centerScale - 1) * Math.max(0, Math.cos(rad)) * (1 - distance);
  const edge =
    opts.edgeFade > 0 ? clamp((distance - (1 - opts.edgeFade)) / opts.edgeFade, 0, 1) : 0;
  return {
    angle,
    x: Math.sin(rad) * opts.radius,
    y: t * opts.verticalSpacing,
    z: Math.cos(rad) * opts.radius,
    scale,
    opacity: 1 - edge,
    blur: edge * opts.edgeBlur,
  };
}

export function slotStyle(slot: HelixSlot, cardTilt: number) {
  // Na metade de trás da hélice o cartão mostraria o verso, com o texto espelhado:
  // meia volta a mais deixa a frente virada para quem olha, no mesmo plano.
  const facing = Math.cos((slot.angle * Math.PI) / 180) < -1e-9 ? slot.angle + 180 : slot.angle;
  return {
    transform: `translate3d(${slot.x}px, ${slot.y}px, ${slot.z}px) rotateY(${facing}deg) rotateZ(${cardTilt}deg) scale(${slot.scale})`,
    opacity: slot.opacity,
    // O blur vai no próprio cartão: filter em ancestral achata o 3D.
    filter: slot.blur > 0.05 ? `blur(${slot.blur}px)` : "none",
  };
}

/** `up` faz o progresso crescer e os cartões subirem. */
export function directionSign(direction: "up" | "down"): 1 | -1 {
  return direction === "up" ? 1 : -1;
}

/** Aproximação exponencial: `tau` em segundos é o tempo para fechar ~63% da distância. */
export function approach(current: number, target: number, dt: number, tau: number): number {
  return target + (current - target) * Math.exp(-dt / tau);
}

export const usesAuto = (mode: HelixMode) => mode === "auto" || mode === "all";
export const usesDrag = (mode: HelixMode) => mode === "drag" || mode === "all";
export const usesScroll = (mode: HelixMode) => mode === "scroll" || mode === "all";

export function assertHelixProps(props: {
  itemCount: number;
  cardsPerTurn: number;
  edgeFade: number;
}): void {
  if (props.itemCount < 1) {
    throw new Error(`HelixGallery: received ${props.itemCount} items, expected at least 1`);
  }
  if (!(props.cardsPerTurn >= 3)) {
    throw new Error(`HelixGallery: received cardsPerTurn ${props.cardsPerTurn}, expected >= 3`);
  }
  if (!(props.edgeFade >= 0 && props.edgeFade <= 0.5)) {
    throw new Error(
      `HelixGallery: received edgeFade ${props.edgeFade}, expected a value between 0 and 0.5`
    );
  }
}
