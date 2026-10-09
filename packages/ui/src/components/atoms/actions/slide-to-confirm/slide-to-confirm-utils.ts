export type SlidePhase = "idle" | "dragging" | "pending" | "done" | "error";
export type SlideEvent = "dragStart" | "release" | "confirm" | "resolve" | "reject" | "reset";

/** Fração do trilho a partir da qual soltar confirma. */
export const CONFIRM_THRESHOLD = 0.95;
/** Passo das setas, em fração do trilho. */
export const KEY_STEP = 0.1;

/** Progresso 0..1 da alça; `travel` é o curso total em px. */
export function progress(x: number, travel: number): number {
  if (!(travel > 0)) return 0;
  return Math.min(1, Math.max(0, x / travel));
}

/** Curso da alça: largura do trilho menos a alça e os dois insets. */
export function travelOf(trackWidth: number, handleSize: number, inset: number): number {
  return Math.max(0, trackWidth - handleSize - 2 * inset);
}

/** Máquina de fases; evento que não se aplica à fase atual é ignorado. */
export function slideReducer(phase: SlidePhase, event: SlideEvent): SlidePhase {
  switch (event) {
    case "dragStart":
      return phase === "idle" || phase === "error" ? "dragging" : phase;
    case "release":
      return phase === "dragging" ? "idle" : phase;
    case "confirm":
      return phase === "idle" || phase === "dragging" || phase === "error" ? "pending" : phase;
    case "resolve":
      return phase === "pending" ? "done" : phase;
    case "reject":
      return phase === "pending" ? "error" : phase;
    case "reset":
      return phase === "done" ? "idle" : phase;
    default:
      throw new Error(
        `slideReducer: received event ${JSON.stringify(event)}, expected a SlideEvent`
      );
  }
}

/** Opacidade do texto: some antes de a cápsula chegar ao fim. */
export function labelOpacity(value: number): number {
  return Math.min(1, Math.max(0, 1 - value * 1.5));
}

/** Mola da volta/desenrolar: speed 0..100 muda a rigidez; bounce 0..1. */
export function springFor(speed: number, bounce: number): { stiffness: number; damping: number } {
  const stiffness = 120 + Math.min(100, Math.max(0, speed)) * 4;
  const ratio = 1 - Math.min(1, Math.max(0, bounce)) * 0.9;
  return { stiffness, damping: 2 * ratio * Math.sqrt(stiffness) };
}
