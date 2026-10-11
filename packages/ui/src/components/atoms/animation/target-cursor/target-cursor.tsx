/**
 * TargetCursor Component - Flowtomic UI
 *
 * Cursor em forma de mira (quatro cantoneiras e um ponto) que gira livre e, ao passar
 * sobre um elemento marcado com `data-cursor-target`, se abre e encaixa nos cantos dele.
 * Pensado para landing e portfólio, nunca para telas de trabalho denso. Toque não ativa.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/target-cursor.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useTargetCursorController } from "./target-cursor-controller";
import { CursorCorner, CursorDot, CursorLabel } from "./target-cursor-parts";
import { CORNERS } from "./target-cursor-utils";

export type TargetCursorProps = React.ComponentProps<"div"> & {
  /** Seletor dos elementos em que a mira encaixa. */
  targetSelector?: string;
  /** Segundos por volta livre; 0 desliga o giro. */
  spinDuration?: number;
  /** Segundos para encaixar no alvo. */
  snapDuration?: number;
  /** Lado da mira livre, em px. */
  size?: number;
  /** Comprimento de cada braço, em px. */
  cornerSize?: number;
  /** Espessura do traço, em px. */
  thickness?: number;
  /** Folga entre a mira e o alvo, em px. */
  padding?: number;
  /** Diâmetro do ponto central; 0 esconde. */
  dotSize?: number;
  /** Inclina a mira na direção do mouse quando travada. */
  parallax?: boolean;
  /** Copia o raio de borda do alvo (limitado ao braço). */
  matchRadius?: boolean;
  /** Mostra o `data-cursor-label` do alvo. */
  showLabel?: boolean;
  /** Aperta a mira ao segurar o botão. */
  pressEffect?: boolean;
  /** Aplica `cursor: none` enquanto a mira está ativa. */
  hideNativeCursor?: boolean;
  /** Limita a mira a um elemento; sem isso ela cobre a página inteira. */
  container?: React.RefObject<HTMLElement | null>;
};

function TargetCursor({
  ref,
  className,
  targetSelector = "[data-cursor-target]",
  spinDuration = 2,
  snapDuration = 0.2,
  size = 36,
  cornerSize = 12,
  thickness = 3,
  padding = 6,
  dotSize = 4,
  parallax = true,
  matchRadius = true,
  showLabel = true,
  pressEffect = true,
  hideNativeCursor = true,
  container,
  ...props
}: TargetCursorProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { active, lock, values } = useTargetCursorController(
    {
      targetSelector,
      spinDuration,
      snapDuration,
      size,
      cornerSize,
      padding,
      parallax,
      matchRadius,
      showLabel,
      pressEffect,
      hideNativeCursor,
      container,
    },
    rootRef
  );

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  if (!active) return null;

  return (
    <div
      data-slot="target-cursor"
      data-locked={lock ? "true" : undefined}
      aria-hidden="true"
      ref={setRefs}
      className={cn(
        container ? "absolute" : "fixed",
        "pointer-events-none inset-0 z-50 text-primary",
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute top-0 left-0 size-0"
        style={{ x: values.x, y: values.y, rotate: values.rotate, scale: values.scale }}
      >
        {CORNERS.map((corner) => (
          <CursorCorner
            key={corner}
            corner={corner}
            values={values.corners[corner]}
            cornerSize={cornerSize}
            thickness={thickness}
            radius={lock?.radius ?? 0}
          />
        ))}
      </motion.div>
      {dotSize > 0 && <CursorDot size={dotSize} values={values} />}
      {lock && <CursorLabel lock={lock} padding={padding} values={values} />}
    </div>
  );
}
TargetCursor.displayName = "TargetCursor";

export { TargetCursor };
