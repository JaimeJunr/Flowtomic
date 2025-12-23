/**
 * DraggableWidget - Molecule Component
 *
 * Wrapper para widgets que permite drag and drop e redimensionamento.
 * Componente genérico e reutilizável para qualquer dashboard.
 */

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings2, X } from "lucide-react";
import { memo } from "react";
import { WidgetResizeHandle } from "@/components/atoms/widget-resize-handle";
import { cn } from "@/lib/utils";

export interface DraggableWidgetProps {
  /**
   * ID único do widget
   */
  widgetId: string;

  /**
   * Tipo do widget (opcional, para identificação)
   */
  widgetType?: string;

  /**
   * Conteúdo do widget
   */
  children: React.ReactNode;

  /**
   * Se está em modo de edição
   */
  isEditMode: boolean;

  /**
   * Posição CSS Grid
   */
  gridPosition: {
    gridColumnStart: number;
    gridColumnEnd: number;
    gridRowStart: number;
    gridRowEnd: number;
  };

  /**
   * Largura atual do widget em unidades de grade
   */
  currentWidth: number;

  /**
   * Altura atual do widget em unidades de grade
   */
  currentHeight: number;

  /**
   * Callback quando widget é clicado para configurar
   */
  onConfigure?: (widgetId: string) => void;

  /**
   * Callback quando widget é removido
   */
  onRemove?: (widgetId: string) => void;

  /**
   * Callback quando widget é redimensionado
   */
  onResize?: (widgetId: string, w: number, h: number) => void;

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
 * Componente de widget arrastável
 *
 * Wrapper genérico que adiciona funcionalidades de drag and drop,
 * redimensionamento e controles de edição a qualquer widget.
 */
export const DraggableWidget = memo<DraggableWidgetProps>(
  ({
    widgetId,
    widgetType,
    children,
    isEditMode,
    gridPosition,
    currentWidth,
    currentHeight,
    onConfigure,
    onRemove,
    onResize,
    cellSize = 50,
    gap = 16,
    className,
  }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: widgetId,
      disabled: !isEditMode,
      data: {
        type: "widget",
        widgetId,
        widgetType,
      },
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      ...gridPosition,
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.(widgetId);
    };

    const handleConfigure = (e: React.MouseEvent) => {
      e.stopPropagation();
      onConfigure?.(widgetId);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative group",
          isDragging && "opacity-50 z-50",
          isEditMode && "ring-2 ring-primary/20",
          className
        )}
      >
        {/* Widget Content */}
        <div
          className={cn(
            "h-full w-full bg-card rounded-lg border border-border shadow-sm overflow-hidden",
            isEditMode && "hover:shadow-md transition-shadow"
          )}
        >
          {children}
        </div>

        {/* Edit Mode Overlay */}
        {isEditMode && (
          <>
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className={cn(
                "absolute top-2 left-2 p-1.5 rounded-md",
                "bg-background/80 backdrop-blur-sm border border-border",
                "cursor-grab active:cursor-grabbing",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-background"
              )}
              aria-label="Arrastar widget"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onConfigure && (
                <button
                  onClick={handleConfigure}
                  className={cn(
                    "p-1.5 rounded-md",
                    "bg-background/80 backdrop-blur-sm border border-border",
                    "hover:bg-background text-muted-foreground hover:text-foreground",
                    "transition-colors"
                  )}
                  aria-label="Configurar widget"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              )}
              {onRemove && (
                <button
                  onClick={handleRemove}
                  className={cn(
                    "p-1.5 rounded-md",
                    "bg-background/80 backdrop-blur-sm border border-border",
                    "hover:bg-destructive hover:text-destructive-foreground",
                    "text-muted-foreground transition-colors"
                  )}
                  aria-label="Remover widget"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Resize Handle */}
            {onResize && (
              <WidgetResizeHandle
                widgetId={widgetId}
                currentWidth={currentWidth}
                currentHeight={currentHeight}
                onResize={onResize}
                cellSize={cellSize}
                gap={gap}
              />
            )}
          </>
        )}
      </div>
    );
  }
);

DraggableWidget.displayName = "DraggableWidget";
