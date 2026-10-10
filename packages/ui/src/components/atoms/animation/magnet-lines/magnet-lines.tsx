/**
 * MagnetLines Component - Flowtomic UI
 *
 * Grade de tracinhos que giram para apontar ao ponteiro, como limalha em volta
 * de um ímã. Decorativo: serve de ilustração viva em estado vazio, login ou hero.
 * Com movimento reduzido os traços ficam fixos no ângulo de repouso.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/magnet-lines.md
 */

"use client";

import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { pointAngle } from "./magnet-lines-utils";

export type MagnetLinesProps = React.ComponentProps<"div"> & {
  rows?: number;
  columns?: number;
  /** Cor dos traços. Use token semântico. */
  lineColor?: string;
  /** Espessura do traço (qualquer medida CSS). */
  lineWidth?: string;
  /** Comprimento do traço (qualquer medida CSS). */
  lineLength?: string;
  /** Ângulo de repouso em graus. */
  baseAngle?: number;
};

type Point = { x: number; y: number };

function measureCenters(lines: HTMLElement[]): Point[] {
  return lines.map((line) => {
    const rect = line.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
}

function useMagnetAim(rootRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  React.useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-slot="magnet-lines-line"]'));
    let centers = measureCenters(lines);
    let pointer: Point | null = null;
    let frame = 0;

    const apply = () => {
      frame = 0;
      if (!pointer) return;
      const target = pointer;
      lines.forEach((line, index) => {
        const { x, y } = centers[index];
        line.style.setProperty("--angle", `${pointAngle(x, y, target.x, target.y)}deg`);
      });
    };
    const handlePointer = (event: PointerEvent | MouseEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      // Um cálculo por quadro, por mais eventos que cheguem.
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const remeasure = () => {
      centers = measureCenters(lines);
    };

    window.addEventListener("pointermove", handlePointer);
    window.addEventListener("pointerdown", handlePointer);
    window.addEventListener("resize", remeasure);
    // capture: pega o scroll de qualquer ancestral rolável, não só o da janela.
    window.addEventListener("scroll", remeasure, true);
    return () => {
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, rootRef]);
}

// Chave por posição na grade (linha-coluna): a lista é estática, só muda com rows/columns.
function cellKeys(rows: number, columns: number): string[] {
  return Array.from(
    { length: rows * columns },
    (_, i) => `${Math.floor(i / columns)}-${i % columns}`
  );
}

function MagnetLines({
  ref,
  className,
  style,
  rows = 9,
  columns = 9,
  lineColor = "var(--muted-foreground)",
  lineWidth = "2px",
  lineLength = "24px",
  baseAngle = -10,
  ...props
}: MagnetLinesProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduceMotion = useShouldReduceMotion();
  useMagnetAim(rootRef, !reduceMotion);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const lineStyle = {
    width: lineWidth,
    height: lineLength,
    background: lineColor,
    borderRadius: "9999px",
    "--angle": `${baseAngle}deg`,
    transform: "rotate(var(--angle))",
    transition: "transform 0.15s ease-out",
  } as React.CSSProperties;

  return (
    <div
      data-slot="magnet-lines"
      aria-hidden="true"
      role="presentation"
      ref={setRefs}
      className={cn("grid size-80", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, ...style }}
      {...props}
    >
      {cellKeys(rows, columns).map((key) => (
        <div key={key} className="flex items-center justify-center">
          <span data-slot="magnet-lines-line" style={lineStyle} />
        </div>
      ))}
    </div>
  );
}
MagnetLines.displayName = "MagnetLines";

export { MagnetLines };
