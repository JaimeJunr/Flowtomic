/**
 * WidgetResizeHandle - Atom Component
 *
 * Handle para redimensionar widgets arrastando o canto inferior direito.
 * Componente puro de UI, totalmente genérico e reutilizável.
 */

import { Maximize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface WidgetResizeHandleProps {
  /**
   * ID do widget a ser redimensionado
   */
  widgetId: string;

  /**
   * Largura atual do widget em unidades de grade
   */
  currentWidth: number;

  /**
   * Altura atual do widget em unidades de grade
   */
  currentHeight: number;

  /**
   * Callback quando widget é redimensionado
   */
  onResize: (widgetId: string, w: number, h: number) => void;

  /**
   * Tamanho mínimo do widget (largura)
   */
  minWidth?: number;

  /**
   * Tamanho mínimo do widget (altura)
   */
  minHeight?: number;

  /**
   * Tamanho máximo do widget (largura)
   */
  maxWidth?: number;

  /**
   * Tamanho máximo do widget (altura)
   */
  maxHeight?: number;

  /**
   * Tamanho da célula do grid em pixels
   */
  cellSize?: number;

  /**
   * Gap entre células em pixels
   */
  gap?: number;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Handle para redimensionar widget
 *
 * Componente puro de UI que permite redimensionar widgets arrastando
 * o canto inferior direito. Usa snap to grid para alinhamento.
 */
export function WidgetResizeHandle({
  widgetId,
  currentWidth,
  currentHeight,
  onResize,
  minWidth = 2,
  minHeight = 2,
  maxWidth = 12,
  maxHeight = 20,
  cellSize = 50,
  gap = 16,
  className,
}: WidgetResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ w: currentWidth, h: currentHeight });
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setStartSize({ w: currentWidth, h: currentHeight });
    },
    [currentWidth, currentHeight]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      // Calcula novo tamanho baseado no movimento do mouse
      // Usa snap to grid
      const totalCellSize = cellSize + gap;
      const deltaW = Math.round(deltaX / totalCellSize);
      const deltaH = Math.round(deltaY / totalCellSize);

      // Se não houver mudança significativa, não atualiza
      if (deltaW === 0 && deltaH === 0) return;

      const newW = Math.max(minWidth, Math.min(maxWidth, startSize.w + deltaW));
      const newH = Math.max(minHeight, Math.min(maxHeight, startSize.h + deltaH));

      // Atualiza apenas se mudou
      if (newW !== currentWidth || newH !== currentHeight) {
        onResize(widgetId, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    startPos,
    startSize,
    currentWidth,
    currentHeight,
    widgetId,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    cellSize,
    gap,
    onResize,
  ]);

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute bottom-0 right-0 w-6 h-6",
        "flex items-center justify-center",
        "bg-primary/20 border border-primary/40 rounded-tl-md",
        "cursor-nwse-resize",
        "opacity-0 group-hover:opacity-100 transition-opacity",
        "hover:bg-primary/30",
        isResizing && "opacity-100 bg-primary/40",
        className
      )}
      aria-label="Redimensionar widget"
    >
      <Maximize2 className="w-3 h-3 text-primary" />
    </div>
  );
}
