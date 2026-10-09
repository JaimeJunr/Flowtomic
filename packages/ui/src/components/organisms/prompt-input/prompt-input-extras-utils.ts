import type { ReactNode } from "react";

export type PromptInputMenuItem = {
  key: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

export type PromptInputTrigger = "@" | "/";

export type TriggerMatch = { start: number; query: string };

export type SparkSpec = {
  /** Posição horizontal em % da largura. */
  left: number;
  /** Atraso inicial em segundos. */
  delay: number;
  /** Duração de uma subida em segundos, na energia zero. */
  duration: number;
  /** Deriva horizontal final em px. */
  drift: number;
};

/** Meia-vida da energia de digitação, em ms. */
const ENERGY_HALF_LIFE_MS = 700;
const ENERGY_PER_KEY = 0.2;

export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Acha "@consulta"/"/consulta" terminando no cursor; o gatilho só vale no início ou depois de espaço. */
export function findTrigger(
  text: string,
  caret: number,
  trigger: PromptInputTrigger
): TriggerMatch | null {
  const head = text.slice(0, caret);
  const start = head.lastIndexOf(trigger);
  if (start === -1) {
    return null;
  }
  const before = start === 0 ? "" : head[start - 1];
  if (before !== "" && !/\s/.test(before)) {
    return null;
  }
  const query = head.slice(start + 1);
  if (/\s/.test(query)) {
    return null;
  }
  return { start, query };
}

export function filterItems(items: PromptInputMenuItem[], query: string): PromptInputMenuItem[] {
  const needle = normalizeText(query);
  if (needle === "") {
    return items;
  }
  return items.filter((item) =>
    normalizeText(`${item.label} ${item.description ?? ""}`).includes(needle)
  );
}

/** PRNG pequeno (mulberry32): o layout das faíscas precisa ser o mesmo a cada render. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sparkLayout(count: number, seed: number): SparkSpec[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`invalid count: received ${count}, expected a non-negative integer`);
  }
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    left: Math.round(random() * 1000) / 10,
    delay: Math.round(random() * 40) / 10,
    duration: 2.6 + Math.round(random() * 24) / 10,
    drift: Math.round((random() - 0.5) * 28),
  }));
}

/** Energia 0–1 da digitação: cada tecla soma, o tempo parado faz decair. */
export function typingEnergy(energy: number, elapsedMs: number, keypress: boolean): number {
  const decayed = energy * 0.5 ** (Math.max(0, elapsedMs) / ENERGY_HALF_LIFE_MS);
  const next = keypress ? decayed + ENERGY_PER_KEY : decayed;
  return Math.min(1, Math.max(0, next < 0.005 ? 0 : next));
}
