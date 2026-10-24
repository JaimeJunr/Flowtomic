import type * as React from "react";

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** Converte "HH:MM" em minutos desde 00:00. */
export function parseTime(time: string): number {
  const match = TIME_PATTERN.exec(time);
  if (!match) {
    throw new Error(`invalid time: received ${JSON.stringify(time)}, expected "HH:MM" (24 h)`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Converte minutos desde 00:00 em "HH:MM". */
export function formatTime(minutes: number): string {
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60) % 24;
  return `${String(hours).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Posição do horário no trilho, em porcentagem (0 a 100), proporcional entre início e fim. */
export function percentAt(minutes: number, startMinutes: number, endMinutes: number): number {
  const range = endMinutes - startMinutes;
  if (range <= 0) return 0;
  const clamped = Math.min(Math.max(minutes, startMinutes), endMinutes);
  return ((clamped - startMinutes) * 100) / range;
}

/** Índice do momento cuja posição (em porcentagem) está mais perto da posição dada. */
export function nearestIndex(percents: number[], percent: number): number {
  let best = 0;
  for (let index = 1; index < percents.length; index += 1) {
    if (Math.abs(percents[index] - percent) < Math.abs(percents[best] - percent)) best = index;
  }
  return best;
}

/** Posições (em porcentagem) dos traços menores, a cada `tickMinutes`, sem cobrir os momentos. */
export function tickPercents(
  startMinutes: number,
  endMinutes: number,
  tickMinutes: number,
  momentMinutes: number[]
): number[] {
  if (tickMinutes <= 0 || endMinutes <= startMinutes) return [];
  const ticks: number[] = [];
  for (let at = startMinutes; at <= endMinutes; at += tickMinutes) {
    if (momentMinutes.some((moment) => Math.abs(moment - at) < 1)) continue;
    ticks.push(percentAt(at, startMinutes, endMinutes));
  }
  return ticks;
}

/** Texto puro de um ReactNode (para aria-label); vazio quando não há texto. */
export function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}
