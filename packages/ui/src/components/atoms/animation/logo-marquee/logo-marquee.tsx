"use client";

import * as React from "react";
import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { approach, copiesNeeded, wrapOffset } from "./logo-marquee-utils";

export type LogoMarqueeItem =
  | { node: React.ReactNode; title?: string; href?: string }
  | { src: string; alt: string; title?: string; href?: string };

type Direction = "left" | "right" | "up" | "down";

export type LogoMarqueeProps = Omit<React.ComponentProps<"div">, "children"> & {
  items: LogoMarqueeItem[];
  /** px/s; negativo inverte. */
  speed?: number;
  direction?: Direction;
  /** Altura de cada item em px. */
  itemHeight?: number;
  gap?: number;
  /** Velocidade (px/s) com o mouse em cima. 0 = para; undefined = não muda. */
  hoverSpeed?: number;
  fadeEdges?: boolean;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoMarqueeItem, key: React.Key) => React.ReactNode;
  "aria-label"?: string;
};

// Constante de tempo da troca de velocidade (s).
const TAU = 0.25;
// Limita o salto após aba escondida ou quadro perdido.
const MAX_DT = 0.1;

function isVertical(direction: Direction): boolean {
  return direction === "up" || direction === "down";
}

function directionSign(direction: Direction): 1 | -1 {
  return direction === "left" || direction === "up" ? 1 : -1;
}

function ItemContent({
  item,
  itemHeight,
  renderItem,
  keyId,
}: {
  item: LogoMarqueeItem;
  itemHeight: number;
  renderItem?: LogoMarqueeProps["renderItem"];
  keyId: string;
}) {
  if (renderItem) return <>{renderItem(item, keyId)}</>;
  if ("src" in item) {
    return (
      <img
        src={item.src}
        alt={item.alt}
        height={itemHeight}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-auto max-w-none"
      />
    );
  }
  return <>{item.node}</>;
}

function MarqueeItem({
  item,
  hidden,
  itemHeight,
  scaleOnHover,
  renderItem,
  keyId,
}: {
  item: LogoMarqueeItem;
  hidden: boolean;
  itemHeight: number;
  scaleOnHover: boolean;
  renderItem?: LogoMarqueeProps["renderItem"];
  keyId: string;
}) {
  const content = (
    <ItemContent item={item} itemHeight={itemHeight} renderItem={renderItem} keyId={keyId} />
  );
  return (
    <div
      data-slot="logo-marquee-item"
      title={item.title}
      className={cn(
        "flex shrink-0 items-center text-foreground transition-transform duration-200",
        scaleOnHover && "[@media(hover:hover)]:hover:scale-110"
      )}
      style={{ height: itemHeight }}
    >
      {item.href ? (
        <a
          href={item.href}
          tabIndex={hidden ? -1 : undefined}
          className="flex h-full items-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function fadeMask(vertical: boolean): React.CSSProperties {
  const dir = vertical ? "to bottom" : "to right";
  const mask = `linear-gradient(${dir}, transparent, currentColor 10%, currentColor 90%, transparent)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

function measureAxis(el: HTMLElement | null, vertical: boolean): number {
  if (!el) return 0;
  return vertical ? el.offsetHeight : el.offsetWidth;
}

function useInView(ref: React.RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = React.useState(true);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function LogoMarquee({
  items,
  speed = 60,
  direction = "left",
  itemHeight = 28,
  gap = 40,
  hoverSpeed = 0,
  fadeEdges = false,
  scaleOnHover = false,
  renderItem,
  "aria-label": ariaLabel = "Logos de parceiros",
  className,
  style,
  ref,
  ...props
}: LogoMarqueeProps) {
  const reduced = useShouldReduceMotion();
  const vertical = isVertical(direction);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [copies, setCopies] = React.useState(2);
  const [focused, setFocused] = React.useState(false);
  const inView = useInView(rootRef);
  const motion = React.useRef({
    offset: 0,
    velocity: null as number | null,
    last: null as number | null,
    size: 0,
  });
  const hoveredRef = React.useRef(false);
  const focusedRef = React.useRef(false);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const measure = React.useCallback(() => {
    const copy = trackRef.current?.querySelector<HTMLElement>("[data-copy]") ?? null;
    const size = measureAxis(copy, vertical);
    motion.current.size = size;
    setCopies(copiesNeeded(size, measureAxis(rootRef.current, vertical)));
  }, [vertical]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: items, gap e itemHeight mudam o tamanho da cópia e exigem nova medição
  React.useLayoutEffect(() => {
    if (reduced) return;
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    const copy = trackRef.current?.querySelector("[data-copy]");
    if (copy) observer.observe(copy);
    return () => observer.disconnect();
  }, [measure, reduced, items, gap, itemHeight]);

  const sign = directionSign(direction);
  useFrameLoop((now) => {
    const m = motion.current;
    const dt = m.last === null ? 0 : Math.min((now - m.last) / 1000, MAX_DT);
    m.last = now;
    const base = hoveredRef.current && hoverSpeed !== undefined ? hoverSpeed : speed;
    const target = focusedRef.current ? 0 : base * sign;
    m.velocity = approach(m.velocity ?? target, target, dt, TAU);
    m.offset = wrapOffset(m.offset + m.velocity * dt, m.size);
    const shift = -m.offset;
    if (trackRef.current) {
      trackRef.current.style.transform = vertical
        ? `translate3d(0, ${shift}px, 0)`
        : `translate3d(${shift}px, 0, 0)`;
    }
  }, !reduced && inView);

  const onPointer = (value: boolean) => (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") hoveredRef.current = value;
  };

  const visibleCopies = reduced ? 1 : copies;
  return (
    // biome-ignore lint/a11y/useSemanticElements: a raiz é div para manter o ref e o tipo ComponentProps<"div">
    <div
      ref={setRefs}
      role="region"
      aria-label={ariaLabel}
      data-slot="logo-marquee"
      data-direction={direction}
      data-paused={focused ? "true" : "false"}
      className={cn("relative overflow-hidden", className)}
      style={{ ...(fadeEdges ? fadeMask(vertical) : null), ...style }}
      onPointerEnter={onPointer(true)}
      onPointerLeave={onPointer(false)}
      onFocus={() => {
        focusedRef.current = true;
        setFocused(true);
      }}
      onBlur={() => {
        focusedRef.current = false;
        setFocused(false);
      }}
      {...props}
    >
      <div
        ref={trackRef}
        data-slot="logo-marquee-track"
        className={cn(
          "flex will-change-transform",
          reduced ? "flex-wrap justify-center" : vertical ? "h-max flex-col" : "w-max"
        )}
        style={reduced ? { gap } : undefined}
      >
        {Array.from({ length: visibleCopies }, (_, copy) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: cópias idênticas, ordem fixa
            key={copy}
            data-copy={copy}
            aria-hidden={copy > 0 ? true : undefined}
            className={cn(
              "flex shrink-0 items-center",
              vertical && "flex-col",
              reduced && "flex-wrap justify-center"
            )}
            style={{
              gap,
              ...(reduced ? null : vertical ? { paddingBottom: gap } : { paddingRight: gap }),
            }}
          >
            {items.map((item, index) => (
              <MarqueeItem
                // biome-ignore lint/suspicious/noArrayIndexKey: lista estática
                key={index}
                item={item}
                hidden={copy > 0}
                itemHeight={itemHeight}
                scaleOnHover={scaleOnHover}
                renderItem={renderItem}
                keyId={`${copy}-${index}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
LogoMarquee.displayName = "LogoMarquee";

export { LogoMarquee };
