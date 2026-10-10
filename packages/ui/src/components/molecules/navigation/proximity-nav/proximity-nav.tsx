"use client";

import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  formatIndex,
  type ProximityFalloff,
  proximity,
  tickInfluence,
} from "./proximity-nav-utils";

export type ProximityNavProps = Omit<React.ComponentProps<"nav">, "onChange"> & {
  items: string[];
  showIndex?: boolean;
  showMarker?: boolean;
  /** Alcance vertical do ponteiro, em px. */
  radius?: number;
  /** Deslize horizontal máximo do rótulo, em px. */
  maxShift?: number;
  falloff?: ProximityFalloff;
  markerLength?: number;
  tickScale?: number;
  itemGap?: number;
  activeIndex?: number | null;
  defaultActiveIndex?: number | null;
  onItemSelect?: (index: number, label: string) => void;
};

type VarStyle = React.CSSProperties & Record<`--${string}`, string | number>;

const ITEM_SELECTOR = '[data-slot="proximity-nav-item"]';
const TICK_SELECTOR = '[data-slot="proximity-nav-tick"]';

// Escreve direto no DOM: um pointermove não pode custar um re-render da lista.
function applyInfluences(root: HTMLElement, values: number[]): void {
  root.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach((el, i) => {
    el.style.setProperty("--p", String(values[i] ?? 0));
  });
  root.querySelectorAll<HTMLElement>(TICK_SELECTOR).forEach((el, i) => {
    el.style.setProperty("--t", String(tickInfluence(values[i] ?? 0, values[i + 1] ?? 0)));
  });
}

function measureInfluences(
  root: HTMLElement,
  pointerY: number,
  radius: number,
  falloff: ProximityFalloff
): number[] {
  return Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR), (el) => {
    const rect = el.getBoundingClientRect();
    return proximity(pointerY - (rect.top + rect.height / 2), radius, falloff);
  });
}

function useActiveIndex(
  controlled: number | null | undefined,
  initial: number | null
): [number | null, (index: number) => void] {
  const [internal, setInternal] = React.useState<number | null>(initial);
  return [controlled !== undefined ? controlled : internal, setInternal];
}

function ProximityNav({
  items,
  showIndex = true,
  showMarker = true,
  radius = 100,
  maxShift = 30,
  falloff = "smooth",
  markerLength = 60,
  tickScale = 0.5,
  itemGap = 20,
  activeIndex,
  defaultActiveIndex = null,
  onItemSelect,
  "aria-label": ariaLabel = "Seções",
  className,
  onPointerMove,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...props
}: ProximityNavProps) {
  const reduced = useShouldReduceMotion();
  const [active, setActive] = useActiveIndex(activeIndex, defaultActiveIndex);
  const rootRef = React.useRef<HTMLElement | null>(null);

  const setRefs = (node: HTMLElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const reset = () => rootRef.current && applyInfluences(rootRef.current, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    onPointerMove?.(event);
    applyInfluences(
      event.currentTarget,
      measureInfluences(event.currentTarget, event.clientY, radius, falloff)
    );
  };

  const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    onFocus?.(event);
    const item = (event.target as HTMLElement).closest<HTMLElement>(ITEM_SELECTOR);
    if (!item) return;
    // Foco de teclado equivale ao ponteiro parado em cima do item.
    applyInfluences(
      event.currentTarget,
      items.map((_, i) => (i === Number(item.dataset.index) ? 1 : 0))
    );
  };

  return (
    <nav
      data-slot="proximity-nav"
      aria-label={ariaLabel}
      ref={setRefs}
      className={cn("select-none", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        reset();
      }}
      onFocus={handleFocus}
      onBlur={(event) => {
        onBlur?.(event);
        reset();
      }}
      {...props}
    >
      <ul className="flex flex-col" style={{ gap: itemGap }}>
        {items.map((label, index) => {
          const isActive = active === index;
          const color = isActive ? 1 : "var(--p)";
          return (
            <li key={`${index}-${label}`} className="flex flex-col">
              <button
                type="button"
                data-slot="proximity-nav-item"
                data-index={index}
                data-active={isActive ? "true" : undefined}
                aria-current={isActive ? "true" : undefined}
                style={{ "--p": 0 } as VarStyle}
                className="flex cursor-pointer items-center gap-3 rounded-sm text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  setActive(index);
                  onItemSelect?.(index, label);
                }}
              >
                {showMarker && (
                  <span
                    data-slot="proximity-nav-marker"
                    aria-hidden="true"
                    className="relative block h-px origin-left bg-border transition-transform duration-100"
                    style={{
                      width: markerLength,
                      transform: reduced ? undefined : "scaleX(calc(0.6 + 0.4 * var(--p)))",
                    }}
                  >
                    <span
                      className="absolute inset-0 bg-primary transition-opacity duration-100"
                      style={{ opacity: color }}
                    />
                  </span>
                )}
                <span
                  data-slot="proximity-nav-label"
                  className="relative flex items-center gap-2 transition-transform duration-100"
                  style={{
                    transform: reduced ? undefined : `translateX(calc(var(--p) * ${maxShift}px))`,
                  }}
                >
                  <span className="text-muted-foreground">
                    {showIndex && (
                      <span className="mr-2 font-mono text-xs">{formatIndex(index)}</span>
                    )}
                    {label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center gap-2 text-primary transition-opacity duration-100"
                    style={{ opacity: color }}
                  >
                    <span>
                      {showIndex && (
                        <span className="mr-2 font-mono text-xs">{formatIndex(index)}</span>
                      )}
                      {label}
                    </span>
                  </span>
                </span>
              </button>
              {showMarker && index < items.length - 1 && (
                <span
                  data-slot="proximity-nav-tick"
                  aria-hidden="true"
                  className="mt-2 block h-px origin-left bg-border transition-transform duration-100"
                  style={{
                    width: markerLength * tickScale,
                    transform: reduced ? undefined : "scaleX(calc(1 + var(--t, 0)))",
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

ProximityNav.displayName = "ProximityNav";

export { ProximityNav };
