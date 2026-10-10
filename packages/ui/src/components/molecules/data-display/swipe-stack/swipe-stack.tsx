/**
 * SwipeStack Component - Flowtomic UI
 *
 * Pilha de cartoes: o de cima se arrasta, inclina em 3D e, passando do limite
 * (ou num arremesso), vai para o fim da pilha. Serve para depoimentos,
 * destaques e cartoes de onboarding num espaco pequeno.
 *
 * Implementacao clean room - spec em docs/clean-room/react-bits/swipe-stack.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { SwipeCard } from "./swipe-stack-card";
import {
  assertSameLength,
  cycle,
  restPose,
  type SwipeStackLayout,
  uncycle,
} from "./swipe-stack-utils";

export type SwipeStackProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  /** Cartoes, o primeiro em cima. */
  cards: React.ReactNode[];
  /** Rotulo de cada cartao para leitor de tela (mesmo tamanho de `cards`). */
  labels: string[];
  layout?: SwipeStackLayout;
  /** Cartoes visiveis contando o de cima. */
  visible?: number;
  /** 0..1: quanto os cartoes de tras se abrem. */
  spread?: number;
  /** 0..1: quanto os cartoes de tras encolhem e escurecem. */
  depth?: number;
  /** Graus maximos de inclinacao durante o arraste (0 = plano). */
  tilt?: number;
  /** Distancia em px para mandar o cartao ao fim. */
  threshold?: number;
  /** 0.5..2: multiplica a rigidez das molas. */
  speed?: number;
  sendToBackOnClick?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  onChange?: (topIndex: number) => void;
};

const range = (length: number) => Array.from({ length }, (_, index) => index);
const isMouseLike = (event: React.PointerEvent) =>
  event.pointerType === "mouse" || event.pointerType === "pen";

function useOrder(count: number, onChange?: (topIndex: number) => void) {
  const [order, setOrder] = React.useState(() => range(count));
  const [announced, setAnnounced] = React.useState<number | null>(null);
  const current = order.length === count ? order : range(count);
  const top = current[0];
  const previousTop = React.useRef(top);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  React.useEffect(() => {
    if (order.length !== count) setOrder(range(count));
  }, [order.length, count]);

  React.useEffect(() => {
    if (previousTop.current === top) return;
    previousTop.current = top;
    setAnnounced(top);
    onChangeRef.current?.(top);
  }, [top]);

  const next = React.useCallback(() => setOrder((value) => cycle(value)), []);
  const previous = React.useCallback(() => setOrder((value) => uncycle(value)), []);
  return { order: current, announced, next, previous };
}

function useAutoplay(enabled: boolean, delay: number, next: () => void) {
  React.useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(next, delay);
    return () => window.clearInterval(id);
  }, [enabled, delay, next]);
}

function SwipeStack({
  ref,
  className,
  cards,
  labels,
  layout = "fan",
  visible = 4,
  spread = 0.5,
  depth = 0.5,
  tilt = 30,
  threshold = 90,
  speed = 1,
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  onChange,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SwipeStackProps) {
  assertSameLength(cards.length, labels.length);
  const reduceMotion = useShouldReduceMotion();
  const { order, announced, next, previous } = useOrder(cards.length, onChange);
  const [dragging, setDragging] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  useAutoplay(autoplay && !dragging && !(pauseOnHover && hovered), autoplayDelay, next);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a spec pede role=region com roledescription proprio
    <div
      data-slot="swipe-stack"
      data-layout={layout}
      data-dragging={dragging ? "true" : "false"}
      ref={ref}
      role="region"
      aria-roledescription="pilha de cartões"
      aria-label="Pilha de cartões"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a pilha responde ao teclado, entao precisa de foco
      tabIndex={0}
      className={cn(
        "relative select-none [perspective:900px] focus-visible:outline-2 focus-visible:outline-ring",
        className
      )}
      onKeyDown={handleKeyDown}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (isMouseLike(event)) setHovered(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (isMouseLike(event)) setHovered(false);
      }}
      {...props}
    >
      {cards.map((card, index) => {
        const position = order.indexOf(index);
        const pose = restPose(Math.min(position, visible - 1), layout, spread, depth);
        return (
          <SwipeCard
            // biome-ignore lint/suspicious/noArrayIndexKey: a lista e posicional; a ordem muda por estado, nao por reordenacao do pai
            key={index}
            position={position}
            label={labels[index]}
            hidden={position >= visible}
            pose={pose}
            fanOrigin={layout === "fan"}
            zIndex={cards.length - position}
            tilt={tilt}
            threshold={threshold}
            speed={speed}
            reduceMotion={reduceMotion}
            sendToBackOnClick={sendToBackOnClick}
            onSend={next}
            onDragChange={setDragging}
          >
            {card}
          </SwipeCard>
        );
      })}
      <span aria-live="polite" className="sr-only">
        {announced === null ? "" : labels[announced]}
      </span>
    </div>
  );
}
SwipeStack.displayName = "SwipeStack";

export { SwipeStack };
