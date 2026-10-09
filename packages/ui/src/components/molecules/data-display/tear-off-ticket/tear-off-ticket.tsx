/**
 * TearOffTicket Component - Flowtomic UI
 *
 * Ingresso com canhoto picotado. O conjunto inclina em 3D na direção do ponteiro;
 * arrastar o canhoto o dobra a partir da linha, as pontes de papel entre os furos
 * rompem da ponta mais longe para a mais perto e, passando de `tearAngle`, ele se
 * solta e cai. Enter e Espaço também destacam. Depois de usado, o corpo desliza ao
 * centro e a arte fica cinza. Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/tear-off-ticket.md
 */

"use client";

import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { maskImageFor, nextFoldAngle, pieceMask, tearProgress } from "./tear-off-ticket-utils";

type NativeDivProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>;

export type TearOffTicketProps = NativeDivProps & {
  /** Corpo do ingresso. */
  children: React.ReactNode;
  /** Conteúdo do canhoto. */
  stub: React.ReactNode;
  /** Arte do corpo (parallax com o ponteiro; fica cinza depois de usado). */
  image?: string;
  imageAlt?: string;
  orientation?: "horizontal" | "vertical";
  torn?: boolean;
  defaultTorn?: boolean;
  onTear?: () => void;
  /** Largura total, em px. */
  width?: number;
  /** Altura total, em px. */
  height?: number;
  /** Tamanho do canhoto na direção do ingresso, em px. */
  stubSize?: number;
  holes?: number;
  holeSize?: number;
  /** Raio do entalhe nas pontas da linha picotada, em px. */
  notch?: number;
  /** Ângulo de dobra (graus) a partir do qual o canhoto se solta. */
  tearAngle?: number;
  /** 0..1. Quanto o papel resiste no começo. */
  resistance?: number;
  /** Rotação do conjunto no plano, em graus. */
  restRotate?: number;
  tilt?: boolean;
  /** Inclinação máxima, em graus. */
  tiltMax?: number;
  /** Depois de rasgado, o corpo desliza ao centro da caixa original. */
  recenter?: boolean;
  disabled?: boolean;
  stubLabel?: string;
};

type Drag = { pointerId: number; last: number; angle: number };

const PERSPECTIVE_PX = 1000;
const PARALLAX_PX = 6;
const TEAR_MS = 550;
const TEAR_REDUCED_MS = 200;
const SEAM_PADDING = "1.25rem";

function TearOffTicket({
  ref,
  className,
  style,
  children,
  stub,
  image,
  imageAlt = "",
  orientation = "horizontal",
  torn: tornProp,
  defaultTorn = false,
  onTear,
  width = 460,
  height = 250,
  stubSize = 150,
  holes = 12,
  holeSize = 6,
  notch = 8,
  tearAngle = 30,
  resistance = 0.45,
  restRotate = 0,
  tilt = true,
  tiltMax = 8,
  recenter = true,
  disabled = false,
  stubLabel = "Destacar o canhoto",
  ...props
}: TearOffTicketProps) {
  const reduced = useShouldReduceMotion();
  const vertical = orientation === "vertical";
  const [tornState, setTornState] = React.useState(defaultTorn);
  const [tearing, setTearing] = React.useState(false);
  const [broken, setBroken] = React.useState(0);
  const drag = React.useRef<Drag | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const fold = useMotionValue(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);
  const torn = tornProp ?? tornState;
  const tiltActive = tilt && !reduced && !disabled && !torn;

  const tiltX = useSpring(0, { stiffness: 200, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 200, damping: 20 });
  const parallax = useTransform(tiltY, (value) =>
    tiltMax > 0 ? -(value / tiltMax) * PARALLAX_PX : 0
  );

  React.useEffect(() => {
    if (!tiltActive) {
      tiltX.set(0);
      tiltY.set(0);
      return;
    }
    const follow = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      tiltY.set(Math.max(-1, Math.min(1, nx)) * tiltMax);
      tiltX.set(-Math.max(-1, Math.min(1, ny)) * tiltMax);
    };
    window.addEventListener("pointermove", follow);
    return () => window.removeEventListener("pointermove", follow);
  }, [tiltActive, tiltMax, tiltX, tiltY]);

  // Pai mais estreito que `width`: o ingresso inteiro é desenhado no tamanho nominal e
  // encolhido por transform, assim furos e entalhes não distorcem.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const available = root.offsetWidth || width;
      setScale(Math.min(1, available / width));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [width]);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const startTear = () => {
    if (disabled || tearing || torn) return;
    drag.current = null;
    setTearing(true);
    timer.current = setTimeout(
      () => {
        timer.current = null;
        setTearing(false);
        setBroken(0);
        fold.set(0);
        if (tornProp === undefined) setTornState(true);
        onTear?.();
      },
      reduced ? TEAR_REDUCED_MS : TEAR_MS
    );
  };

  const axisPosition = (event: React.PointerEvent) => (vertical ? event.clientY : event.clientX);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || tearing || event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { pointerId: event.pointerId, last: axisPosition(event), angle: 0 };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const position = axisPosition(event);
    current.angle = nextFoldAngle(
      current.angle,
      position - current.last,
      tearAngle,
      resistance,
      holes
    );
    current.last = position;
    if (current.angle >= tearAngle) {
      setBroken(tearProgress(tearAngle, tearAngle, holes));
      fold.set(current.angle);
      startTear();
      return;
    }
    fold.set(current.angle);
    setBroken(tearProgress(current.angle, tearAngle, holes));
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    setBroken(0);
    animate(fold, 0, { type: "spring", bounce: 0.3, duration: 0.5 });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    startTear();
  };

  const bodyWidth = vertical ? width : width - stubSize;
  const bodyHeight = vertical ? height - stubSize : height;
  const stubWidth = vertical ? width : stubSize;
  const stubHeight = vertical ? stubSize : height;
  const seamLength = vertical ? width : height;
  const base = { length: seamLength, holes, holeSize, notch };
  const bodyPath = pieceMask({
    ...base,
    seam: vertical ? "bottom" : "right",
    depth: vertical ? bodyHeight : bodyWidth,
  });
  const stubPath = pieceMask({
    ...base,
    seam: vertical ? "top" : "left",
    depth: vertical ? stubHeight : stubWidth,
    broken,
  });
  const shift = recenter && torn ? stubSize / 2 : 0;
  const foldStyle = vertical ? { rotateX: fold } : { rotateY: fold };

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div
      ref={setRefs}
      data-slot="tear-off-ticket"
      data-torn={torn}
      data-orientation={orientation}
      data-scale={scale}
      className={cn("block text-card-foreground", disabled && "opacity-50", className)}
      style={{ ...style, width: "100%", maxWidth: width, height: height * scale }}
      {...props}
    >
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <motion.div
          className={cn("relative inline-flex", vertical ? "flex-col" : "flex-row")}
          style={{
            width,
            height,
            rotate: restRotate,
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: PERSPECTIVE_PX,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            data-slot="tear-off-ticket-body"
            className="drop-shadow-sm"
            style={{ width: bodyWidth, height: bodyHeight, flexShrink: 0 }}
            animate={{ x: vertical ? 0 : shift, y: vertical ? shift : 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
          >
            <div
              className={cn(
                "relative flex size-full overflow-hidden bg-card",
                vertical ? "flex-col" : "flex-row"
              )}
              style={maskStyle(bodyWidth, bodyHeight, bodyPath)}
            >
              {image && (
                <motion.img
                  data-slot="tear-off-ticket-image"
                  src={image}
                  alt={imageAlt}
                  className={cn(
                    "object-cover transition-[filter] duration-500",
                    vertical ? "h-2/5 w-full" : "h-full w-2/5",
                    torn && "grayscale"
                  )}
                  style={{ x: reduced || !tilt ? 0 : parallax }}
                />
              )}
              <div
                className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4"
                style={vertical ? { paddingBottom: SEAM_PADDING } : { paddingRight: SEAM_PADDING }}
              >
                {children}
              </div>
            </div>
          </motion.div>
          {!torn && (
            <motion.div
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={stubLabel}
              aria-disabled={disabled || undefined}
              aria-hidden={tearing || undefined}
              data-slot="tear-off-ticket-stub"
              className={cn(
                "touch-none select-none outline-none drop-shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50",
                !disabled && !reduced && "cursor-grab active:cursor-grabbing"
              )}
              style={{
                width: stubWidth,
                height: stubHeight,
                flexShrink: 0,
                transformOrigin: vertical ? "50% 0%" : "0% 50%",
                ...(reduced ? {} : foldStyle),
              }}
              animate={
                tearing
                  ? reduced
                    ? { opacity: 0 }
                    : { y: 180, rotate: 28, opacity: 0 }
                  : { opacity: 1 }
              }
              transition={{
                duration: (reduced ? TEAR_REDUCED_MS : TEAR_MS) / 1000,
                ease: "easeIn",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onKeyDown={handleKeyDown}
            >
              <div
                className="flex size-full items-center justify-center bg-card p-3 text-center"
                style={{
                  ...maskStyle(stubWidth, stubHeight, stubPath),
                  ...(vertical ? { paddingTop: SEAM_PADDING } : { paddingLeft: SEAM_PADDING }),
                }}
              >
                {stub}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function maskStyle(width: number, height: number, path: string): React.CSSProperties {
  const image = maskImageFor(width, height, path);
  return {
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };
}

TearOffTicket.displayName = "TearOffTicket";

export { TearOffTicket };
