"use client";

import { type MotionValue, motion, motionValue, useTransform } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  coveredCount,
  type LayerOptions,
  layerStyle,
  pinOffset,
  type StackCardMeasure,
  type StackTop,
  stickyTop,
} from "./stacking-cards-utils";

type CardLayer = {
  scale: MotionValue<number>;
  dim: MotionValue<number>;
  blur: MotionValue<number>;
};

type CardContextValue = {
  index: number;
  top: string;
  marginBottom: number;
  layer: CardLayer;
  withBlur: boolean;
  register: (el: HTMLElement | null) => void;
};

const CardContext = React.createContext<CardContextValue | null>(null);

export type StackingCardsProps = React.ComponentProps<"div"> & {
  /** Os `StackingCard`, como filhos diretos: o índice de cada um sai desta lista. Um componente que devolve vários cartões conta como um só. */
  children: React.ReactNode;
  itemGap?: number;
  stackOffset?: number;
  stackTop?: StackTop;
  itemScale?: number;
  minScale?: number;
  dimAmount?: number;
  blurAmount?: number;
  holdDistance?: number;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  onStackComplete?: () => void;
};

export type StackingCardProps = React.ComponentProps<"div">;

// Considera "pousado" com meio pixel de folga: a subpixelagem do sticky nunca fecha em zero exato.
const LANDED_EPSILON = 0.5;

function createLayers(count: number): CardLayer[] {
  return Array.from({ length: count }, () => ({
    scale: motionValue(1),
    dim: motionValue(0),
    blur: motionValue(0),
  }));
}

function measureCards(
  els: (HTMLElement | null)[],
  scroller: HTMLElement | null,
  p: { stackTop: StackTop; stackOffset: number; itemGap: number }
): StackCardMeasure[] {
  const viewportHeight = scroller ? scroller.clientHeight : window.innerHeight;
  const viewportTop = scroller ? scroller.getBoundingClientRect().top : 0;
  const present = els.filter((el): el is HTMLElement => el !== null);
  return present.map((el, i) => ({
    top: el.getBoundingClientRect().top,
    pinTop: viewportTop + pinOffset(p.stackTop, i, p.stackOffset, viewportHeight),
    // offsetHeight ignora a escala aplicada ao cartão anterior; o rect encolheria com ela.
    travel:
      p.itemGap +
      (i > 0 ? present[i - 1].offsetHeight || present[i - 1].getBoundingClientRect().height : 0),
  }));
}

function useStackMeasure(args: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  cardsRef: React.RefObject<(HTMLElement | null)[]>;
  layers: CardLayer[];
  layerOpts: LayerOptions;
  stackTop: StackTop;
  stackOffset: number;
  itemGap: number;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  onStackComplete?: () => void;
}) {
  const latest = React.useRef(args);
  latest.current = args;
  const completed = React.useRef(false);
  const scrollTarget = args.scrollContainer;

  React.useEffect(() => {
    const scroller = scrollTarget?.current ?? null;
    const target: HTMLElement | Window = scroller ?? window;

    const update = () => {
      const a = latest.current;
      const cards = measureCards(a.cardsRef.current, scroller, a);
      cards.forEach((_, i) => {
        const style = layerStyle(coveredCount(i, cards), a.layerOpts);
        a.layers[i]?.scale.set(style.scale);
        a.layers[i]?.dim.set(style.dim);
        a.layers[i]?.blur.set(style.blur);
      });
      const last = cards[cards.length - 1];
      if (!last) return;
      const gap = last.top - last.pinTop;
      if (gap <= LANDED_EPSILON && !completed.current) {
        completed.current = true;
        a.onStackComplete?.();
      } else if (gap > LANDED_EPSILON) {
        completed.current = false;
      }
    };

    update();
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (args.rootRef.current) observer?.observe(args.rootRef.current);
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [scrollTarget, args.rootRef]);
}

function StackingCards({
  children,
  itemGap = 100,
  stackOffset = 24,
  stackTop = "15%",
  itemScale = 0.05,
  minScale = 0.8,
  dimAmount = 0.2,
  blurAmount = 0,
  holdDistance = 200,
  scrollContainer,
  onStackComplete,
  className,
  ref,
  ...props
}: StackingCardsProps) {
  const items = React.Children.toArray(children);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const cardsRef = React.useRef<(HTMLElement | null)[]>([]);
  const layers = React.useMemo(() => createLayers(items.length), [items.length]);
  const layerOpts = { itemScale, minScale, dimAmount, blurAmount };

  useStackMeasure({
    rootRef,
    cardsRef,
    layers,
    layerOpts,
    stackTop,
    stackOffset,
    itemGap,
    scrollContainer,
    onStackComplete,
  });

  return (
    // biome-ignore lint/a11y/useSemanticElements: o sticky exige cartões div; role mantém a semântica de lista
    <div
      ref={(node) => {
        rootRef.current = node;
        assignRef(ref, node);
      }}
      role="list"
      data-slot="stacking-cards"
      className={cn("relative w-full", className)}
      {...props}
    >
      {items.map((child, index) => (
        <CardContext.Provider
          key={React.isValidElement(child) && child.key !== null ? child.key : index}
          value={{
            index,
            top: stickyTop(stackTop, index, stackOffset),
            marginBottom: itemGap,
            layer: layers[index],
            withBlur: blurAmount > 0,
            register: (el) => {
              cardsRef.current[index] = el;
            },
          }}
        >
          {child}
        </CardContext.Provider>
      ))}
      <div aria-hidden="true" style={{ height: holdDistance }} />
    </div>
  );
}
StackingCards.displayName = "StackingCards";

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

const toBlur = (px: number) => `blur(${px}px)`;

function StackingCard({ className, children, style, ref, ...props }: StackingCardProps) {
  const ctx = React.useContext(CardContext);
  const reduced = useShouldReduceMotion();
  const blurFilter = useTransform(ctx?.layer.blur ?? ZERO, toBlur);
  const animate = ctx !== null && !reduced;

  const setRef = (node: HTMLDivElement | null) => {
    ctx?.register(node);
    assignRef(ref, node);
  };

  const base = cn(
    "relative min-h-80 rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-xl",
    ctx && "sticky",
    className
  );
  const common = {
    ref: setRef,
    role: "listitem",
    "data-slot": "stacking-card",
    "data-index": ctx?.index,
    className: base,
  } as const;
  const placement = ctx ? { top: ctx.top, marginBottom: ctx.marginBottom } : {};

  if (!animate) {
    return (
      <div {...props} {...common} style={{ ...placement, ...style }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      {...common}
      style={{
        ...placement,
        ...style,
        scale: ctx.layer.scale,
        transformOrigin: "top center",
        ...(ctx.withBlur ? { filter: blurFilter } : {}),
      }}
    >
      {children}
      <motion.div
        aria-hidden="true"
        data-slot="stacking-card-dim"
        className="pointer-events-none absolute inset-0 rounded-3xl bg-foreground"
        style={{ opacity: ctx.layer.dim }}
      />
    </motion.div>
  );
}
StackingCard.displayName = "StackingCard";

const ZERO = motionValue(0);

export { StackingCard, StackingCards };
