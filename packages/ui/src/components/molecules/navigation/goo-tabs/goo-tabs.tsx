"use client";

import { animate, motion, useMotionValue } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { GooFilter, GooParticle, type ParticleSpec } from "./goo-tabs-parts";
import { filterIdFrom, mulberry32, particleDuration, particlePath } from "./goo-tabs-utils";

export type GooTabsItem = { value: string; label: string; href?: string };

export type GooTabsProps = Omit<React.ComponentProps<"nav">, "onChange"> & {
  items: GooTabsItem[];
  /** Valor ativo (modo controlado). */
  value?: string;
  /** Valor inicial no modo não controlado; padrão: o primeiro item. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Duração do pulo em ms. */
  duration?: number;
  particleCount?: number;
  /** Distâncias externa e interna das bolinhas em px. */
  particleDistances?: [number, number];
};

const ITEM_CLASS =
  "relative z-10 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

function useActiveValue(items: GooTabsItem[], value?: string, defaultValue?: string) {
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.value ?? "");
  const isControlled = value !== undefined;
  return { active: isControlled ? value : internal, setInternal, isControlled };
}

/** O texto troca de cor no meio do pulo; em movimento reduzido, na hora. */
function useDelayedValue(target: string, delay: number, immediate: boolean): string {
  const [shown, setShown] = React.useState(target);
  React.useEffect(() => {
    if (immediate) {
      setShown(target);
      return;
    }
    const timer = setTimeout(() => setShown(target), delay);
    return () => clearTimeout(timer);
  }, [target, delay, immediate]);
  return immediate ? target : shown;
}

function usePillGeometry(
  itemRefs: React.RefObject<Map<string, HTMLElement>>,
  active: string,
  duration: number,
  reduced: boolean
) {
  const x = useMotionValue(0);
  const width = useMotionValue(0);
  const first = React.useRef(true);

  const measure = React.useCallback(
    (animated: boolean) => {
      const el = itemRefs.current.get(active);
      if (!el) return;
      if (!animated || reduced || first.current) {
        x.set(el.offsetLeft);
        width.set(el.offsetWidth);
        first.current = false;
        return;
      }
      // Mola criada por evento: trocar o config do useSpring prenderia o alvo antigo.
      const spring = { type: "spring" as const, duration: duration / 1000, bounce: 0.25 };
      animate(x, el.offsetLeft, spring);
      animate(width, el.offsetWidth, spring);
    },
    [itemRefs, active, duration, reduced, x, width]
  );

  React.useLayoutEffect(() => {
    measure(true);
  }, [measure]);

  React.useEffect(() => {
    const el = itemRefs.current.get(active);
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure(false));
    observer.observe(el);
    return () => observer.disconnect();
  }, [itemRefs, active, measure]);

  return { x, width };
}

type SpawnOptions = {
  count: number;
  distances: [number, number];
  duration: number;
};

function useParticles({ count, distances, duration }: SpawnOptions) {
  const [particles, setParticles] = React.useState<ParticleSpec[]>([]);
  const rand = React.useRef(mulberry32(0x9e3779b9));
  const nextId = React.useRef(0);
  const timers = React.useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  const spawn = React.useCallback(
    (left: number, top: number) => {
      if (count < 1) return;
      const batch: ParticleSpec[] = Array.from({ length: count }, (_, i) => {
        const path = particlePath(i, count, distances, rand.current);
        const ms = particleDuration(duration, path.durationOffset);
        return { id: nextId.current++, left, top, path, duration: ms };
      });
      setParticles((current) => [...current, ...batch]);
      const ids = new Set(batch.map((p) => p.id));
      const timer = setTimeout(
        () => {
          timers.current.delete(timer);
          setParticles((current) => current.filter((p) => !ids.has(p.id)));
        },
        Math.max(...batch.map((p) => p.duration))
      );
      timers.current.add(timer);
    },
    [count, distances, duration]
  );

  return { particles, spawn };
}

function moveFocus(event: React.KeyboardEvent, itemRefs: Map<string, HTMLElement>) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const nodes = [...itemRefs.values()];
  const current = nodes.indexOf(document.activeElement as HTMLElement);
  if (current === -1) return;
  const step = event.key === "ArrowRight" ? 1 : -1;
  event.preventDefault();
  nodes[(current + step + nodes.length) % nodes.length]?.focus();
}

function GooTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  duration = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  className,
  onKeyDown,
  "aria-label": ariaLabel = "Navegação principal",
  ref,
  ...props
}: GooTabsProps) {
  if (items.length === 0) {
    throw new Error("GooTabs: received items=[] (length 0), expected at least 1 item");
  }
  const reduced = useShouldReduceMotion();
  const filterId = filterIdFrom(React.useId());
  const itemRefs = React.useRef(new Map<string, HTMLElement>());
  const { active, setInternal, isControlled } = useActiveValue(items, value, defaultValue);
  const textValue = useDelayedValue(active, duration / 2, reduced);
  const pill = usePillGeometry(itemRefs, active, duration, reduced);
  const { particles, spawn } = useParticles({
    count: particleCount,
    distances: particleDistances,
    duration,
  });

  const select = (item: GooTabsItem) => {
    if (item.value === active) return;
    if (!isControlled) setInternal(item.value);
    onValueChange?.(item.value);
    const el = itemRefs.current.get(item.value);
    if (el && !reduced)
      spawn(el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight / 2);
  };

  const register = (itemValue: string) => (node: HTMLElement | null) => {
    if (node) itemRefs.current.set(itemValue, node);
    else itemRefs.current.delete(itemValue);
  };

  return (
    <nav
      ref={ref}
      data-slot="goo-tabs"
      aria-label={ariaLabel}
      className={cn("relative inline-flex rounded-full bg-muted p-1", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        moveFocus(event, itemRefs.current);
      }}
      {...props}
    >
      {!reduced && <GooFilter id={filterId} />}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-1 z-0"
        style={reduced ? undefined : { filter: `url(#${filterId})` }}
      >
        <motion.span
          data-slot="goo-tabs-pill"
          className="absolute top-0 left-0 h-full rounded-full bg-primary"
          style={{ x: pill.x, width: pill.width }}
        />
        {particles.map((spec) => (
          <GooParticle key={spec.id} spec={spec} />
        ))}
      </div>
      <ul className="relative z-10 m-0 flex list-none gap-1 p-0">
        {items.map((item) => (
          <li key={item.value}>
            <GooTabItem
              item={item}
              isActive={item.value === active}
              isTextActive={item.value === textValue && item.value === active}
              register={register(item.value)}
              onSelect={() => select(item)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
GooTabs.displayName = "GooTabs";

type GooTabItemProps = {
  item: GooTabsItem;
  isActive: boolean;
  isTextActive: boolean;
  register: (node: HTMLElement | null) => void;
  onSelect: () => void;
};

function GooTabItem({ item, isActive, isTextActive, register, onSelect }: GooTabItemProps) {
  const shared = {
    "data-slot": "goo-tabs-item",
    "data-active": isActive,
    "aria-current": isActive ? ("page" as const) : undefined,
    className: cn(
      ITEM_CLASS,
      isTextActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
    ),
    onClick: onSelect,
  };
  if (item.href) {
    return (
      <a {...shared} href={item.href} ref={register}>
        {item.label}
      </a>
    );
  }
  return (
    <button {...shared} type="button" ref={register}>
      {item.label}
    </button>
  );
}

export { GooTabs };
