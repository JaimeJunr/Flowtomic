/**
 * ShredList Component - Flowtomic UI
 *
 * Lista de cartões sobre uma fenda: arrastar um cartão até a fenda faz os rolos
 * puxá-lo, e o que passa sai cortado em tiras verticais que caem e somem. Arrastar
 * acima da fenda reordena. Teclado: Delete tritura, Alt+setas reordenam.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/shred-list.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  feedDistance,
  moveItem,
  reorderIndex,
  stripClip,
  stripCount,
  stripMotion,
} from "./shred-list-utils";

type Identified = { id: string };

export type ShredListProps<T extends Identified> = Omit<React.ComponentProps<"div">, "children"> & {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Chamado quando o cartão terminou de passar pela fenda. Remova o item aqui; se o pai não remover, o cartão volta ao topo. */
  onShred: (item: T) => void;
  onReorder?: (items: T[]) => void;
  /** px/s dos rolos. */
  feedSpeed?: number;
  /** px que o cartão precisa entrar na fenda para ser puxado. */
  bite?: number;
  /** Puxa assim que passa do bite, mesmo segurando. false = só ao soltar sobre a fenda. */
  autoFeed?: boolean;
  /** Largura de cada tira, em px. */
  stripWidth?: number;
  /** 0..1.5. Amplitude da ondulação das tiras; 0 = caem retas. */
  curl?: number;
  /** Inclinação máxima ao arrastar, em graus. */
  dragTilt?: number;
  lift?: number;
  /** Altura da área de queda, em px. */
  fallHeight?: number;
  gap?: number;
  disabled?: boolean;
  /** Gerador aleatório das tiras; injetável para teste. */
  random?: () => number;
  "aria-label"?: string;
};

type Gesture = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  gap: number;
  height: number;
  width: number;
  restCenter: number;
};

type Feed<T> = {
  item: T;
  index: number;
  /** Distância do repouso até a borda inferior do cartão tocar a fenda. */
  gap: number;
  height: number;
  width: number;
  startY: number;
};

const TILT_PER_PX = 0.15;
const FALL_MS = 1400;
const COLLAPSE_MS = 200;
const INSTRUCTIONS = "Delete tritura o item. Alt e setas reordenam.";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function ShredList<T extends Identified>({
  ref,
  className,
  items,
  renderItem,
  onShred,
  onReorder,
  feedSpeed = 180,
  bite = 18,
  autoFeed = true,
  stripWidth = 10,
  curl = 1,
  dragTilt = 6,
  lift = 1.02,
  fallHeight = 140,
  gap = 10,
  disabled = false,
  random = Math.random,
  "aria-label": ariaLabel = "Lista",
  ...props
}: ShredListProps<T>) {
  const reduced = useShouldReduceMotion();
  const [drag, setDrag] = React.useState<{ id: string; dx: number; dy: number } | null>(null);
  const [feed, setFeed] = React.useState<Feed<T> | null>(null);
  const [feedY, setFeedY] = React.useState(0);
  const [collapsingId, setCollapsingId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const gesture = React.useRef<Gesture | null>(null);
  const cardRefs = React.useRef(new Map<string, HTMLLIElement>());
  const slitRef = React.useRef<HTMLDivElement>(null);
  // Evita reiniciar o efeito do puxão quando o pai troca as callbacks.
  const latest = React.useRef({ onShred, feedSpeed });
  latest.current = { onShred, feedSpeed };
  const busy = feed !== null || collapsingId !== null;

  React.useEffect(() => {
    if (!feed) return;
    const endY = feed.gap + feed.height;
    const started = performance.now();
    let frame = 0;
    let fallTimer: ReturnType<typeof setTimeout> | undefined;
    const step = (now: number) => {
      const y = feed.startY + feedDistance((now - started) / 1000, latest.current.feedSpeed);
      if (y < endY) {
        setFeedY(y);
        frame = requestAnimationFrame(step);
        return;
      }
      setFeedY(endY);
      fallTimer = setTimeout(() => {
        setFeed(null);
        setAnnouncement("Item removido");
        latest.current.onShred(feed.item);
      }, FALL_MS);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fallTimer);
    };
  }, [feed]);

  React.useEffect(() => {
    if (!collapsingId) return;
    const item = items.find((entry) => entry.id === collapsingId);
    const timer = setTimeout(() => {
      setCollapsingId(null);
      setAnnouncement("Item removido");
      if (item) latest.current.onShred(item);
    }, COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [collapsingId, items]);

  const measure = (id: string) => {
    const card = cardRefs.current.get(id)?.getBoundingClientRect();
    const slit = slitRef.current?.getBoundingClientRect();
    if (!card || !slit) return null;
    return {
      gap: slit.top - card.bottom,
      height: card.height,
      width: card.width,
      center: card.top + card.height / 2,
    };
  };

  const shred = (item: T, startY: number) => {
    const id = item.id;
    const box = measure(id);
    if (!box || busy) return;
    if (reduced) {
      setCollapsingId(id);
      return;
    }
    const index = items.findIndex((entry) => entry.id === id);
    setFeedY(startY);
    setFeed({ item, index, gap: box.gap, height: box.height, width: box.width, startY });
  };

  const reorderTo = (from: number, to: number) => {
    if (to === from || !onReorder) return;
    const next = moveItem(items, from, to);
    onReorder(next);
    setAnnouncement(`Item movido para a posição ${to + 1} de ${items.length}`);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLLIElement>, item: T) => {
    if (disabled || busy || event.button !== 0) return;
    const box = measure(item.id);
    if (!box) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gesture.current = {
      id: item.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      gap: box.gap,
      height: box.height,
      width: box.width,
      restCenter: box.center,
    };
    setDrag({ id: item.id, dx: 0, dy: 0 });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLLIElement>, item: T) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (autoFeed && dy - current.gap >= bite) {
      gesture.current = null;
      setDrag(null);
      shred(item, dy);
      return;
    }
    setDrag({ id: current.id, dx, dy });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLLIElement>, item: T) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    gesture.current = null;
    const dy = event.clientY - current.startY;
    setDrag(null);
    if (dy - current.gap >= bite) {
      shred(item, dy);
      return;
    }
    const from = items.findIndex((entry) => entry.id === item.id);
    const centers = items
      .filter((entry) => entry.id !== item.id)
      .map((entry) => measure(entry.id)?.center ?? 0);
    reorderTo(from, reorderIndex(centers, current.restCenter + dy));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>, item: T, index: number) => {
    if (disabled || event.target !== event.currentTarget) return;
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      shred(item, 0);
    } else if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      const target = index + (event.key === "ArrowUp" ? -1 : 1);
      if (target >= 0 && target < items.length) reorderTo(index, target);
    }
  };

  const cardStyle = (item: T): React.CSSProperties => {
    if (feed?.item.id === item.id) {
      const passed = clamp(feedY - feed.gap, 0, feed.height);
      return { transform: `translateY(${feedY}px)`, clipPath: `inset(0 0 ${passed}px 0)` };
    }
    if (drag?.id !== item.id) return {};
    const tilt = reduced ? 0 : clamp(drag.dx * TILT_PER_PX, -dragTilt, dragTilt);
    const scale = reduced ? 1 : lift;
    return { transform: `translateY(${drag.dy}px) rotate(${tilt}deg) scale(${scale})` };
  };

  return (
    <div ref={ref} data-slot="shred-list" className={cn("relative", className)} {...props}>
      <p className="sr-only">{INSTRUCTIONS}</p>
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
      <ul aria-label={ariaLabel} className="m-0 flex list-none flex-col p-0" style={{ gap }}>
        {items.map((item, index) => {
          const active = drag?.id === item.id || feed?.item.id === item.id;
          return (
            <motion.li
              key={item.id}
              ref={(node: HTMLLIElement | null) => {
                if (node) cardRefs.current.set(item.id, node);
                else cardRefs.current.delete(item.id);
              }}
              data-slot="shred-list-item"
              data-state={active ? "active" : "idle"}
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled || undefined}
              className={cn(
                "relative touch-none select-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !disabled && "cursor-grab",
                drag?.id === item.id && "z-10 cursor-grabbing shadow-lg",
                feed?.item.id === item.id && "z-10",
                collapsingId === item.id && "overflow-hidden"
              )}
              initial={false}
              animate={collapsingId === item.id ? { opacity: 0, height: 0 } : undefined}
              transition={{ duration: COLLAPSE_MS / 1000 }}
              onPointerDown={(event) => handlePointerDown(event, item)}
              onPointerMove={(event) => handlePointerMove(event, item)}
              onPointerUp={(event) => handlePointerEnd(event, item)}
              onPointerCancel={(event) => handlePointerEnd(event, item)}
              onKeyDown={(event) => handleKeyDown(event, item, index)}
            >
              <div className="rounded-lg" style={cardStyle(item)}>
                {renderItem(item, index)}
              </div>
            </motion.li>
          );
        })}
      </ul>
      <div
        ref={slitRef}
        data-slot="shred-list-slit"
        aria-hidden="true"
        className="mt-2 h-1 rounded-full bg-border"
      />
      <div aria-hidden="true" className="relative overflow-hidden" style={{ height: fallHeight }}>
        {feed && !reduced && (
          <Strips
            feed={feed}
            passed={clamp(feedY - feed.gap, 0, feed.height)}
            stripWidth={stripWidth}
            curl={curl}
            fallHeight={fallHeight}
            random={random}
            renderItem={renderItem}
          />
        )}
      </div>
    </div>
  );
}

type StripsProps<T extends Identified> = {
  feed: Feed<T>;
  passed: number;
  stripWidth: number;
  curl: number;
  fallHeight: number;
  random: () => number;
  renderItem: (item: T, index: number) => React.ReactNode;
};

/** O pedaço que passou da fenda: N cópias do cartão, cada uma recortada na sua coluna. */
function Strips<T extends Identified>({
  feed,
  passed,
  stripWidth,
  curl,
  fallHeight,
  random,
  renderItem,
}: StripsProps<T>) {
  const motions = React.useMemo(() => {
    const count = stripCount(feed.width, stripWidth);
    return Array.from({ length: count }, (_, i) => stripMotion(i, count, curl, random));
  }, [feed.width, stripWidth, curl, random]);

  return motions.map((move, i) => (
    <motion.div
      // biome-ignore lint/suspicious/noArrayIndexKey: as tiras são posições fixas de uma grade
      key={i}
      data-slot="shred-list-strip"
      className="absolute top-0 left-0 w-full overflow-hidden"
      style={{ height: passed, clipPath: stripClip(i, motions.length) }}
      initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: fallHeight,
        x: [0, move.drift, -move.drift * 0.5, move.drift * 0.3],
        rotate: move.rotate,
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 1, delay: move.delay, ease: "easeIn" }}
    >
      <div
        inert
        aria-hidden="true"
        style={{ transform: `translateY(${passed - feed.height}px)`, height: feed.height }}
      >
        {renderItem(feed.item, feed.index)}
      </div>
    </motion.div>
  ));
}

ShredList.displayName = "ShredList";

export { ShredList };
