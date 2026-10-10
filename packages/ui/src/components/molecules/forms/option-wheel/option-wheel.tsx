"use client";

import * as React from "react";
import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  approach,
  circularDistance,
  type OptionLayoutOptions,
  optionLayout,
  stepIndex,
  wrapIndex,
} from "./option-wheel-utils";

export type OptionWheelProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  options: string[];
  /** Índice selecionado (controlado). */
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number, option: string) => void;
  side?: "left" | "right";
  /** Tamanho do texto em rem. */
  fontSize?: number;
  /** Distância entre opções, em múltiplos do `fontSize`. */
  spacing?: number;
  /** 0 = lista reta. */
  curve?: number;
  /** Graus entre opções vizinhas. */
  tilt?: number;
  /** px de desfoque por passo de distância. */
  blur?: number;
  /** Opacidade perdida por passo de distância. */
  fade?: number;
  minOpacity?: number;
  /** Constante de tempo da suavização, em ms. */
  smoothing?: number;
  /** px da borda até a opção do meio. */
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  "aria-label": string;
};

const WHEEL_STEP_PX = 60;
const SETTLE_EPSILON = 0.001;
const DRAG_THRESHOLD_PX = 4;

function remInPx(): number {
  if (typeof window === "undefined") return 16;
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

function OptionWheel({
  options,
  value,
  defaultValue = 0,
  onValueChange,
  side = "left",
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  className,
  ref,
  onKeyDown,
  ...props
}: OptionWheelProps) {
  const count = options.length;
  if (count === 0) {
    throw new Error(`OptionWheel: received options=[] (length 0), expected at least 1 option`);
  }

  const reduceMotion = useShouldReduceMotion();
  const id = React.useId();
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const index = Math.min(count - 1, Math.max(0, controlled ? value : inner));

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const indexRef = React.useRef(index);
  indexRef.current = index;
  // Alvo "virtual": com loop não é reduzido ao intervalo, para a roda girar pelo caminho curto.
  const targetRef = React.useRef(index);
  const positionRef = React.useRef(index);
  const lastFrameRef = React.useRef<number | null>(null);
  const [animating, setAnimating] = React.useState(false);

  const layoutOpts = React.useMemo<OptionLayoutOptions>(
    () => ({
      fontSize,
      spacing,
      curve,
      tilt,
      blur: reduceMotion ? 0 : blur,
      fade,
      minOpacity,
      side,
    }),
    [fontSize, spacing, curve, tilt, blur, reduceMotion, fade, minOpacity, side]
  );

  const paint = React.useCallback(
    (position: number) => {
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const raw = i - position;
        const d = loop ? circularDistance(raw, count) : raw;
        const l = optionLayout(d, layoutOpts);
        el.style.transform = `translate(${l.x}rem, calc(${l.y}rem - 50%)) rotate(${l.angle}deg)`;
        el.style.opacity = String(l.opacity);
        el.style.filter = l.blur > 0 ? `blur(${l.blur}px)` : "";
        el.setAttribute("data-near", String(Math.abs(d) < 0.5));
      });
    },
    [loop, count, layoutOpts]
  );

  React.useLayoutEffect(() => {
    paint(positionRef.current);
  }, [paint]);

  // Sincroniza o alvo com o índice, escolhendo o caminho circular mais curto no loop.
  React.useLayoutEffect(() => {
    const current = loop ? wrapIndex(targetRef.current, count) : targetRef.current;
    const delta = loop ? circularDistance(index - current, count) : index - current;
    if (delta === 0) return;
    targetRef.current += delta;
    if (reduceMotion) {
      positionRef.current = targetRef.current;
      paint(positionRef.current);
      return;
    }
    lastFrameRef.current = null;
    setAnimating(true);
  }, [index, loop, count, reduceMotion, paint]);

  useFrameLoop((now) => {
    const dt = lastFrameRef.current === null ? 16 : now - lastFrameRef.current;
    lastFrameRef.current = now;
    const next = approach(positionRef.current, targetRef.current, dt, smoothing);
    const settled = Math.abs(targetRef.current - next) < SETTLE_EPSILON;
    positionRef.current = settled ? targetRef.current : next;
    paint(positionRef.current);
    if (settled) setAnimating(false);
  }, animating);

  const select = React.useCallback(
    (next: number) => {
      const resolved = loop ? wrapIndex(next, count) : Math.min(count - 1, Math.max(0, next));
      if (resolved === indexRef.current) return;
      if (!controlled) {
        indexRef.current = resolved;
        setInner(resolved);
      }
      onValueChange?.(resolved, options[resolved] as string);
    },
    [loop, count, controlled, onValueChange, options]
  );

  const step = (delta: number) => select(stepIndex(indexRef.current, delta, count, loop));

  const wheelAccRef = React.useRef(0);
  const wheelStateRef = React.useRef({ step, count, loop });
  wheelStateRef.current = { step, count, loop };

  // Listener nativo: o onWheel do React é passivo e não permite preventDefault.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const state = wheelStateRef.current;
      const direction = Math.sign(event.deltaY);
      const atEdge =
        !state.loop &&
        ((direction > 0 && indexRef.current === state.count - 1) ||
          (direction < 0 && indexRef.current === 0));
      if (direction === 0 || atEdge) {
        wheelAccRef.current = 0;
        return;
      }
      event.preventDefault();
      wheelAccRef.current += event.deltaY;
      const steps = Math.trunc(wheelAccRef.current / WHEEL_STEP_PX);
      if (steps === 0) return;
      wheelAccRef.current -= steps * WHEEL_STEP_PX;
      state.step(steps);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const dragRef = React.useRef<{ startY: number; startIndex: number; moved: boolean } | null>(null);
  const suppressClickRef = React.useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || event.button !== 0) return;
    dragRef.current = { startY: event.clientY, startIndex: indexRef.current, moved: false };
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
    drag.moved = true;
    suppressClickRef.current = true;
    const optionHeight = fontSize * spacing * remInPx();
    select(Math.round(drag.startIndex - dy / optionHeight));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const actions: Record<string, () => void> = {
      ArrowDown: () => step(1),
      ArrowUp: () => step(-1),
      Home: () => select(0),
      End: () => select(count - 1),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const anchor = side === "left" ? { left: inset } : { right: inset };

  return (
    <div
      {...props}
      ref={setRoot}
      data-slot="option-wheel"
      data-side={side}
      role="listbox"
      tabIndex={0}
      aria-activedescendant={`${id}-option-${index}`}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative select-none overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
        draggable && "touch-none cursor-grab active:cursor-grabbing",
        className
      )}
    >
      {options.map((label, i) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: o teclado é tratado na raiz (setas, Home, End).
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade da opção; rótulos podem repetir.
          key={i}
          ref={(node) => {
            itemRefs.current[i] = node;
          }}
          id={`${id}-option-${i}`}
          role="option"
          tabIndex={-1}
          aria-selected={i === index}
          data-slot="option-wheel-option"
          data-active={i === index}
          onClick={() => {
            if (suppressClickRef.current) return;
            select(i);
          }}
          className="absolute top-1/2 cursor-pointer whitespace-nowrap font-semibold leading-none tracking-tight text-muted-foreground transition-colors data-[near=true]:text-foreground"
          style={{
            ...anchor,
            fontSize: `${fontSize}rem`,
            transformOrigin: side === "left" ? "100% 50%" : "0% 50%",
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

OptionWheel.displayName = "OptionWheel";

export { OptionWheel };
