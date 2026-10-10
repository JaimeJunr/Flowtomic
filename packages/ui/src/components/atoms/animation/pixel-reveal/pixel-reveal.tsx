/**
 * PixelReveal Component - Flowtomic UI
 *
 * Card com dois conteúdos: uma grade de pixels cobre o primeiro aos poucos, o conteúdo troca por
 * baixo e os pixels somem, revelando o segundo. Ao sair, o mesmo caminho de volta.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/pixel-reveal.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  CELL_MS,
  CENTER,
  Layer,
  PixelGrid,
  useActiveState,
  useCardSize,
  usePhase,
} from "./pixel-reveal-parts";
import {
  gridRows,
  type Origin,
  type PixelRevealPattern,
  parseAspectRatio,
  pointerOrigin,
  revealOrder,
  validatePixelOptions,
} from "./pixel-reveal-utils";

export type PixelRevealProps = Omit<React.ComponentProps<"div">, "children"> & {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  /** Pixels na largura; as linhas seguem a proporção. @default 10 */
  gridSize?: number;
  /** Cor dos pixels. Token. @default "var(--primary)" */
  pixelColor?: string;
  /** Segundos para cobrir, e de novo para descobrir. @default 0.4 */
  stepDuration?: number;
  /** @default "random" */
  pattern?: PixelRevealPattern;
  /** Quebra a frente da onda/varredura, 0..1. @default 0.3 */
  randomness?: number;
  /** @default "hover" */
  trigger?: "hover" | "click";
  /** Controlado. */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  /** Depois de revelar, não volta. @default false */
  once?: boolean;
  /** CSS aspect-ratio. @default "1 / 1" */
  aspectRatio?: string;
  /** Espaço entre pixels em px. @default 0 */
  gap?: number;
  /** Arredondamento de cada pixel em % (0 quadrado, 50 círculo). @default 0 */
  pixelRadius?: number;
  /** Escala com que cada pixel nasce, 0..1. @default 0.6 */
  pixelScale?: number;
  /** Graus que cada pixel gira ao aparecer. @default 0 */
  pixelSpin?: number;
  /** Liga o fade de opacidade de cada pixel; sem fade o pixel só cresce. @default true */
  fade?: boolean;
  /** Chamado quando o conteúdo novo termina de aparecer. */
  onComplete?: (active: boolean) => void;
};

function PixelReveal({
  ref,
  className,
  style,
  firstContent,
  secondContent,
  gridSize = 10,
  pixelColor = "var(--primary)",
  stepDuration = 0.4,
  pattern = "random",
  randomness = 0.3,
  trigger = "hover",
  active,
  onActiveChange,
  once = false,
  aspectRatio = "1 / 1",
  gap = 0,
  pixelRadius = 0,
  pixelScale = 0.6,
  pixelSpin = 0,
  fade = true,
  onComplete,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
  ...props
}: PixelRevealProps) {
  validatePixelOptions({ pixelScale, gap, pixelRadius });
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useShouldReduceMotion();
  const stepMs = stepDuration * 1000;
  const [isActive, setActive] = useActiveState(active, onActiveChange, once);
  const phase = usePhase(isActive, reduced, stepMs + CELL_MS, onComplete);
  const [shown, setShown] = React.useState<"first" | "second">(isActive ? "second" : "first");
  const [origin, setOrigin] = React.useState<Origin>(CENTER);
  const size = useCardSize(rootRef);

  // O conteúdo só troca quando a fase assenta: durante a cobertura mantém o anterior.
  React.useEffect(() => {
    if (phase === "first" || phase === "second") setShown(phase);
  }, [phase]);

  const cols = Math.max(1, Math.round(gridSize));
  const rows = size
    ? gridRows(cols, size.width, size.height)
    : Math.max(1, Math.round(cols / parseAspectRatio(aspectRatio)));
  const delays = React.useMemo(
    () => revealOrder(cols, rows, pattern, origin, randomness, Math.random),
    [cols, rows, pattern, origin, randomness]
  );

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const hoverable = trigger === "hover";
  const pointAt = (
    event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin(pointerOrigin(rect, event.clientX, event.clientY));
  };
  const toggle = () => setActive(!isActive);

  const visibleShown = reduced ? (isActive ? "second" : "first") : shown;
  const state = reduced ? visibleShown : phase;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role="button" só existe com trigger="click"; no hover o foco por teclado também revela
    <div
      ref={setRefs}
      data-slot="pixel-reveal"
      data-state={state}
      {...(hoverable ? {} : { role: "button", "aria-pressed": isActive })}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a raiz precisa de foco para o hover por teclado
      tabIndex={0}
      className={cn("relative overflow-hidden rounded-lg border bg-card", className)}
      style={{ aspectRatio, ...style }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!hoverable) return;
        pointAt(event);
        setActive(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (hoverable) setActive(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (hoverable) setActive(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (hoverable) setActive(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (hoverable) return;
        pointAt(event);
        toggle();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (hoverable || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        toggle();
      }}
      {...props}
    >
      <Layer visible={visibleShown === "first"} fade={reduced}>
        {firstContent}
      </Layer>
      <Layer visible={visibleShown === "second"} fade={reduced}>
        {secondContent}
      </Layer>
      {reduced ? null : (
        <PixelGrid
          cols={cols}
          rows={rows}
          delays={delays}
          covered={phase === "covering" || phase === "uncovering"}
          color={pixelColor}
          stepMs={stepMs}
          shape={{ gap, radius: pixelRadius, scale: pixelScale, spin: pixelSpin, fade }}
        />
      )}
    </div>
  );
}

PixelReveal.displayName = "PixelReveal";

export { PixelReveal };
