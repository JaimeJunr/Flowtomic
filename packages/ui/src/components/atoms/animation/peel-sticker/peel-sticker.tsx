/**
 * PeelSticker Component - Flowtomic UI
 *
 * Adesivo com borda grossa que descola uma ponta no hover e no clique, mostrando o
 * verso do papel com sombra na dobra. Pode ser arrastado pela área e movido por seta.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/peel-sticker.md
 */

"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { PeelLayers } from "./peel-sticker-parts";
import {
  clampMove,
  dropShadowFor,
  normalizeDirection,
  peelExtent,
  placementStyle,
  type StickerPosition,
} from "./peel-sticker-utils";

export type PeelStickerProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Conteúdo do adesivo (ícone, imagem, svg). */
  children: React.ReactNode;
  /** Nome acessível. */
  label: string;
  /** Largura (e altura) em px. */
  width?: number;
  /** Graus 0-360; 0 descola de baixo para cima. */
  peelDirection?: number;
  /** Fração 0-1 descolada no hover. */
  peelHover?: number;
  /** Fração 0-1 descolada ao pressionar. */
  peelActive?: number;
  /** Giro em graus enquanto arrasta. */
  dragRotate?: number;
  draggable?: boolean;
  /** Intensidade 0-1 das sombras. */
  shadowIntensity?: number;
  initialPosition?: StickerPosition;
};

type StickerState = "rest" | "hover" | "pressed";

const PEEL_SPRING = { type: "spring" as const, stiffness: 260, damping: 24 };
const MOVE_SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
const ARROW_DELTA: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

function isPointerHover(event: React.PointerEvent) {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

function useStickerState() {
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  // O ponteiro pode ser solto fora do adesivo (ao arrastar), então o fim vem da janela.
  React.useEffect(() => {
    if (!pressed) return;
    const release = () => setPressed(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [pressed]);

  let state: StickerState = "rest";
  if (pressed) state = "pressed";
  else if (hovered || focused) state = "hover";
  return { state, setHovered, setFocused, setPressed };
}

function PeelSticker({
  ref,
  className,
  children,
  label,
  width = 160,
  peelDirection = 0,
  peelHover = 0.3,
  peelActive = 0.45,
  dragRotate = 8,
  draggable = true,
  shadowIntensity = 0.5,
  initialPosition = "center",
  ...props
}: PeelStickerProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const reduceMotion = useShouldReduceMotion();
  const { state, setHovered, setFocused, setPressed } = useStickerState();

  const direction = normalizeDirection(peelDirection);
  const extent = peelExtent(width, direction);
  const target = reduceMotion ? 0 : { rest: 0, hover: peelHover, pressed: peelActive }[state];

  const fraction = useMotionValue(0);
  React.useEffect(() => {
    const controls = animate(fraction, target, PEEL_SPRING);
    return () => controls.stop();
  }, [fraction, target]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const filter = useTransform(fraction, (f) => dropShadowFor(shadowIntensity, f));

  const moveByKey = (event: React.KeyboardEvent) => {
    const axis = ARROW_DELTA[event.key];
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!draggable || !axis || !root || !body) return;
    event.preventDefault();
    const step = event.shiftKey ? 64 : 16;
    const area = root.getBoundingClientRect();
    const item = body.getBoundingClientRect();
    const dx = clampMove(axis[0] * step, item.left, item.right, area.left, area.right);
    const dy = clampMove(axis[1] * step, item.top, item.bottom, area.top, area.bottom);
    animate(x, x.get() + dx, MOVE_SPRING);
    animate(y, y.get() + dy, MOVE_SPRING);
  };

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <div
      data-slot="peel-sticker"
      ref={setRefs}
      className={cn("relative min-h-60 overflow-hidden", className)}
      {...props}
    >
      <motion.div
        ref={bodyRef}
        data-slot="peel-sticker-body"
        data-state={state}
        data-peel={target.toFixed(2)}
        role="img"
        aria-label={label}
        aria-roledescription={draggable ? "adesivo arrastável" : undefined}
        tabIndex={0}
        drag={draggable}
        dragConstraints={rootRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => {
          if (!reduceMotion) animate(rotate, dragRotate, PEEL_SPRING);
        }}
        onDragEnd={() => animate(rotate, 0, PEEL_SPRING)}
        onPointerEnter={(event) => isPointerHover(event) && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={moveByKey}
        className="absolute touch-none select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          ...placementStyle(initialPosition, width),
          width,
          height: width,
          x,
          y,
          rotate,
          filter,
        }}
      >
        <PeelLayers
          fraction={fraction}
          width={width}
          extent={extent}
          direction={direction}
          shadowIntensity={shadowIntensity}
        >
          {children}
        </PeelLayers>
      </motion.div>
    </div>
  );
}
PeelSticker.displayName = "PeelSticker";

export { PeelSticker };
