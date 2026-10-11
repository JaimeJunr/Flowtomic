/**
 * ColorSpotlightGrid Component - Flowtomic UI
 *
 * Grade de cartões em tons de cinza; um holofote segue o ponteiro e devolve a
 * cor, a borda acende na cor de destaque e o rodapé brilha. Variante "card":
 * o cartão inteiro sob o ponteiro ganha cor.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/color-spotlight-grid.md
 */

"use client";

import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type CardLook,
  SpotlightGridCard,
  type SpotlightGridItem,
} from "./color-spotlight-grid-card";
import {
  gridTemplateColumns,
  proximity,
  radiusStep,
  stepToward,
  validateSettings,
} from "./color-spotlight-grid-utils";

export type { SpotlightGridItem };

export type ColorSpotlightGridProps = React.ComponentProps<"div"> & {
  items: SpotlightGridItem[];
  /** @default "spotlight" */
  reveal?: "spotlight" | "card";
  /** Máximo de colunas, 1..6. @default 3 */
  columns?: number;
  /** Largura mínima do cartão em px. @default 180 */
  minCardWidth?: number;
  /** @default 12 */
  gap?: number;
  /** Raio do holofote em px. @default 260 */
  radius?: number;
  /** 0 = disco nítido; 1 = some desde o centro. @default 0.6 */
  softness?: number;
  /** 0 = segue exato; até 0.95. @default 0.45 */
  damping?: number;
  /** Segundos para apagar ao sair. @default 0.6 */
  fadeOut?: number;
  /** @default 1 */
  grayscale?: number;
  /** Quanto escurecer a camada cinza, 0..1. @default 0.12 */
  dim?: number;
  /** @default "3 / 2" */
  aspectRatio?: string;
  /** @default true */
  showInfo?: boolean;
};

const CARD_SELECTOR = '[data-slot="color-spotlight-grid-card"]';
const FIRST_FRAME_MS = 16;
const SETTLED = 0.1;

const px = (value: number) => `${+value.toFixed(2)}px`;

type Point = { x: number; y: number };

function paintCards(root: HTMLElement, pos: Point, r: number, radius: number) {
  for (const card of root.querySelectorAll<HTMLElement>(CARD_SELECTOR)) {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", px(pos.x - rect.left));
    card.style.setProperty("--y", px(pos.y - rect.top));
    card.style.setProperty("--r", px(r));
    const near = proximity(rect, pos.x, pos.y, radius) * (radius > 0 ? r / radius : 0);
    card.style.setProperty("--p", String(+near.toFixed(3)));
  }
}

function useSpotlightLoop(
  root: React.RefObject<HTMLDivElement | null>,
  props: {
    radius: number;
    damping: number;
    fadeOut: number;
    reduced: boolean;
    enabled: boolean;
  }
) {
  const { radius, damping, fadeOut, reduced, enabled } = props;
  const [running, setRunning] = React.useState(false);
  const target = React.useRef<Point>({ x: 0, y: 0 });
  const pos = React.useRef<Point>({ x: 0, y: 0 });
  const r = React.useRef(0);
  const inside = React.useRef(false);
  const last = React.useRef(0);

  const paint = React.useCallback(() => {
    if (root.current) paintCards(root.current, pos.current, r.current, radius);
  }, [root, radius]);

  const move = (x: number, y: number) => {
    if (!enabled) return;
    target.current = { x, y };
    if (!inside.current) pos.current = { x, y };
    inside.current = true;
    if (reduced) {
      pos.current = { x, y };
      r.current = radius;
      paint();
      return;
    }
    setRunning(true);
  };

  const leave = () => {
    if (!enabled || !inside.current) return;
    inside.current = false;
    if (reduced) {
      r.current = 0;
      paint();
      return;
    }
    setRunning(true);
  };

  const onFrame = (now: number) => {
    const dt = last.current ? now - last.current : FIRST_FRAME_MS;
    last.current = now;
    pos.current = {
      x: stepToward(pos.current.x, target.current.x, damping),
      y: stepToward(pos.current.y, target.current.y, damping),
    };
    r.current = radiusStep(r.current, radius, inside.current, dt, fadeOut);
    paint();
    const arrived =
      Math.hypot(pos.current.x - target.current.x, pos.current.y - target.current.y) < SETTLED;
    const done = inside.current ? arrived && r.current >= radius : r.current <= 0;
    if (!done) return;
    last.current = 0;
    setRunning(false);
  };
  useFrameLoop(onFrame, running && !reduced);

  return { move, leave };
}

function ColorSpotlightGrid({
  ref,
  className,
  style,
  items,
  reveal = "spotlight",
  columns = 3,
  minCardWidth = 180,
  gap = 12,
  radius = 260,
  softness = 0.6,
  damping = 0.45,
  fadeOut = 0.6,
  grayscale = 1,
  dim = 0.12,
  aspectRatio = "3 / 2",
  showInfo = true,
  onPointerMove,
  onPointerLeave,
  ...props
}: ColorSpotlightGridProps) {
  validateSettings({ columns, softness, damping, grayscale, dim });
  const reduced = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [focused, setFocused] = React.useState<string | null>(null);
  const { move, leave } = useSpotlightLoop(rootRef, {
    radius,
    damping,
    fadeOut,
    reduced,
    enabled: reveal === "spotlight",
  });

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };
  const look: CardLook = {
    reveal,
    softness,
    grayscale,
    dim,
    aspectRatio,
    fadeOut,
    showInfo,
    reduced,
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: grid CSS precisa de div; o papel mantém a semântica de lista
    <div
      ref={setRefs}
      role="list"
      data-slot="color-spotlight-grid"
      className={cn("grid w-full", className)}
      style={{
        gridTemplateColumns: gridTemplateColumns(columns, gap, minCardWidth),
        gap,
        ...style,
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        move(event.clientX, event.clientY);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        leave();
      }}
      {...props}
    >
      {items.map((item) => (
        <SpotlightGridCard
          key={item.id}
          item={item}
          look={look}
          revealed={focused === item.id || (reveal === "card" && hovered === item.id)}
          onHover={setHovered}
          onFocusChange={setFocused}
        />
      ))}
    </div>
  );
}

ColorSpotlightGrid.displayName = "ColorSpotlightGrid";

export { ColorSpotlightGrid };
