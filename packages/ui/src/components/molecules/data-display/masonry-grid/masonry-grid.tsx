/**
 * MasonryGrid Component - Flowtomic UI
 *
 * Mural em colunas de alturas variadas, sem buracos: cada item vai para a coluna mais baixa.
 * Na montagem os itens entram de uma direção, desfocados, em sequência; ao redimensionar
 * deslizam para a nova posição; no hover encolhem de leve.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/masonry-grid.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type Breakpoint,
  columnsFor,
  DEFAULT_BREAKPOINTS,
  layoutMasonry,
  type MasonryAnimateFrom,
  type MasonryPlacement,
  startPosition,
} from "./masonry-grid-utils";

export type MasonryItem = {
  id: string;
  /** Altura do item em px. */
  height: number;
  content: React.ReactNode;
  href?: string;
};

export type MasonryGridProps = React.ComponentProps<"div"> & {
  items: MasonryItem[];
  /** Colunas por largura mínima: [largura px, colunas], do maior para o menor. */
  breakpoints?: Breakpoint[];
  /** Espaço entre itens em px. @default 16 */
  gap?: number;
  /** De onde os itens entram na primeira medição. @default "bottom" */
  animateFrom?: MasonryAnimateFrom;
  /** Segundos de cada animação. @default 0.6 */
  duration?: number;
  /** Segundos de atraso entre um item e o próximo na entrada. @default 0.05 */
  stagger?: number;
  /** Entra desfocado e foca. @default true */
  blurToFocus?: boolean;
  /** Escala no hover; false desliga. @default 0.95 */
  hoverScale?: number | false;
};

const ENTRY_BLUR = "blur(10px)";
const FOCUSED_BLUR = "blur(0px)";

// Largura medida pelo ResizeObserver; null até a primeira medição.
function useMeasuredWidth(rootRef: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = React.useState<number | null>(null);
  React.useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootRef]);
  return width;
}

type ItemProps = {
  item: MasonryItem;
  index: number;
  place: MasonryPlacement;
  root: { width: number; height: number };
  animateFrom: MasonryAnimateFrom;
  blur: boolean;
  reduced: boolean;
  entering: boolean;
  duration: number;
  stagger: number;
  hoverScale: number | false;
};

function MasonryCell({
  item,
  index,
  place,
  root,
  animateFrom,
  blur,
  reduced,
  entering,
  duration,
  stagger,
  hoverScale,
}: ItemProps) {
  const target = { x: place.x, y: place.y, width: place.w, height: place.h, opacity: 1 };
  const from = startPosition(animateFrom, index, place, root);
  const initial = reduced
    ? false
    : {
        ...target,
        ...from,
        opacity: 0,
        ...(blur ? { filter: ENTRY_BLUR } : {}),
      };
  const animate = blur ? { ...target, filter: FOCUSED_BLUR } : target;
  const transition = reduced
    ? { duration: 0 }
    : { duration, ease: "easeOut" as const, delay: entering ? index * stagger : 0 };
  const Tag: React.ElementType = item.href ? motion.a : motion.div;

  return (
    <Tag
      data-slot="masonry-grid-item"
      role="listitem"
      href={item.href}
      initial={initial}
      animate={animate}
      transition={transition}
      whileHover={reduced || hoverScale === false ? undefined : { scale: hoverScale }}
      className="absolute top-0 left-0 block overflow-hidden rounded-xl border border-border bg-card"
    >
      {item.content}
    </Tag>
  );
}

function MasonryGrid({
  ref,
  className,
  style,
  items,
  breakpoints = DEFAULT_BREAKPOINTS,
  gap = 16,
  animateFrom = "bottom",
  duration = 0.6,
  stagger = 0.05,
  blurToFocus = true,
  hoverScale = 0.95,
  ...props
}: MasonryGridProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useShouldReduceMotion();
  const width = useMeasuredWidth(rootRef);
  // Só a primeira medição entra com atraso; depois é reflow, sem atraso.
  const entered = React.useRef(false);
  React.useEffect(() => {
    if (width !== null) entered.current = true;
  }, [width]);

  const layout = React.useMemo(
    () =>
      width === null ? null : layoutMasonry(items, width, columnsFor(width, breakpoints), gap),
    [items, width, breakpoints, gap]
  );

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: itens são posicionados em absoluto, ul/li não servem
    <div
      ref={setRefs}
      data-slot="masonry-grid"
      role="list"
      className={cn("relative w-full", className)}
      style={{ ...style, height: layout?.height ?? 0 }}
      {...props}
    >
      {layout &&
        width !== null &&
        items.map((item, index) => (
          <MasonryCell
            key={item.id}
            item={item}
            index={index}
            place={layout.items[index]}
            root={{ width, height: layout.height }}
            animateFrom={animateFrom}
            blur={blurToFocus && !reduced}
            reduced={reduced}
            entering={!entered.current}
            duration={duration}
            stagger={stagger}
            hoverScale={hoverScale}
          />
        ))}
    </div>
  );
}

MasonryGrid.displayName = "MasonryGrid";

export { MasonryGrid };
