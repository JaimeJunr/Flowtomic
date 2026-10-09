export type TaskStatus = "pending" | "running" | "done" | "failed" | "cancelled";
export type MarkShape = "dashes" | "arc" | "spinner" | "check" | "cross";

/** Fração de cada período ocupada pelo traço (o resto é vão). */
const DASH_RATIO = 0.68;
const PATH_LENGTH = 100;

/** Par "traço vão" que, repetido, dá `dashes` traços em um anel de pathLength 100. */
export function dashPattern(dashes: number): string {
  if (!Number.isInteger(dashes) || dashes < 1) {
    throw new Error(`invalid input: received dashes ${dashes}, expected an integer >= 1`);
  }
  const period = PATH_LENGTH / dashes;
  const dash = Math.round(period * DASH_RATIO * 1000) / 1000;
  const gap = Math.round((period - dash) * 1000) / 1000;
  return `${dash} ${gap}`;
}

function assertProgress(progress: number | undefined): void {
  if (progress !== undefined && Number.isNaN(progress)) {
    throw new Error(`invalid input: received progress ${progress}, expected a number in 0..1`);
  }
}

export function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

export function markShape(status: TaskStatus, progress?: number): MarkShape {
  assertProgress(progress);
  if (status === "pending") return "dashes";
  if (status === "running") return progress === undefined ? "spinner" : "arc";
  return status === "done" ? "check" : "cross";
}

const STATUS_TEXT: Record<TaskStatus, string> = {
  pending: "pendente",
  running: "em andamento",
  done: "concluída",
  failed: "falhou",
  cancelled: "cancelada",
};

export function statusText(status: TaskStatus, progress?: number): string {
  assertProgress(progress);
  if (status !== "running" || progress === undefined) return STATUS_TEXT[status];
  return `${STATUS_TEXT.running}, ${Math.round(clampProgress(progress) * 100)}%`;
}

/** Dasharray do anel por forma; anel fechado em feito/falhou. */
export function ringDasharray(
  shape: MarkShape,
  opts: { dashes: number; progress?: number; arcLength: number }
): string {
  if (shape === "dashes") return dashPattern(opts.dashes);
  if (shape === "arc") return `${clampProgress(opts.progress ?? 0) * PATH_LENGTH} ${PATH_LENGTH}`;
  if (shape === "spinner") return `${opts.arcLength * PATH_LENGTH} ${PATH_LENGTH}`;
  return `${PATH_LENGTH} ${PATH_LENGTH}`;
}
