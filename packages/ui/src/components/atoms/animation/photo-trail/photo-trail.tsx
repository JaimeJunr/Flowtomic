/**
 * PhotoTrail Component - Flowtomic UI
 *
 * Cartões de conteúdo surgem atrás do mouse, um a cada trecho percorrido, ciclando
 * pela lista, e somem sozinhos. Pensado para seções de destaque, nunca para telas de trabalho.
 * Com movimento reduzido só o conteúdo fixo aparece.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/photo-trail.md
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  isPhotoItem,
  moveVector,
  nextIndex,
  type PhotoTrailItem,
  type PhotoTrailVariant,
  type Point,
  shouldSpawn,
  trimCards,
  variantMotion,
} from "./photo-trail-utils";

export type { PhotoTrailItem, PhotoTrailVariant };

export type PhotoTrailProps = React.ComponentProps<"div"> & {
  /** Conteúdo fixo no meio (título). */
  children?: React.ReactNode;
  /** Itens que o rastro percorre em ciclo. Pelo menos 1. */
  items: PhotoTrailItem[];
  variant?: PhotoTrailVariant;
  /** Percurso em px entre um cartão e o próximo. */
  spacing?: number;
  /** Largura do cartão em px; a altura segue a proporção 4:3. */
  cardWidth?: number;
  /** Segundos até o cartão começar a sumir. */
  lifetime?: number;
  /** Máximo de cartões vivos ao mesmo tempo. */
  maxCards?: number;
};

type Card = { id: number; index: number; x: number; y: number; z: number; dx: number; dy: number };

const EXIT_SECONDS = 0.4;

function usePreload(items: PhotoTrailItem[]) {
  React.useEffect(() => {
    for (const item of items) {
      if (isPhotoItem(item)) new Image().src = item.src;
    }
  }, [items]);
}

function useTrail(
  props: Required<Pick<PhotoTrailProps, "items" | "spacing" | "lifetime" | "maxCards">>
) {
  const { items, spacing, lifetime, maxCards } = props;
  const [cards, setCards] = React.useState<Card[]>([]);
  const last = React.useRef<Point | null>(null);
  const index = React.useRef(-1);
  const counter = React.useRef(0);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const remove = React.useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setCards((current) => current.filter((card) => card.id !== id));
  }, []);

  const spawn = (point: Point, from: Point) => {
    const { dx, dy } = moveVector(from, point, spacing);
    index.current = index.current < 0 ? 0 : nextIndex(index.current, items.length);
    counter.current += 1;
    const id = counter.current;
    // O contador serve de z-index: cada cartão novo fica por cima do anterior.
    const card: Card = { id, index: index.current, x: point.x, y: point.y, z: id, dx, dy };
    timers.current.set(
      id,
      setTimeout(() => remove(id), lifetime * 1000)
    );
    setCards((current) => {
      const { kept, dropped } = trimCards([...current, card], maxCards);
      for (const old of dropped) {
        clearTimeout(timers.current.get(old.id));
        timers.current.delete(old.id);
      }
      return kept;
    });
  };

  const onMove = (point: Point) => {
    if (!last.current) {
      last.current = point;
      return;
    }
    if (!shouldSpawn(last.current, point, spacing)) return;
    spawn(point, last.current);
    last.current = point;
  };

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  return { cards, onMove };
}

function CardContent({ item }: { item: PhotoTrailItem }) {
  if (!isPhotoItem(item)) return <>{item}</>;
  return (
    // O cartão é decorativo (aria-hidden), por isso alt vazio.
    <img
      src={item.src}
      alt=""
      draggable={false}
      loading="eager"
      decoding="async"
      className="size-full object-cover"
    />
  );
}

function TrailCard({
  card,
  item,
  variant,
  width,
}: {
  card: Card;
  item: PhotoTrailItem;
  variant: PhotoTrailVariant;
  width: number;
}) {
  const height = width * 0.75;
  const m = variantMotion(variant, card.dx, card.dy);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: card.x,
        top: card.y,
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        zIndex: card.z,
      }}
    >
      <motion.div
        data-slot="photo-trail-card"
        data-index={card.index}
        className="size-full overflow-hidden rounded-xl bg-muted shadow-lg ring-1 ring-border"
        initial={m.initial}
        animate={m.animate}
        exit={m.exit}
        transition={{ duration: EXIT_SECONDS, ease: "easeOut" }}
      >
        <CardContent item={item} />
      </motion.div>
    </div>
  );
}

function PhotoTrail({
  children,
  items,
  variant = "pop",
  spacing = 80,
  cardWidth = 160,
  lifetime = 0.6,
  maxCards = 12,
  className,
  onPointerMove,
  ref,
  ...props
}: PhotoTrailProps) {
  const reduce = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { cards, onMove } = useTrail({ items, spacing, lifetime, maxCards });
  usePreload(items);

  const setRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (reduce) return;
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    onMove({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <div
      data-slot="photo-trail"
      ref={setRef}
      onPointerMove={handleMove}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="relative z-0 flex size-full items-center justify-center">{children}</div>
      {!reduce && (
        <AnimatePresence>
          {cards.map((card) => (
            <TrailCard
              key={card.id}
              card={card}
              item={items[card.index]}
              variant={variant}
              width={cardWidth}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

PhotoTrail.displayName = "PhotoTrail";

export { PhotoTrail };
