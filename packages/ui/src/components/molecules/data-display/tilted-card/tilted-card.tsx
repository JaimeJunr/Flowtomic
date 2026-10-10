/**
 * TiltedCard Component - Flowtomic UI
 *
 * Cartão que inclina em 3D seguindo o mouse, cresce um pouco e mostra uma legenda
 * que acompanha o ponteiro. Em toque e com movimento reduzido fica plano.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/tilted-card.md
 */

"use client";

import { animate, motion, useMotionValue } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { captionTilt, tiltAngles } from "./tilted-card-utils";

export type TiltedCardProps = Omit<React.ComponentProps<"figure">, "children"> & {
  /** A imagem ou qualquer conteúdo visual do cartão. */
  media: React.ReactNode;
  /** Texto da legenda que segue o ponteiro (e figcaption acessível). */
  caption?: string;
  /** Inclinação máxima em graus. */
  rotateAmplitude?: number;
  scaleOnHover?: number;
  showTooltip?: boolean;
  /** Conteúdo sobre a mídia, à frente dela. */
  overlay?: React.ReactNode;
};

const TILT_SPRING = { type: "spring" as const, stiffness: 200, damping: 30 };
const CAPTION_OFFSET = 14;
const CAPTION_SETTLE_MS = 90;

function isHoverPointer(event: React.PointerEvent): boolean {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

function useTilt(rootRef: React.RefObject<HTMLElement | null>, amplitude: number, scaleTo: number) {
  const [hovered, setHovered] = React.useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  const captionX = useMotionValue(0);
  const captionY = useMotionValue(0);
  const captionRotate = useMotionValue(0);
  const last = React.useRef<{ x: number; t: number } | null>(null);
  const settle = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => void (settle.current && clearTimeout(settle.current)), []);

  const move = (event: React.PointerEvent<HTMLElement>) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const angles = tiltAngles(rect, event.clientX, event.clientY, amplitude);
    // A mola vai por evento: trocar o config do useSpring num render prendia o alvo antigo.
    animate(rotateX, angles.rotateX, TILT_SPRING);
    animate(rotateY, angles.rotateY, TILT_SPRING);
    captionX.set(event.clientX - rect.left + CAPTION_OFFSET);
    captionY.set(event.clientY - rect.top + CAPTION_OFFSET);
    tiltCaption(event);
  };

  const tiltCaption = (event: React.PointerEvent<HTMLElement>) => {
    const prev = last.current;
    last.current = { x: event.clientX, t: event.timeStamp };
    if (prev && event.timeStamp > prev.t) {
      const velocity = ((event.clientX - prev.x) / (event.timeStamp - prev.t)) * 1000;
      animate(captionRotate, captionTilt(velocity), TILT_SPRING);
    }
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => animate(captionRotate, 0, TILT_SPRING), CAPTION_SETTLE_MS);
  };

  const enter = () => {
    setHovered(true);
    animate(scale, scaleTo, TILT_SPRING);
  };

  const leave = () => {
    setHovered(false);
    last.current = null;
    animate(rotateX, 0, TILT_SPRING);
    animate(rotateY, 0, TILT_SPRING);
    animate(scale, 1, TILT_SPRING);
    animate(captionRotate, 0, TILT_SPRING);
  };

  return {
    hovered,
    rotateX,
    rotateY,
    scale,
    captionX,
    captionY,
    captionRotate,
    move,
    enter,
    leave,
  };
}

function TiltedCard({
  ref,
  className,
  media,
  caption,
  overlay,
  rotateAmplitude = 12,
  scaleOnHover = 1.05,
  showTooltip = true,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  ...props
}: TiltedCardProps) {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const reduceMotion = useShouldReduceMotion();
  const tilt = useTilt(rootRef, rotateAmplitude, scaleOnHover);

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const active = (event: React.PointerEvent) => !reduceMotion && isHoverPointer(event);
  const showCaption = showTooltip && Boolean(caption) && !reduceMotion;

  return (
    <figure
      data-slot="tilted-card"
      data-hovered={tilt.hovered ? "true" : "false"}
      ref={setRefs}
      className={cn("relative grid place-items-center [perspective:800px]", className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (active(event)) tilt.enter();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (active(event)) tilt.leave();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (active(event)) tilt.move(event);
      }}
      {...props}
    >
      <motion.div
        data-slot="tilted-card-inner"
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, scale: tilt.scale }}
        className="relative rounded-lg shadow-md [transform-style:preserve-3d]"
      >
        {/* overflow-hidden achata o preserve-3d, então o recorte fica na mídia e não no cartão. */}
        <div className="overflow-hidden rounded-lg">{media}</div>
        {overlay ? (
          <div
            data-slot="tilted-card-overlay"
            className="absolute inset-0 [transform:translateZ(30px)]"
          >
            {overlay}
          </div>
        ) : null}
      </motion.div>
      {showCaption ? (
        <motion.span
          data-slot="tilted-card-caption"
          data-visible={tilt.hovered ? "true" : "false"}
          aria-hidden="true"
          style={{ x: tilt.captionX, y: tilt.captionY, rotate: tilt.captionRotate }}
          className={cn(
            "pointer-events-none absolute top-0 left-0 rounded-sm border bg-popover px-2 py-1 text-popover-foreground text-xs opacity-0 transition-opacity",
            tilt.hovered && "opacity-100"
          )}
        >
          {caption}
        </motion.span>
      ) : null}
      {caption ? <figcaption className="sr-only">{caption}</figcaption> : null}
    </figure>
  );
}
TiltedCard.displayName = "TiltedCard";

export { TiltedCard };
