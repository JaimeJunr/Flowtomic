export type ToolCallStatus = "idle" | "running" | "done" | "error";

const PARKED_AT = 0.9;
const CURVE_RATE = 3;
const MS_PER_SECOND = 1000;

/** Progresso que desacelera e estaciona em 90% — o chip espera a resposta, não finge terminar. */
export function parkedProgress(elapsedMs: number, expectedMs: number): number {
  if (!(expectedMs > 0)) {
    throw new Error(
      `parkedProgress: received expectedMs ${expectedMs}, expected a number greater than 0`
    );
  }
  if (elapsedMs <= 0) return 0;
  return PARKED_AT * (1 - Math.exp((-CURVE_RATE * elapsedMs) / expectedMs));
}

/** ms inteiros até 999; depois segundos com uma casa e vírgula decimal. */
export function formatDuration(ms: number): string {
  const rounded = Math.max(0, Math.round(ms));
  if (rounded < MS_PER_SECOND) return `${rounded} ms`;
  return `${(rounded / MS_PER_SECOND).toFixed(1).replace(".", ",")} s`;
}

function spokenDuration(ms: number): string {
  const rounded = Math.max(0, Math.round(ms));
  if (rounded < MS_PER_SECOND) return `${rounded} milissegundos`;
  return `${(rounded / MS_PER_SECOND).toFixed(1).replace(".", ",")} segundos`;
}

/** Texto para leitor de tela: o estado da chamada, com nome e argumento. */
export function statusText(
  status: ToolCallStatus,
  name: string,
  argument: string | undefined,
  elapsedMs: number
): string {
  const label = argument ? `${name} ${argument}` : name;
  if (status === "done") return `${label}, concluído em ${spokenDuration(elapsedMs)}`;
  if (status === "error") return `${label}, falhou`;
  if (status === "idle") return `${label}, aguardando`;
  return `${label}, em execução`;
}
