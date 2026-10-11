/**
 * HelixGallery Component - Flowtomic UI
 *
 * Cartões numa hélice vertical em 3D que gira e sobe sem fim. Os da frente
 * ficam maiores e nítidos; perto do topo e da base somem e desfocam. Útil para
 * vitrine de classes de ativos, cases ou telas num hero.
 *
 * Modos: `auto` gira sozinho; `drag` só responde ao arraste (com inércia);
 * `scroll` gira com a rolagem da janela; `all` soma os três.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/helix-gallery.md
 */

"use client";

import type * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useHelixMotion } from "./helix-gallery-motion";
import { HelixCard, type HelixItem } from "./helix-gallery-parts";
import {
  assertHelixProps,
  type HelixMode,
  helixSlot,
  slotCountFor,
  usesDrag,
} from "./helix-gallery-utils";

export type { HelixItem } from "./helix-gallery-parts";

export type HelixGalleryProps = React.ComponentProps<"div"> & {
  /** Pelo menos 1 item. */
  items: HelixItem[];
  /** Cartões por segundo. */
  speed?: number;
  direction?: "up" | "down";
  mode?: HelixMode;
  /** Raio da hélice em px. */
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  /** Distância vertical em px entre cartões vizinhos. */
  verticalSpacing?: number;
  /** Perspectiva em px. */
  perspective?: number;
  /** Cartões por volta completa (mínimo 3). */
  cardsPerTurn?: number;
  /** Rotação inicial da hélice em graus. */
  rotation?: number;
  /** Inclinação de cada cartão em graus. */
  cardTilt?: number;
  /** Escala do cartão no centro da frente. */
  centerScale?: number;
  /** 0..0.5: fração da altura em que os cartões somem. */
  edgeFade?: number;
  /** Desfoque máximo em px nas bordas. */
  edgeBlur?: number;
  pauseOnHover?: boolean;
  fit?: "cover" | "contain";
};

// Atributo por objeto: a raiz segue div (ComponentProps<"div">), mas é região para leitores de tela.
const REGION = { role: "region", "aria-roledescription": "galeria" } as const;

function HelixGallery({
  ref,
  items,
  speed = 0.55,
  direction = "up",
  mode = "auto",
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardsPerTurn = 7,
  rotation = 0,
  cardTilt = 0,
  centerScale = 1.2,
  edgeFade = 0.3,
  edgeBlur = 6,
  pauseOnHover = true,
  fit = "cover",
  className,
  style,
  ...props
}: HelixGalleryProps) {
  assertHelixProps({ itemCount: items.length, cardsPerTurn, edgeFade });
  const reduced = useShouldReduceMotion();
  const slotCount = slotCountFor(items.length, cardsPerTurn);
  const opts = {
    slotCount,
    cardsPerTurn,
    verticalSpacing,
    radius,
    rotation,
    centerScale,
    edgeFade,
    edgeBlur,
  };
  const { register, handlers } = useHelixMotion(
    { ...opts, cardTilt, speed, direction, mode, pauseOnHover },
    reduced
  );
  const draggable = usesDrag(mode);

  return (
    <div
      ref={ref}
      data-slot="helix-gallery"
      {...REGION}
      {...(props["aria-label"] || props["aria-labelledby"] ? null : { "aria-label": "Galeria" })}
      {...props}
      {...handlers}
      className={cn("relative h-[32rem] overflow-hidden", draggable && "select-none", className)}
      style={{ perspective, ...(draggable ? { touchAction: "none" } : null), ...style }}
    >
      <div
        data-slot="helix-gallery-stage"
        className="absolute top-1/2 left-1/2 size-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: slotCount }, (_, k) => (
          <HelixCard
            key={`${items[k % items.length].id}-${Math.floor(k / items.length)}`}
            item={items[k % items.length]}
            index={k}
            duplicate={k >= items.length}
            slot={helixSlot(k, 0, opts)}
            cardTilt={cardTilt}
            width={cardWidth}
            height={cardHeight}
            fit={fit}
            register={register}
          />
        ))}
      </div>
    </div>
  );
}

HelixGallery.displayName = "HelixGallery";

export { HelixGallery };
