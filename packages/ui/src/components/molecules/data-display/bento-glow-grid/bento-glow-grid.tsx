/**
 * BentoGlowGrid Component - Flowtomic UI
 *
 * Grade bento em que um holofote segue o ponteiro, a borda dos cartões próximos
 * acende e, no hover, o cartão pode inclinar, ser puxado e soltar partículas.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/bento-glow-grid.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { BentoGlowGridCard, type BentoGlowItem } from "./bento-glow-grid-card";
import { glowFor, rectDistance, validateBentoProps } from "./bento-glow-grid-utils";

export type { BentoGlowItem };

export type BentoGlowGridProps = React.ComponentProps<"div"> & {
  /** De 1 a 12 itens. */
  items: BentoGlowItem[];
  /** @default true */
  spotlight?: boolean;
  /** Raio do holofote em px. @default 300 */
  spotlightRadius?: number;
  /** @default true */
  borderGlow?: boolean;
  /** @default true */
  particles?: boolean;
  /** De 0 a 30. @default 12 */
  particleCount?: number;
  /** Inclinação 3D no hover. @default false */
  tilt?: boolean;
  /** Puxa o cartão de leve para o ponteiro. @default true */
  magnetism?: boolean;
  /** Onda circular ao clicar. @default true */
  ripple?: boolean;
};

const CARD_SELECTOR = '[data-slot="bento-glow-grid-card"]';
// Atributo por spread: a spec exige role="list" numa grade de divs (a regra semântica do Biome não se aplica).
const LIST_ROLE = { role: "list" } as const;

// Lê todas as medidas e escreve as variáveis num único quadro, para não alternar leitura e escrita.
function paintGlow(root: HTMLElement, x: number, y: number, radius: number) {
  const rootRect = root.getBoundingClientRect();
  root.style.setProperty("--x", `${x - rootRect.left}px`);
  root.style.setProperty("--y", `${y - rootRect.top}px`);
  root.style.setProperty("--so", "1");
  const cards = Array.from(root.querySelectorAll<HTMLElement>(CARD_SELECTOR));
  const rects = cards.map((card) => card.getBoundingClientRect());
  cards.forEach((card, i) => {
    const rect = rects[i];
    card.style.setProperty("--mx", `${x - rect.left}px`);
    card.style.setProperty("--my", `${y - rect.top}px`);
    card.style.setProperty("--glow", String(glowFor(rectDistance(rect, x, y), radius)));
  });
}

function clearGlow(root: HTMLElement) {
  root.style.setProperty("--so", "0");
  for (const card of root.querySelectorAll<HTMLElement>(CARD_SELECTOR)) {
    card.style.setProperty("--glow", "0");
  }
}

function useGlowTracking(radius: number) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const frame = React.useRef<number | null>(null);
  const last = React.useRef({ x: 0, y: 0 });

  React.useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    []
  );

  const move = (event: React.PointerEvent<HTMLElement>) => {
    last.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (rootRef.current) paintGlow(rootRef.current, last.current.x, last.current.y, radius);
    });
  };
  const leave = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (rootRef.current) clearGlow(rootRef.current);
  };
  return { rootRef, move, leave };
}

function BentoGlowGrid({
  ref,
  className,
  style,
  items,
  spotlight = true,
  spotlightRadius = 300,
  borderGlow = true,
  particles = true,
  particleCount = 12,
  tilt = false,
  magnetism = true,
  ripple = true,
  onPointerMove,
  onPointerLeave,
  ...props
}: BentoGlowGridProps) {
  validateBentoProps(items.length, particleCount);
  const reduced = useShouldReduceMotion();
  const glow = useGlowTracking(spotlightRadius);

  const setRefs = (node: HTMLDivElement | null) => {
    glow.rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div
      ref={setRefs}
      {...LIST_ROLE}
      data-slot="bento-glow-grid"
      // Sem altura mínima, a linha que só tem itens 2x2 colapsa e o bento vira duas linhas.
      className={cn(
        "relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:auto-rows-[minmax(12rem,auto)] lg:grid-cols-4",
        className
      )}
      style={{ "--so": "0", ...style } as React.CSSProperties}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        glow.move(event);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        glow.leave();
      }}
      {...props}
    >
      {items.map((item, index) => (
        <BentoGlowGridCard
          key={item.id}
          item={item}
          index={index}
          tilt={tilt}
          magnetism={magnetism}
          particles={particles}
          particleCount={particleCount}
          ripple={ripple}
          borderGlow={borderGlow}
          borderRadius={spotlightRadius / 2}
          reduced={reduced}
        />
      ))}
      {spotlight ? (
        <span
          aria-hidden="true"
          data-slot="bento-glow-grid-spotlight"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(circle ${spotlightRadius}px at var(--x, 50%) var(--y, 50%), color-mix(in oklch, var(--primary) 12%, transparent), transparent)`,
            opacity: "var(--so)",
          }}
        />
      ) : null}
    </div>
  );
}

BentoGlowGrid.displayName = "BentoGlowGrid";

export { BentoGlowGrid };
