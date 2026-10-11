import type * as React from "react";

export type CardCycleItem = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

export type CardCycleHandle = {
  next: () => void;
  prev: () => void;
};

export type PoseOptions = {
  stepX: number;
  stepY: number;
  depth: number;
  skew: number;
  visibleCards: number;
  dim: number;
};

export type SlotPose = {
  x: number;
  y: number;
  z: number;
  skewY: number;
  opacity: number;
  /** Opacidade do véu de profundidade (0 = cartão limpo). */
  veil: number;
  zIndex: number;
};

export const DEFAULT_POSE_OPTIONS: PoseOptions = {
  stepX: 60,
  stepY: 70,
  depth: 90,
  skew: 6,
  visibleCards: 4,
  dim: 0.5,
};

/** Pose de um degrau da pilha; `spread` abre os degraus (hover) sem mexer na profundidade. */
export function slotPose(slot: number, opts: PoseOptions, spread = 0): SlotPose {
  const factor = 1 + spread;
  // `+ 0` troca o -0 do degrau 0 por 0.
  const shade = Math.min(slot, opts.visibleCards - 1) / Math.max(1, opts.visibleCards - 1);
  return {
    x: slot * opts.stepX * factor + 0,
    y: -slot * opts.stepY * factor + 0,
    z: -slot * opts.depth + 0,
    skewY: opts.skew,
    opacity: slot < opts.visibleCards ? 1 : 0,
    veil: opts.dim * shade,
    zIndex: 100 - slot,
  };
}

export function identityOrder(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

export function rotateNext(order: number[]): number[] {
  return [...order.slice(1), order[0]];
}

export function rotatePrev(order: number[]): number[] {
  return [order[order.length - 1], ...order.slice(0, -1)];
}

/** Gira a ordem até `index` ficar na frente, preservando a sequência cíclica. */
export function bringToFront(order: number[], index: number): number[] {
  const position = order.indexOf(index);
  if (position === -1) {
    throw new Error(`CardCycle: índice ${index} não está na ordem [${order.join(", ")}]`);
  }
  return [...order.slice(position), ...order.slice(0, position)];
}

/** Mola das trocas: quanto maior o bounce, menor o amortecimento (30 a 12). */
export function springForBounce(bounce: number) {
  return { type: "spring" as const, stiffness: 220, damping: 30 - bounce * 18 };
}

const THROW_DISTANCE = 80;
const THROW_SPEED = 500;

/** Soltar com deslocamento ou velocidade acima do limite manda o cartão ao fundo. */
export function shouldThrow(distance: number, speed: number): boolean {
  return distance > THROW_DISTANCE || speed > THROW_SPEED;
}

export type CardCycleValidation = {
  itemCount: number;
  visibleCards: number;
  bounce: number;
  dim: number;
  parallax: number;
  hoverSpread: number;
};

function assertUnit(name: string, value: number) {
  if (!(value >= 0 && value <= 1)) {
    throw new Error(`CardCycle: ${name} deve estar entre 0 e 1, recebeu ${value}`);
  }
}

export function validateCardCycleOptions(options: CardCycleValidation): void {
  if (options.itemCount < 2) {
    throw new Error(
      `CardCycle: items precisa ter pelo menos 2 itens, recebeu ${options.itemCount}`
    );
  }
  const { visibleCards } = options;
  if (!Number.isInteger(visibleCards) || visibleCards < 1 || visibleCards > 8) {
    throw new Error(`CardCycle: visibleCards deve ser inteiro de 1 a 8, recebeu ${visibleCards}`);
  }
  assertUnit("bounce", options.bounce);
  assertUnit("dim", options.dim);
  assertUnit("parallax", options.parallax);
  assertUnit("hoverSpread", options.hoverSpread);
}
