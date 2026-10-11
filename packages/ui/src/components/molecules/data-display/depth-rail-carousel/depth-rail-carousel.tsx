"use client";

import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  DepthRailCard,
  DepthRailControls,
  DepthRailDots,
  type DepthRailItem,
} from "./depth-rail-carousel-parts";
import {
  assertCarouselOptions,
  cycleOffset,
  type RailSide,
  railPose,
  stepIndex,
} from "./depth-rail-carousel-utils";

export type { DepthRailItem } from "./depth-rail-carousel-parts";

export type DepthRailCarouselProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  items: DepthRailItem[];
  cardWidth?: number;
  cardHeight?: number;
  depth?: number;
  spread?: number;
  tilt?: number;
  side?: RailSide;
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  index?: number;
  defaultIndex?: number;
  onChange?: (index: number) => void;
};

const DRAG_DISTANCE = 60;
const DRAG_VELOCITY = 400;
// Abaixo disso é toque, não arrasto: evita que a velocidade de um clique troque o cartão.
const DRAG_MIN = 8;

function useDocumentHidden() {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return hidden;
}

function DepthRailCarousel({
  items,
  cardWidth = 300,
  cardHeight = 380,
  depth = 220,
  spread = 90,
  tilt = 22,
  side = "right",
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  autoplay = false,
  autoplayDelay = 3200,
  loop = true,
  showControls = true,
  showIndicators = true,
  index: indexProp,
  defaultIndex = 0,
  onChange,
  className,
  style,
  "aria-label": ariaLabel = "Carrossel",
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: DepthRailCarouselProps) {
  const count = items.length;
  assertCarouselOptions({ count, visibleCards, falloff });

  const reduced = useShouldReduceMotion();
  const hiddenTab = useDocumentHidden();
  const [inner, setInner] = React.useState(defaultIndex);
  const controlled = indexProp !== undefined;
  const active = Math.min(count - 1, Math.max(0, controlled ? indexProp : inner));

  // Guarda o cartão anterior para ele sair de cena pelo lado, em vez de cruzar o trilho.
  const [tracked, setTracked] = React.useState(active);
  const [previous, setPrevious] = React.useState(active);
  if (tracked !== active) {
    setPrevious(tracked);
    setTracked(active);
  }

  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const paused = hovered || focused || hiddenTab;
  const autoplaying = autoplay && !reduced;

  const goTo = React.useCallback(
    (next: number) => {
      if (next === active) return;
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [active, controlled, onChange]
  );
  const step = React.useCallback(
    (dir: 1 | -1) => goTo(stepIndex(active, dir, count, loop)),
    [goTo, active, count, loop]
  );

  React.useEffect(() => {
    if (!autoplaying || paused) return;
    if (!loop && active >= count - 1) return;
    const id = setTimeout(() => step(1), autoplayDelay);
    return () => clearTimeout(id);
  }, [autoplaying, paused, loop, active, count, autoplayDelay, step]);

  const drag = React.useRef<{ x: number; t: number } | null>(null);
  const finishDrag = (clientX: number, timeStamp: number) => {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = clientX - start.x;
    const velocity = (dx / Math.max(1, timeStamp - start.t)) * 1000;
    const swiped =
      Math.abs(dx) > DRAG_DISTANCE ||
      (Math.abs(dx) > DRAG_MIN && Math.abs(velocity) > DRAG_VELOCITY);
    if (swiped) step(dx < 0 ? 1 : -1);
  };

  const poseOpts = {
    side,
    cardWidth,
    depth,
    spread,
    tilt,
    falloff,
    blur: reduced ? 0 : blur,
    visibleCards,
  };
  const seconds = reduced ? 0 : duration / 1000;
  const liveOff = autoplaying && !paused;

  return (
    // biome-ignore lint/a11y/useSemanticElements: a spec pede role region com aria-roledescription
    <div
      ref={ref}
      data-slot="depth-rail-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label={ariaLabel}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a raiz recebe foco para o teclado
      tabIndex={0}
      className={cn(
        "relative w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      style={style}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (e.pointerType === "mouse" || e.pointerType === "pen") setHovered(true);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        setHovered(false);
      }}
      onFocus={(e) => {
        onFocus?.(e);
        setFocused(true);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      {...props}
    >
      <div
        className="relative w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ height: cardHeight + 96, perspective, touchAction: "pan-y" }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, t: e.timeStamp };
        }}
        onPointerUp={(e) => finishDrag(e.clientX, e.timeStamp)}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {items.map((item, i) => {
          const offset = cycleOffset(i, active, count, loop);
          const exiting =
            loop && i === previous && offset >= visibleCards && active === (previous + 1) % count;
          return (
            <DepthRailCard
              key={item.id}
              item={item}
              index={i}
              total={count}
              offset={offset}
              pose={railPose(exiting ? -1 : offset, poseOpts)}
              active={i === active}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              duration={seconds}
            />
          );
        })}
        {showControls && (
          <DepthRailControls
            canPrev={loop || active > 0}
            canNext={loop || active < count - 1}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />
        )}
      </div>
      {showIndicators && <DepthRailDots items={items} active={active} onSelect={goTo} />}
      <div className="sr-only" aria-live={liveOff ? "off" : "polite"} aria-atomic="true">
        {items[active]?.label}
      </div>
    </div>
  );
}

DepthRailCarousel.displayName = "DepthRailCarousel";

export { DepthRailCarousel };
