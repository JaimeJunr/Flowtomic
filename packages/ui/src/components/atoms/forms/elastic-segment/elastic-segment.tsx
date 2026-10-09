/**
 * ElasticSegment Component - Flowtomic UI
 *
 * Controle segmentado cujo thumb estica como borracha entre o segmento antigo
 * e o novo, e pode ser arrastado e lançado. O rótulo muda de cor onde o thumb
 * passa (recorte por clip-path). Baseado em Radix RadioGroup e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/elastic-segment.md
 */

"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  type Edges,
  type ElasticSegmentItem,
  type NormalizedItem,
  normalizeItems,
  type Rect,
  resolveFling,
  segmentEdges,
  stretchPhases,
} from "./elastic-segment-utils";

export type { ElasticSegmentItem } from "./elastic-segment-utils";

export type ElasticSegmentProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  "children" | "onValueChange"
> & {
  items: ElasticSegmentItem[];
  onValueChange?: (value: string, index: number) => void;
  size?: "sm" | "default" | "lg";
  /** Todos os segmentos com a mesma largura; false = cada um abraça o rótulo. */
  equalSlots?: boolean;
  /** 0..100: quanto o thumb estica cobrindo antigo e novo. 0 = desliza simples. */
  stretch?: number;
  /** px que a borda de trás passa do destino antes de relaxar. 0 = sem. */
  squash?: number;
  /** Escala todas as fases; 0.25 = câmera lenta. */
  speed?: number;
  /** 0..100: quanto um lançamento carrega o thumb. 0 = sempre o mais próximo. */
  glide?: number;
  draggable?: boolean;
};

const SIZE_CLASSES = { sm: "h-7 text-xs", default: "h-9 text-sm", lg: "h-11 text-base" } as const;
const INSET_PX = 3;
const THUMB_RADIUS_PX = 5;
const DRAG_THRESHOLD_PX = 3;
const VELOCITY_WINDOW_MS = 100;

function slotClass(equalSlots: boolean): string {
  return equalSlots ? "justify-center" : "px-3";
}

function trackClass(equalSlots: boolean): string {
  return equalSlots ? "grid grid-flow-col auto-cols-fr" : "flex";
}

function measure(root: HTMLElement | null): Rect[] {
  if (!root) return [];
  const nodes = root.querySelectorAll<HTMLElement>('[data-slot="elastic-segment-item"]');
  return Array.from(nodes, (node) => ({ left: node.offsetLeft, width: node.offsetWidth }));
}

function sameRects(a: Rect[], b: Rect[]): boolean {
  return a.length === b.length && a.every((r, i) => r.left === b[i].left && r.width === b[i].width);
}

type DragState = {
  pointerId: number;
  startX: number;
  startEdges: Edges;
  moved: boolean;
  samples: { x: number; t: number }[];
};

function releaseVelocity(samples: DragState["samples"]): number {
  const last = samples[samples.length - 1];
  const first = samples.find((s) => last.t - s.t <= VELOCITY_WINDOW_MS) ?? last;
  const dt = last.t - first.t;
  return dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0;
}

function ItemContent({ item }: { item: NormalizedItem }) {
  return (
    <>
      {item.icon}
      {item.label}
    </>
  );
}

/** Segmentado com thumb elástico: estica, achata e aceita arrasto com lançamento. */
function ElasticSegment({
  ref,
  className,
  items,
  value,
  defaultValue,
  onValueChange,
  size = "default",
  equalSlots = true,
  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,
  draggable = true,
  disabled,
  "aria-label": ariaLabel = "Controle segmentado",
  ...props
}: ElasticSegmentProps) {
  const reduced = useShouldReduceMotion();
  const normalized = React.useMemo(() => normalizeItems(items), [items]);
  const [internal, setInternal] = React.useState(defaultValue ?? normalized[0]?.value ?? "");
  const current = value ?? internal;
  const index = Math.max(
    0,
    normalized.findIndex((item) => item.value === current)
  );

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [rects, setRects] = React.useState<Rect[]>([]);
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const [rootWidth, setRootWidth] = React.useState(0);
  const trackEnd = rects.length ? rects[rects.length - 1].left + rects[rects.length - 1].width : 0;
  const thumbWidth = useTransform([left, right], ([l, r]: number[]) => r - l);
  // Coordenadas da raiz: o recorte segue as duas bordas do thumb e a altura do inset.
  const clip = useTransform(
    [left, right],
    ([l, r]: number[]) =>
      `inset(${INSET_PX}px ${Math.max(0, rootWidth - r)}px ${INSET_PX}px ${l}px round ${THUMB_RADIUS_PX}px)`
  );

  const ownChange = React.useRef(false);
  const plainMove = React.useRef(false);
  const token = React.useRef(0);
  const placed = React.useRef(false);
  const drag = React.useRef<DragState | null>(null);

  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const update = () => {
      const next = measure(root);
      setRects((prev) => (sameRects(prev, next) ? prev : next));
      setRootWidth(root?.offsetWidth ?? 0);
    };
    update();
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const spring = React.useMemo(
    () => ({
      type: "spring" as const,
      stiffness: 420 * speed * speed,
      damping: 32 * speed,
      mass: 1,
    }),
    [speed]
  );

  const moveEdge = React.useCallback(
    (edge: "left" | "right", target: number, delay: number, overshoot: number, id: number) => {
      const mv = edge === "left" ? left : right;
      const settle = () => {
        if (token.current === id) animate(mv, target, spring);
      };
      if (overshoot === target) {
        animate(mv, target, { ...spring, delay: delay / 1000 / speed });
        return;
      }
      animate(mv, overshoot, { ...spring, delay: delay / 1000 / speed }).then(settle);
    },
    [left, right, spring, speed]
  );

  const moveThumb = React.useCallback(
    (to: Edges, plain: boolean) => {
      token.current += 1;
      const id = token.current;
      if (reduced) {
        left.set(to.left);
        right.set(to.right);
        return;
      }
      const from = { left: left.get(), right: right.get() };
      if (plain) {
        animate(left, to.left, spring);
        animate(right, to.right, spring);
        return;
      }
      const { front, back } = stretchPhases(from, to, stretch, squash);
      moveEdge(front.edge, front.target, front.delay, front.target, id);
      moveEdge(back.edge, back.target, back.delay, back.overshoot, id);
    },
    [reduced, left, right, spring, stretch, squash, moveEdge]
  );

  React.useLayoutEffect(() => {
    if (!rects.length) return;
    const to = segmentEdges(rects, Math.min(index, rects.length - 1));
    const jump = !placed.current || !ownChange.current;
    placed.current = true;
    ownChange.current = false;
    if (jump) {
      token.current += 1;
      left.set(to.left);
      right.set(to.right);
      return;
    }
    moveThumb(to, plainMove.current);
    plainMove.current = false;
  }, [rects, index, left, right, moveThumb]);

  const select = (next: number) => {
    const item = normalized[next];
    if (!item) return;
    ownChange.current = true;
    if (value === undefined) setInternal(item.value);
    onValueChange?.(item.value, next);
  };

  const handleValueChange = (next: string) => {
    select(normalized.findIndex((item) => item.value === next));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || disabled || event.button !== 0) return;
    token.current += 1;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startEdges: { left: left.get(), right: right.get() },
      moved: false,
      samples: [{ x: event.clientX, t: performance.now() }],
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId || !rects.length) return;
    const dx = event.clientX - state.startX;
    if (!state.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    state.moved = true;
    state.samples.push({ x: event.clientX, t: performance.now() });
    const min = rects[0].left - state.startEdges.left;
    const max = trackEnd - state.startEdges.right;
    const clamped = Math.min(max, Math.max(min, dx));
    left.set(state.startEdges.left + clamped);
    right.set(state.startEdges.right + clamped);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    drag.current = null;
    if (!state || !state.moved || !rects.length) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const velocity = reduced ? 0 : releaseVelocity(state.samples);
    const center = (left.get() + right.get()) / 2;
    const target = resolveFling(rects, center, velocity, reduced ? 0 : glide);
    plainMove.current = true;
    if (target === index) {
      moveThumb(segmentEdges(rects, target), true);
      plainMove.current = false;
      return;
    }
    select(target);
  };

  const track = trackClass(equalSlots);
  const slot = slotClass(equalSlots);
  const itemBase = "relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap font-medium";

  return (
    <RadioGroupPrimitive.Root
      ref={setRoot}
      data-slot="elastic-segment"
      aria-label={ariaLabel}
      value={current}
      onValueChange={handleValueChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex w-fit rounded-lg bg-muted p-[3px] select-none",
        SIZE_CLASSES[size],
        disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <motion.div
        aria-hidden="true"
        data-slot="elastic-segment-thumb"
        className={cn(
          "absolute z-0 touch-none rounded-[5px] bg-background shadow-sm",
          draggable && !disabled ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
        )}
        style={{ left, width: thumbWidth, top: INSET_PX, bottom: INSET_PX }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <div className={cn("min-w-0", track)}>
        {normalized.map((item) => (
          <RadioGroupPrimitive.Item
            key={item.value}
            value={item.value}
            data-slot="elastic-segment-item"
            className={cn(
              itemBase,
              slot,
              "rounded-[5px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
            )}
          >
            <ItemContent item={item} />
          </RadioGroupPrimitive.Item>
        ))}
      </div>
      <motion.div
        aria-hidden="true"
        data-slot="elastic-segment-active-labels"
        className="pointer-events-none absolute inset-0 z-20 p-[3px] text-foreground"
        style={{ clipPath: clip }}
      >
        <div className={cn("h-full", track)}>
          {normalized.map((item) => (
            <span key={item.value} className={cn(itemBase, slot)}>
              <ItemContent item={item} />
            </span>
          ))}
        </div>
      </motion.div>
    </RadioGroupPrimitive.Root>
  );
}

ElasticSegment.displayName = "ElasticSegment";

export { ElasticSegment };
