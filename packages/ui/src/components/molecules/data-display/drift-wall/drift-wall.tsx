/**
 * DriftWall Component - Flowtomic UI
 *
 * Parede de ladrilhos em perspectiva: colunas deslizam sem fim em sentidos opostos, o ladrilho sob o
 * mouse acende e se aproxima, e mexer o mouse inclina a parede de leve. Serve de fundo de hero ou login.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/drift-wall.md
 */

"use client";

import { animate, type MotionValue, useMotionValue } from "motion/react";
import * as React from "react";

import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { DriftTile, useElementHeight } from "./drift-wall-parts";
import {
  columnSpeed,
  type DriftDirection,
  distribute,
  fadeMask,
  listHeight,
  PARALLAX_DEGREES,
  PLANE_SCALE,
  planeTransform,
  rowsNeeded,
  validateDriftOptions,
  wrapOffset,
} from "./drift-wall-utils";

export type DriftWallItem = {
  id: string;
  label: string;
  image?: string;
  content?: React.ReactNode;
  href?: string;
};

export type DriftWallProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Pelo menos 1; vazio lança erro. */
  items: DriftWallItem[];
  /** 1..12. @default 5 */
  columns?: number;
  /** @default 200 */
  tileWidth?: number;
  /** @default 132 */
  tileHeight?: number;
  /** Espaço entre ladrilhos, em px. @default 18 */
  gap?: number;
  /** rotateX da parede, em graus. @default 16 */
  tilt?: number;
  /** rotateY da parede, em graus. @default -14 */
  turn?: number;
  /** rotateZ da parede, em graus. @default 0 */
  roll?: number;
  /** @default 1200 */
  perspective?: number;
  /** Recuo da parede (translateZ negativo), em px. @default 120 */
  depth?: number;
  /** Velocidade base em px/s. @default 42 */
  speed?: number;
  /** Sentido das colunas pares; as ímpares vão no oposto. @default "up" */
  direction?: DriftDirection;
  /** Diferença de velocidade entre colunas, 0..1. @default 0.45 */
  variance?: number;
  /** Intensidade da paralaxe do mouse; 0 desliga. @default 0.6 */
  parallax?: number;
  /** Para o laço enquanto o ponteiro está na raiz. @default false */
  pauseOnHover?: boolean;
  /** translateZ do ladrilho em hover, em px. @default 64 */
  lift?: number;
  /** Quanto as bordas somem, 0..1; 0 sem máscara. @default 0.6 */
  fade?: number;
  /** Opacidade dos ladrilhos em repouso, 0..1. @default 0.55 */
  dim?: number;
  /** Ladrilhos em tons de cinza até o hover. @default false */
  grayscale?: boolean;
};

const SPRING = { type: "spring", stiffness: 120, damping: 20, mass: 0.6 } as const;
// Passo máximo do laço: aba escondida e volta não pode dar um salto.
const MAX_DT = 0.1;

function useParallax(parallax: number, enabled: boolean) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const active = enabled && parallax > 0;

  const track = (event: React.PointerEvent<HTMLElement>) => {
    if (!active) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1);
    const ny = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1);
    const max = parallax * PARALLAX_DEGREES;
    animate(rx, -ny * max, SPRING);
    animate(ry, nx * max, SPRING);
  };
  const release = () => {
    animate(rx, 0, SPRING);
    animate(ry, 0, SPRING);
  };
  return { rx, ry, track, release };
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function useDriftLoop(opts: {
  speeds: number[];
  heights: number[];
  active: boolean;
  pausedRef: React.RefObject<boolean>;
  listRefs: React.RefObject<(HTMLElement | null)[]>;
}) {
  const { speeds, heights, active, pausedRef, listRefs } = opts;
  const offsets = React.useRef<number[]>([]);
  const last = React.useRef<number | null>(null);

  useFrameLoop((now) => {
    const dt = last.current === null ? 0 : Math.min((now - last.current) / 1000, MAX_DT);
    last.current = now;
    if (pausedRef.current) return;
    speeds.forEach((v, c) => {
      const next = wrapOffset((offsets.current[c] ?? 0) + v * dt, heights[c]);
      offsets.current[c] = next;
      const el = listRefs.current[c];
      if (el) el.style.transform = `translateY(${Number(next.toFixed(2))}px)`;
    });
  }, active);
}

function DriftWall({
  ref,
  className,
  style,
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...rest
}: DriftWallProps) {
  validateDriftOptions({ itemCount: items.length, columns, variance, fade, dim });
  const reduced = useShouldReduceMotion();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const planeRef = React.useRef<HTMLDivElement | null>(null);
  const listRefs = React.useRef<(HTMLElement | null)[]>([]);
  const pausedRef = React.useRef(false);
  const areaHeight = useElementHeight(rootRef);
  const angles = { depth, tilt, turn, roll };
  const { rx, ry, track, release } = useParallax(parallax, !reduced);

  const rows = rowsNeeded(areaHeight, tileHeight, gap);
  const cols = React.useMemo(() => distribute(items, columns, rows), [items, columns, rows]);
  const speeds = cols.map((_, c) => columnSpeed(c, columns, speed, variance, direction));
  const heights = cols.map((col) => listHeight(col.length, tileHeight, gap));
  useDriftLoop({
    speeds,
    heights,
    active: !reduced && speed > 0,
    pausedRef,
    listRefs,
  });

  const applyPlane = React.useCallback(() => {
    if (planeRef.current) {
      planeRef.current.style.transform = planeTransform(
        { depth, tilt, turn, roll },
        rx.get(),
        ry.get()
      );
    }
  }, [depth, tilt, turn, roll, rx, ry]);
  useMotionSubscription([rx, ry], applyPlane);

  const mask = fadeMask(fade);
  const hasLinks = items.some((item) => item.href);
  const planeSize = `${PLANE_SCALE * 100}%`;
  const seen = new Set<string>();

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        assignRef(ref, node);
      }}
      data-slot="drift-wall"
      aria-hidden={hasLinks ? undefined : true}
      className={cn("relative overflow-hidden", className)}
      style={
        {
          perspective: `${perspective}px`,
          maskImage: mask,
          WebkitMaskImage: mask,
          "--drift-lift": reduced ? "0px" : `${lift}px`,
          ...style,
        } as React.CSSProperties
      }
      onPointerEnter={(e) => {
        if (pauseOnHover) pausedRef.current = true;
        onPointerEnter?.(e);
      }}
      onPointerMove={(e) => {
        track(e);
        onPointerMove?.(e);
      }}
      onPointerLeave={(e) => {
        pausedRef.current = false;
        release();
        onPointerLeave?.(e);
      }}
      {...rest}
    >
      <div
        ref={planeRef}
        data-slot="drift-wall-plane"
        className="absolute flex items-start justify-center select-none [transform-style:preserve-3d]"
        style={{
          width: planeSize,
          height: planeSize,
          left: `${(100 - PLANE_SCALE * 100) / 2}%`,
          top: `${(100 - PLANE_SCALE * 100) / 2}%`,
          gap,
          transform: planeTransform(angles, 0, 0),
        }}
      >
        {cols.map((col, c) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: a posição da coluna é a identidade dela
            key={c}
            data-slot="drift-wall-column"
            data-column={c}
            className="flex-none [transform-style:preserve-3d]"
            style={{ width: tileWidth }}
          >
            <div
              ref={(node) => {
                listRefs.current[c] = node;
              }}
              className="[transform-style:preserve-3d]"
              style={{ transform: "translateY(0px)" }}
            >
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="flex flex-col [transform-style:preserve-3d]"
                  style={{ gap, paddingBottom: gap }}
                >
                  {col.map((item, i) => {
                    const first = copy === 0 && !seen.has(item.id);
                    if (copy === 0) seen.add(item.id);
                    return (
                      <DriftTile
                        // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa, sem reordenação
                        key={i}
                        item={item}
                        width={tileWidth}
                        height={tileHeight}
                        dim={dim}
                        grayscale={grayscale}
                        decorative={!first}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function useMotionSubscription(values: MotionValue<number>[], onChange: () => void) {
  React.useEffect(() => {
    onChange();
    const stops = values.map((value) => value.on("change", onChange));
    return () => {
      for (const stop of stops) stop();
    };
  }, [values, onChange]);
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

DriftWall.displayName = "DriftWall";

export { DriftWall };
