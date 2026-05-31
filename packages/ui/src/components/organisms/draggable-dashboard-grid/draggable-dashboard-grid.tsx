/**
 * DraggableDashboardGrid - Organism Component
 *
 * Grid principal com drag and drop para dashboards.
 * Componente genérico e reutilizável para qualquer dashboard.
 */

import type { DragCancelEvent, DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDashboardLayout } from "@flowtomic/logic";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DraggableWidget } from "@/components/molecules/draggable-widget";
import { cn } from "@/lib/utils";
import type { GridConfig, WidgetLayout } from "@/types/dashboard";
import { computeWidgetGridPositionFromDrag } from "./dashboard-grid-drag";

export interface DraggableDashboardGridProps {
  /**
   * Widgets a serem renderizados
   */
  widgets: WidgetLayout[];

  /**
   * Renderiza o conteúdo de um widget
   */
  renderWidget: (widget: WidgetLayout) => React.ReactNode;

  /**
   * Se está em modo de edição
   */
  isEditMode: boolean;

  /**
   * Configuração do grid (opcional, usa defaults se não fornecido)
   */
  gridConfig?: GridConfig;

  /**
   * Callback quando widget é configurado
   */
  onConfigureWidget?: (widgetId: string) => void;

  /**
   * Callback quando widget é removido
   */
  onRemoveWidget?: (widgetId: string) => void;

  /**
   * Callback quando widget é redimensionado
   */
  onResizeWidget?: (widgetId: string, w: number, h: number) => void;

  /**
   * Callback quando widget é adicionado da paleta
   */
  onAddWidget?: (widgetType: string, defaultSize: { w: number; h: number }) => void;

  /**
   * Callback quando widget é movido
   */
  onMoveWidget?: (widgetId: string, x: number, y: number) => void;

  /**
   * Empty state customizável (opcional)
   */
  emptyState?: React.ReactNode;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Grid principal com drag and drop
 *
 * Componente genérico que gerencia um grid de widgets com funcionalidades
 * de drag and drop, redimensionamento e edição.
 */
export function DraggableDashboardGrid({
  widgets,
  renderWidget,
  isEditMode,
  gridConfig,
  onConfigureWidget,
  onRemoveWidget,
  onResizeWidget,
  onAddWidget,
  onMoveWidget,
  emptyState,
  className,
}: DraggableDashboardGridProps) {
  // Normaliza gridConfig com defaults
  const normalizedGridConfig: GridConfig = useMemo(
    () => ({
      columns: 12,
      cellSize: 50,
      gap: 16,
      ...gridConfig,
    }),
    [gridConfig]
  );

  // Estado local para gerenciar layout (sincroniza com props)
  const [localWidgets, setLocalWidgets] = useState<WidgetLayout[]>(widgets);

  // Sincroniza estado local com props externas
  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  // Hook headless para lógica de layout
  const {
    getWidgetGridPosition,
    moveWidget: moveWidgetLayout,
    resizeWidget: resizeWidgetLayout,
  } = useDashboardLayout({
    widgetsLayout: localWidgets,
    gridConfig: normalizedGridConfig,
    onUpdateLayout: (layout) => {
      setLocalWidgets(layout);
      // Chama callback externo se fornecido
      if (onMoveWidget) {
        layout.forEach((w) => {
          const original = widgets.find((ow) => ow.id === w.id);
          if (original && (original.x !== w.x || original.y !== w.y)) {
            onMoveWidget(w.id, w.x, w.y);
          }
        });
      }
    },
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  // dnd-kit reporta delta cumulativo desde o início do drag — não somar ao x/y já atualizado
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  const layoutBeforeDragRef = useRef<WidgetLayout[] | null>(null);

  // Configura sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer 8px de movimento antes de iniciar drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Widget ativo sendo arrastado
  const activeWidget = useMemo(() => {
    return localWidgets.find((w) => w.id === activeId) || null;
  }, [localWidgets, activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    const widgetId = event.active.id as string;
    setActiveId(widgetId);

    const activeWidget = localWidgets.find((w) => w.id === widgetId);
    if (activeWidget) {
      dragStartPositionRef.current = { x: activeWidget.x, y: activeWidget.y };
      layoutBeforeDragRef.current = localWidgets;
    } else {
      dragStartPositionRef.current = null;
      layoutBeforeDragRef.current = null;
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    if (!isEditMode || !activeId) return;

    const { delta } = event;
    const activeWidget = localWidgets.find((w) => w.id === activeId);
    const dragStart = dragStartPositionRef.current;

    if (!activeWidget || !dragStart) return;

    // Calcula nova posição baseada no delta do movimento
    // Usa o tamanho da célula do grid para snap to grid
    const cellSize = (normalizedGridConfig.cellSize || 50) + (normalizedGridConfig.gap || 16);

    const { x: newX, y: newY } = computeWidgetGridPositionFromDrag({
      dragStart,
      widgetWidth: activeWidget.w,
      deltaPixels: delta,
      cellSize,
      columns: normalizedGridConfig.columns,
    });

    if (newX === dragStart.x && newY === dragStart.y) return;

    // Valida limites do grid
    if (newX + activeWidget.w > normalizedGridConfig.columns) return;

    // Move widget para nova posição apenas se mudou
    if (newX !== activeWidget.x || newY !== activeWidget.y) {
      moveWidgetLayout(activeWidget.id, newX, newY);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Se arrastou da paleta para o grid
    if (active.data.current?.type === "palette-widget" && over) {
      const widgetType = active.data.current.widgetType as string;
      const defaultSize = active.data.current.defaultSize as { w: number; h: number };

      // Adiciona novo widget na próxima posição disponível
      onAddWidget?.(widgetType, defaultSize);
    }

    dragStartPositionRef.current = null;
    layoutBeforeDragRef.current = null;
    setActiveId(null);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    if (layoutBeforeDragRef.current) {
      setLocalWidgets(layoutBeforeDragRef.current);
    }
    dragStartPositionRef.current = null;
    layoutBeforeDragRef.current = null;
    setActiveId(null);
  };

  const handleResize = (widgetId: string, w: number, h: number) => {
    resizeWidgetLayout(widgetId, w, h);
    onResizeWidget?.(widgetId, w, h);
  };

  // Droppable area para receber widgets da paleta
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: "dashboard-grid",
    data: {
      type: "grid",
    },
  });

  // Empty state apenas quando está em modo de edição e não há widgets
  if (localWidgets.length === 0 && isEditMode) {
    if (emptyState) {
      return <>{emptyState}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-24 h-24 text-muted-foreground mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum widget configurado</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Arraste widgets da paleta para começar a personalizar seu dashboard.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={setDroppableRef}
        className={cn(className)}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${normalizedGridConfig.columns}, minmax(0, 1fr))`,
          gap: `${normalizedGridConfig.gap}px`,
        }}
      >
        {localWidgets.map((widget) => {
          const gridPosition = getWidgetGridPosition(widget);

          return (
            <DraggableWidget
              key={widget.id}
              widgetId={widget.id}
              widgetType={widget.type}
              isEditMode={isEditMode}
              gridPosition={gridPosition}
              currentWidth={widget.w}
              currentHeight={widget.h}
              cellSize={normalizedGridConfig.cellSize}
              gap={normalizedGridConfig.gap}
              onConfigure={onConfigureWidget}
              onRemove={onRemoveWidget}
              onResize={handleResize}
            >
              {renderWidget(widget)}
            </DraggableWidget>
          );
        })}
      </div>

      {/* Drag Overlay - Preview durante drag */}
      <DragOverlay>
        {activeWidget && <div className="opacity-50">{renderWidget(activeWidget)}</div>}
      </DragOverlay>
    </DndContext>
  );
}
