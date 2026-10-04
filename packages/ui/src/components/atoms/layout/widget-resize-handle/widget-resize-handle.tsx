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

const KEY_STEPS: Record<string, { w: number; h: number }> = {
  ArrowRight: { w: 1, h: 0 },
  ArrowLeft: { w: -1, h: 0 },
  ArrowDown: { w: 0, h: 1 },
  ArrowUp: { w: 0, h: -1 },
};

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
  const handleRef = useRef<HTMLButtonElement>(null);

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

  // Quem usa só teclado redimensiona pelas setas: uma célula por toque, dentro dos limites
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = KEY_STEPS[e.key];
    if (!step) return;
    e.preventDefault();
    const newW = Math.max(minWidth, Math.min(maxWidth, currentWidth + step.w));
    const newH = Math.max(minHeight, Math.min(maxHeight, currentHeight + step.h));
    if (newW !== currentWidth || newH !== currentHeight) {
      onResize(widgetId, newW, newH);
    }
  };

  return (
    <button
      data-slot="widget-resize-handle"
      type="button"
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute bottom-0 right-0 w-6 h-6",
        "flex items-center justify-center",
        "bg-primary/20 border border-primary/40 rounded-tl-md",
        "cursor-nwse-resize",
        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity",
        "hover:bg-primary/30",
        isResizing && "opacity-100 bg-primary/40",
        className
      )}
      tabIndex={0}
      aria-label="Redimensionar widget"
      onKeyDown={handleKeyDown}
    >
      <Maximize2 className="w-3 h-3 text-primary" />
    </button>
  );
}
