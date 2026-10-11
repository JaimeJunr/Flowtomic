/**
 * CardCycle Component - Flowtomic UI
 *
 * Pilha de cartões em 3D que troca sozinha: o da frente cai e volta ao fundo,
 * os outros avançam um degrau. Dá para arrastar o da frente, clicar num de
 * trás para trazê-lo e navegar pelas setas. Pausa no hover, no foco e com a
 * aba oculta. Com movimento reduzido a troca é instantânea e sem autoplay.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/card-cycle.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { useCardCycle } from "./card-cycle-motion";
import { CardCycleCard } from "./card-cycle-parts";
import {
  type CardCycleHandle,
  type CardCycleItem,
  validateCardCycleOptions,
} from "./card-cycle-utils";

export type { CardCycleHandle, CardCycleItem };

export type CardCycleProps = Omit<React.ComponentProps<"div">, "onChange" | "ref"> & {
  ref?: React.Ref<HTMLDivElement>;
  controlRef?: React.Ref<CardCycleHandle>;
  /** Pelo menos 2 itens. */
  items: CardCycleItem[];
  /** Largura de cada cartão, em px. */
  width?: number;
  /** Altura de cada cartão, em px. */
  height?: number;
  /** Deslocamento horizontal por degrau, em px. */
  stepX?: number;
  /** Deslocamento vertical (para cima) por degrau, em px. */
  stepY?: number;
  /** Profundidade (translateZ) por degrau, em px. */
  depth?: number;
  /** Inclinação (skewY) de todos os cartões, em graus. */
  skew?: number;
  /** Quantos cartões aparecem na pilha (1 a 8); os demais esperam escondidos. */
  visibleCards?: number;
  /** Tempo entre trocas, em ms. */
  interval?: number;
  autoplay?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  /** 0 a 1: quanto a mola das trocas balança. */
  bounce?: number;
  /** 0 a 1: quanto o ponteiro inclina a pilha. */
  parallax?: number;
  /** 0 a 1: quanto os degraus abrem no hover. */
  hoverSpread?: number;
  /** 0 a 1: escurecimento do cartão mais ao fundo. */
  dim?: number;
  onCardClick?: (index: number) => void;
  onChange?: (frontIndex: number) => void;
};

function compose<E>(own: ((event: E) => void) | undefined, internal: (event: E) => void) {
  return (event: E) => {
    own?.(event);
    internal(event);
  };
}

function CardCycleStack({
  ref,
  controlRef,
  items,
  width = 460,
  height = 340,
  stepX = 60,
  stepY = 70,
  depth = 90,
  skew = 6,
  visibleCards = 4,
  interval = 4000,
  autoplay = true,
  pauseOnHover = true,
  draggable = true,
  bounce = 0.35,
  parallax = 0.5,
  hoverSpread = 0.12,
  dim = 0.5,
  onCardClick,
  onChange,
  className,
  style,
  "aria-label": ariaLabel = "Recursos em destaque",
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: CardCycleProps) {
  const reduce = useShouldReduceMotion();
  const cycle = useCardCycle({
    itemCount: items.length,
    height,
    pose: { stepX, stepY, depth, skew, visibleCards, dim },
    hoverSpread,
    bounce,
    parallax,
    interval,
    autoplay,
    pauseOnHover,
    draggable,
    reduce,
    onChange,
    onCardClick,
  });
  const { next, prev } = cycle;
  React.useImperativeHandle(controlRef, () => ({ next, prev }), [next, prev]);

  const front = cycle.order[0];
  const handlers = cycle.rootHandlers;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a raiz é um div tipado; a spec manda role=region + roledescription.
    <div
      data-slot="card-cycle"
      ref={ref}
      role="region"
      aria-roledescription="carrossel"
      aria-label={ariaLabel}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: o foco na raiz habilita as setas do teclado.
      tabIndex={0}
      className={cn(
        "relative outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      style={{ width, height, perspective: 900, ...style }}
      onPointerEnter={compose(onPointerEnter, handlers.onPointerEnter)}
      onPointerMove={compose(onPointerMove, handlers.onPointerMove)}
      onPointerLeave={compose(onPointerLeave, handlers.onPointerLeave)}
      onFocus={compose(onFocus, handlers.onFocus)}
      onBlur={compose(onBlur, handlers.onBlur)}
      onKeyDown={compose(onKeyDown, handlers.onKeyDown)}
      {...props}
    >
      <motion.div
        data-slot="card-cycle-stage"
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", rotateX: cycle.rotX, rotateY: cycle.rotY }}
      >
        {items.map((item, index) => {
          const slot = cycle.order.indexOf(index);
          return (
            <CardCycleCard
              key={item.id}
              item={item}
              itemIndex={index}
              slot={slot}
              visible={slot < visibleCards}
              motion={cycle.motions[index]}
              width={width}
              height={height}
              skew={skew}
              draggable={draggable}
              dragging={cycle.dragging}
              dragHandlers={cycle.frontDrag}
              onSelect={cycle.selectCard}
            />
          );
        })}
      </motion.div>
      <div className="sr-only" aria-live={cycle.autoplayRunning ? "off" : "polite"}>
        {`${items[front].title}, ${front + 1} de ${items.length}`}
      </div>
    </div>
  );
}

function CardCycle(props: CardCycleProps) {
  validateCardCycleOptions({
    itemCount: props.items.length,
    visibleCards: props.visibleCards ?? 4,
    bounce: props.bounce ?? 0.35,
    dim: props.dim ?? 0.5,
    parallax: props.parallax ?? 0.5,
    hoverSpread: props.hoverSpread ?? 0.12,
  });
  // Trocar a quantidade de itens recria o estado (ordem e MotionValues) do zero.
  return <CardCycleStack key={props.items.length} {...props} />;
}
CardCycle.displayName = "CardCycle";

export { CardCycle };
