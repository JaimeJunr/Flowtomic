/**
 * RingCarousel Component - Flowtomic UI
 *
 * Cartões num anel 3D que gira sozinho, aceita arraste com inércia, para
 * alinhado num cartão e leva o clicado à frente. Útil para vitrine de
 * relatórios ou galeria de fundos num hero.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/ring-carousel.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useRingMotion } from "./ring-carousel-motion";
import { RingCard, type RingCarouselItem } from "./ring-carousel-parts";
import { ringRadius, stepAngle } from "./ring-carousel-utils";

export type { RingCarouselItem } from "./ring-carousel-parts";

export type RingCarouselProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Mínimo de 3 cartões. */
  items: RingCarouselItem[];
  layout?: "cylinder" | "orbit";
  /** Largura do cartão em px. */
  cardWidth?: number;
  /** Largura / altura do cartão. */
  aspectRatio?: number;
  /** Espaço em px entre cartões vizinhos. */
  gap?: number;
  /** Inclinação da câmera em graus; negativo olha de cima. */
  tilt?: number;
  /** Perspectiva em px. */
  perspective?: number;
  autoplay?: "drift" | "step" | "off";
  /** Graus por segundo no drift. */
  speed?: number;
  /** Segundos entre passos no modo step. */
  interval?: number;
  direction?: "left" | "right";
  draggable?: boolean;
  /** Ao soltar, alinha no cartão mais próximo. */
  snap?: boolean;
  pauseOnHover?: boolean;
  focusOnClick?: boolean;
  /** 0..1: quanto os cartões de trás escurecem. */
  depthFade?: number;
  /** Chamado quando o cartão da frente muda. */
  onChange?: (index: number) => void;
};

function assertItems(items: RingCarouselItem[]): void {
  if (items.length < 3) {
    throw new Error(`RingCarousel: received ${items.length} items, expected at least 3`);
  }
}

function useMergedRef<T>(forwarded: React.Ref<T> | undefined, local: React.RefObject<T | null>) {
  return React.useCallback(
    (node: T | null) => {
      local.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) (forwarded as React.RefObject<T | null>).current = node;
    },
    [forwarded, local]
  );
}

function RingCarousel({
  ref,
  items,
  layout = "cylinder",
  cardWidth = 220,
  aspectRatio = 1,
  gap = 24,
  tilt = -6,
  perspective = 2400,
  autoplay = "drift",
  speed = 14,
  interval = 3,
  direction = "left",
  draggable = true,
  snap = true,
  pauseOnHover = true,
  focusOnClick = true,
  depthFade = 0.55,
  onChange,
  className,
  style,
  ...props
}: RingCarouselProps) {
  assertItems(items);
  const count = items.length;
  const radius = ringRadius(count, cardWidth, gap);
  const step = stepAngle(count);
  const cardHeight = cardWidth / aspectRatio;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = useMergedRef(ref, rootRef);
  const reduce = useShouldReduceMotion();
  const [live, setLive] = React.useState("");

  const announce = React.useCallback(
    (index: number) => setLive(`${items[index]?.label ?? ""}, ${index + 1} de ${count}`),
    [items, count]
  );
  const { rotation, front, dragging, handlers, focusCard } = useRingMotion({
    rootRef,
    count,
    step,
    radius,
    autoplay,
    speed,
    interval,
    direction,
    draggable,
    snap,
    pauseOnHover,
    focusOnClick,
    reduce,
    onFrontChange: onChange,
    announce,
  });

  return (
    // biome-ignore lint/a11y/useSemanticElements: região de carrossel não tem equivalente semântico.
    <div
      data-slot="ring-carousel"
      data-layout={layout}
      data-dragging={dragging ? "true" : "false"}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Carrossel em anel"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a região precisa de foco para as setas girarem o anel.
      tabIndex={0}
      ref={setRefs}
      className={cn(
        "relative cursor-grab touch-pan-y select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring data-[dragging=true]:cursor-grabbing",
        className
      )}
      style={{ perspective, height: Math.round(cardHeight + 96), ...style }}
      {...props}
      {...handlers}
    >
      <div
        data-slot="ring-carousel-stage"
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg)` }}
      >
        <motion.div
          data-slot="ring-carousel-ring"
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d", z: -radius, rotateY: rotation }}
        >
          {items.map((item, index) => (
            <RingCard
              key={item.id}
              item={item}
              index={index}
              count={count}
              radius={radius}
              rotation={rotation}
              layout={layout}
              width={cardWidth}
              height={cardHeight}
              depthFade={depthFade}
              isFront={index === front}
              facesViewer={circularDistance(index, front, count) * 4 <= count}
              onSelect={focusCard}
            />
          ))}
        </motion.div>
      </div>
      <div data-slot="ring-carousel-live" aria-live="polite" className="sr-only">
        {live}
      </div>
    </div>
  );
}
RingCarousel.displayName = "RingCarousel";

function circularDistance(a: number, b: number, count: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, count - diff);
}

export { RingCarousel };
