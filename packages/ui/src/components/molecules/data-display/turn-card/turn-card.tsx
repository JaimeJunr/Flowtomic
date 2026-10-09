/**
 * TurnCard Component - Flowtomic UI
 *
 * Cartão com frente e verso que vira em 3D numa mola: por clique, teclado ou
 * girando com a mão (soltar leva à face mais próxima, com a velocidade do gesto).
 * No hover inclina na direção do ponteiro, cresce um pouco e um brilho o segue.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/turn-card.md
 */

"use client";

import {
  type MotionStyle,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  clampVelocity,
  dragAngle,
  isBackFace,
  isClick,
  resolveDragDistance,
  settleFace,
  shadowScale,
  type TurnAxis,
  tiltPose,
} from "./turn-card-utils";

export type TurnCardProps = Omit<React.ComponentProps<"div">, "children"> & {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped?: boolean;
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  /** "y" vira de lado (arrasta na horizontal); "x" vira para cima (arrasta na vertical). */
  axis?: TurnAxis;
  flipOnClick?: boolean;
  draggable?: boolean;
  /** px de arrasto para meia volta; 0 = largura (ou altura no eixo x). */
  dragDistance?: number;
  tilt?: boolean;
  /** Inclinação máxima no hover, em graus. */
  tiltMax?: number;
  glare?: boolean;
  hoverScale?: number;
  perspective?: number;
  stiffness?: number;
  damping?: number;
  disabled?: boolean;
  "aria-label"?: string;
};

type GestureState = {
  pointerId: number;
  startX: number;
  startY: number;
  baseAngle: number;
  dragging: boolean;
  lastAngle: number;
  lastTime: number;
  velocity: number;
};

const FACE_CLASSES =
  "absolute inset-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg [-webkit-backface-visibility:hidden] [backface-visibility:hidden]";
const GLARE_CLASSES =
  "pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_var(--gx)_var(--gy),color-mix(in_oklab,var(--background)_45%,transparent),transparent_60%)]";
// Passado esse tempo parado, o gesto não leva mais velocidade para a soltura.
const STALE_VELOCITY_MS = 100;
// Eventos quase simultâneos dariam velocidades absurdas; só amostra acima disso.
const MIN_SAMPLE_MS = 8;
const TILT_SPRING = { stiffness: 220, damping: 22 };

/** Estado "flipped" controlado ou interno, como número de meias-voltas (par = frente). */
function useTurns(flippedProp: boolean | undefined, defaultFlipped: boolean) {
  const [turns, setTurns] = React.useState(defaultFlipped ? 1 : 0);
  const flipped = flippedProp ?? isBackFace(turns * 180);

  // Se o pai recusar a mudança, a mola volta para a face que a prop manda.
  React.useEffect(() => {
    if (flippedProp === undefined || isBackFace(turns * 180) === flippedProp) return;
    setTurns((current) => current + (current >= 0 ? -1 : 1));
  }, [flippedProp, turns]);

  return { turns, setTurns, flipped };
}

function useTilt(max: number, active: boolean) {
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const point = (event: React.PointerEvent<HTMLElement>, rect: DOMRect) => {
    const pose = tiltPose(
      event.clientX - rect.left,
      event.clientY - rect.top,
      rect.width,
      rect.height,
      max
    );
    if (active) {
      rotateX.set(pose.rotateX);
      rotateY.set(pose.rotateY);
    }
    gx.set(pose.gx);
    gy.set(pose.gy);
  };
  const rest = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
  return { rotateX, rotateY, gx, gy, point, rest };
}

function usePercent(value: MotionValue<number>) {
  return useTransform(value, (v) => `${v}%`);
}

function TurnCard({
  ref,
  className,
  style,
  front,
  back,
  flipped: flippedProp,
  defaultFlipped = false,
  onFlippedChange,
  axis = "y",
  flipOnClick = true,
  draggable = true,
  dragDistance = 0,
  tilt = true,
  tiltMax = 10,
  glare = true,
  hoverScale = 1.03,
  perspective = 1100,
  stiffness = 170,
  damping = 20,
  disabled = false,
  "aria-label": ariaLabel = "Virar cartão",
  onClick,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerEnter,
  onPointerLeave,
  ...props
}: TurnCardProps) {
  const reduced = useShouldReduceMotion();
  const { turns, setTurns, flipped } = useTurns(flippedProp, defaultFlipped);
  const angle = useSpring(turns * 180, { stiffness, damping });
  const shadow = useTransform(angle, shadowScale);
  const gesture = React.useRef<GestureState | null>(null);
  const swallowClick = React.useRef(false);
  const [hovering, setHovering] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const motionOff = reduced || disabled;
  const tiltOn = tilt && !motionOff && !dragging;
  const pose = useTilt(tiltMax, tiltOn);
  const gxPercent = usePercent(pose.gx);
  const gyPercent = usePercent(pose.gy);
  const rotateProp = axis === "y" ? "rotateY" : "rotateX";

  React.useEffect(() => {
    if (reduced) angle.jump(turns * 180);
    else angle.set(turns * 180);
  }, [angle, reduced, turns]);

  const commit = (nextTurns: number) => {
    const nextFlipped = isBackFace(nextTurns * 180);
    setTurns(nextTurns);
    if (nextFlipped !== flipped) onFlippedChange?.(nextFlipped);
  };
  // Alterna voltando pelo caminho de ida, para o ângulo não crescer sem fim.
  const toggle = () => commit(turns % 2 === 0 ? turns + 1 : turns - 1);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (disabled || event.button !== 0) return;
    swallowClick.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseAngle: angle.get(),
      dragging: false,
      lastAngle: angle.get(),
      lastTime: performance.now(),
      velocity: 0,
    };
  };

  const handleDragMove = (event: React.PointerEvent<HTMLDivElement>, current: GestureState) => {
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.dragging && isClick(dx, dy)) return;
    current.dragging = true;
    swallowClick.current = true;
    if (!draggable) return;
    setDragging(true);
    const rect = event.currentTarget.getBoundingClientRect();
    const distance = resolveDragDistance(dragDistance, axis === "y" ? rect.width : rect.height);
    // No eixo x, arrastar para baixo gira para trás (cartão "puxado" pelo topo).
    const delta = axis === "y" ? dx : -dy;
    const next = dragAngle(current.baseAngle, delta, distance);
    const now = performance.now();
    const elapsed = now - current.lastTime;
    if (elapsed >= MIN_SAMPLE_MS) {
      current.velocity = clampVelocity(((next - current.lastAngle) / elapsed) * 1000);
      current.lastAngle = next;
      current.lastTime = now;
    }
    angle.jump(next);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (disabled) return;
    const current = gesture.current;
    if (current && current.pointerId === event.pointerId) handleDragMove(event, current);
    if (!current?.dragging) pose.point(event, event.currentTarget.getBoundingClientRect());
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    gesture.current = null;
    setDragging(false);
    if (!current || current.pointerId !== event.pointerId || !current.dragging || !draggable) {
      return;
    }
    const stale = performance.now() - current.lastTime > STALE_VELOCITY_MS;
    const settled = settleFace(angle.get(), stale ? 0 : current.velocity);
    commit(settled / 180);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event);
    release(event);
  };
  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerCancel?.(event);
    release(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (disabled || !flipOnClick) return;
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    toggle();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (disabled || event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  };

  const handleEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(event);
    setHovering(true);
  };
  const handleLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    setHovering(false);
    pose.rest();
  };

  const scaled = hovering && tiltOn;
  const backTransform = reduced ? undefined : `${rotateProp}(180deg)`;

  return (
    // biome-ignore lint/a11y/useSemanticElements: as faces levam conteúdo rico (<dl>, blocos) que <button> não permite.
    <div
      ref={ref}
      data-slot="turn-card"
      data-flipped={flipped}
      data-reduced={reduced}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={flipped}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative select-none rounded-xl outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        draggable && !disabled && (axis === "y" ? "touch-pan-y" : "touch-pan-x"),
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
      style={{ perspective: reduced ? undefined : perspective, ...style }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      {...props}
    >
      {!reduced && (
        <motion.div
          aria-hidden="true"
          data-slot="turn-card-shadow"
          className="pointer-events-none absolute inset-x-6 -bottom-3 h-4 rounded-full bg-foreground/20 blur-md"
          style={{ scaleX: shadow }}
        />
      )}
      <motion.div
        className="relative size-full [transform-style:preserve-3d]"
        style={{ rotateX: pose.rotateX, rotateY: pose.rotateY }}
        animate={{ scale: scaled ? hoverScale : 1 }}
      >
        <motion.div
          className="relative size-full [transform-style:preserve-3d]"
          style={reduced ? undefined : { [rotateProp]: angle }}
        >
          <motion.div
            data-slot="turn-card-front"
            className={FACE_CLASSES}
            aria-hidden={flipped || undefined}
            inert={flipped}
            animate={{ opacity: reduced && flipped ? 0 : 1 }}
          >
            {front}
          </motion.div>
          <motion.div
            data-slot="turn-card-back"
            className={FACE_CLASSES}
            style={backTransform ? { transform: backTransform } : undefined}
            aria-hidden={flipped ? undefined : true}
            inert={!flipped}
            animate={{ opacity: reduced && !flipped ? 0 : 1 }}
          >
            {back}
          </motion.div>
        </motion.div>
        {glare && !reduced && (
          <motion.div
            aria-hidden="true"
            data-slot="turn-card-glare"
            className={GLARE_CLASSES}
            style={{ "--gx": gxPercent, "--gy": gyPercent } as MotionStyle}
            animate={{ opacity: scaled ? 1 : 0 }}
          />
        )}
      </motion.div>
    </div>
  );
}

TurnCard.displayName = "TurnCard";

export { TurnCard };
