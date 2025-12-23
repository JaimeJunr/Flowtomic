/**
 * useDashboardLayout - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 *
 * @example
 * ```tsx
 * function MyDashboard() {
 *   const [widgets, setWidgets] = useState<WidgetLayout[]>([]);
 *   const gridConfig: GridConfig = { columns: 12, cellSize: 50, gap: 16 };
 *
 *   const {
 *     getWidgetGridPosition,
 *     moveWidget,
 *     resizeWidget,
 *     findNextAvailablePosition,
 *   } = useDashboardLayout({
 *     widgetsLayout: widgets,
 *     gridConfig,
 *     onUpdateLayout: setWidgets,
 *   });
 *
 *   return (
 *     <div>
 *       {widgets.map(widget => (
 *         <div style={getWidgetGridPosition(widget)}>
 *           Widget Content
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from "react";

// Importar tipos do @flowtomic/ui
// Nota: Em produção, estes tipos devem ser importados do package @flowtomic/ui
// Por enquanto, vamos definir localmente para evitar dependência circular
export interface WidgetLayout {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config?: Record<string, unknown>;
  minimized?: boolean;
}

export interface GridConfig {
  columns: number;
  cellSize?: number;
  gap?: number;
}

export interface UseDashboardLayoutProps {
  /**
   * Layout atual de widgets
   */
  widgetsLayout: WidgetLayout[];

  /**
   * Configuração do grid
   */
  gridConfig: GridConfig;

  /**
   * Callback para atualizar o layout completo
   */
  onUpdateLayout: (layout: WidgetLayout[]) => void;
}

export interface UseDashboardLayoutReturn {
  /**
   * Configuração do grid (normalizada com defaults)
   */
  gridConfig: GridConfig;

  /**
   * Calcula posição CSS Grid para um widget
   */
  getWidgetGridPosition: (widget: WidgetLayout) => {
    gridColumnStart: number;
    gridColumnEnd: number;
    gridRowStart: number;
    gridRowEnd: number;
  };

  /**
   * Verifica se uma posição está ocupada
   */
  isPositionOccupied: (
    x: number,
    y: number,
    w: number,
    h: number,
    excludeWidgetId?: string
  ) => boolean;

  /**
   * Encontra próxima posição disponível
   */
  findNextAvailablePosition: (w: number, h: number) => { x: number; y: number } | null;

  /**
   * Valida se um widget pode ser movido para uma posição
   */
  canMoveToPosition: (widgetId: string, x: number, y: number) => boolean;

  /**
   * Valida se um widget pode ser redimensionado
   */
  canResize: (widgetId: string, newW: number, newH: number) => boolean;

  /**
   * Move widget para nova posição
   */
  moveWidget: (widgetId: string, x: number, y: number) => void;

  /**
   * Redimensiona widget
   */
  resizeWidget: (widgetId: string, w: number, h: number) => void;

  /**
   * Atualiza layout completo
   */
  updateLayout: (layout: WidgetLayout[]) => void;
}

const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 12,
  cellSize: 50,
  gap: 16,
};

/**
 * Hook para gerenciar layout do dashboard
 *
 * Hook headless que fornece apenas lógica de layout, sem UI.
 * Você controla o markup e styles.
 */
export function useDashboardLayout({
  widgetsLayout,
  gridConfig,
  onUpdateLayout,
}: UseDashboardLayoutProps): UseDashboardLayoutReturn {
  // Normaliza gridConfig com defaults
  const normalizedGridConfig = useMemo<GridConfig>(() => {
    return {
      ...DEFAULT_GRID_CONFIG,
      ...gridConfig,
    };
  }, [gridConfig]);

  /**
   * Calcula posição CSS Grid para um widget
   */
  const getWidgetGridPosition = useCallback((widget: WidgetLayout) => {
    return {
      gridColumnStart: widget.x + 1, // CSS Grid é 1-indexed
      gridColumnEnd: widget.x + widget.w + 1,
      gridRowStart: widget.y + 1,
      gridRowEnd: widget.y + widget.h + 1,
    };
  }, []);

  /**
   * Verifica se uma posição está ocupada
   */
  const isPositionOccupied = useCallback(
    (x: number, y: number, w: number, h: number, excludeWidgetId?: string): boolean => {
      return widgetsLayout.some((widget) => {
        if (excludeWidgetId && widget.id === excludeWidgetId) {
          return false;
        }

        // Verifica sobreposição
        const widgetRight = widget.x + widget.w;
        const widgetBottom = widget.y + widget.h;
        const newRight = x + w;
        const newBottom = y + h;

        return !(
          widgetRight <= x ||
          widget.x >= newRight ||
          widgetBottom <= y ||
          widget.y >= newBottom
        );
      });
    },
    [widgetsLayout]
  );

  /**
   * Encontra próxima posição disponível
   */
  const findNextAvailablePosition = useCallback(
    (w: number, h: number): { x: number; y: number } | null => {
      const maxColumns = normalizedGridConfig.columns;
      const maxRows = 100; // Limite razoável

      for (let y = 0; y < maxRows; y++) {
        for (let x = 0; x <= maxColumns - w; x++) {
          if (!isPositionOccupied(x, y, w, h)) {
            return { x, y };
          }
        }
      }

      return null;
    },
    [normalizedGridConfig.columns, isPositionOccupied]
  );

  /**
   * Valida se um widget pode ser movido para uma posição
   */
  const canMoveToPosition = useCallback(
    (widgetId: string, x: number, y: number): boolean => {
      const widget = widgetsLayout.find((w) => w.id === widgetId);
      if (!widget) return false;

      // Valida limites do grid
      if (x < 0 || y < 0) return false;
      if (x + widget.w > normalizedGridConfig.columns) return false;

      // Verifica colisões
      return !isPositionOccupied(x, y, widget.w, widget.h, widgetId);
    },
    [widgetsLayout, normalizedGridConfig.columns, isPositionOccupied]
  );

  /**
   * Valida se um widget pode ser redimensionado
   */
  const canResize = useCallback(
    (widgetId: string, newW: number, newH: number): boolean => {
      const widget = widgetsLayout.find((w) => w.id === widgetId);
      if (!widget) return false;

      // Valida tamanhos mínimos e máximos
      if (newW < 2 || newH < 2) return false; // Mínimo 2x2
      if (newW > normalizedGridConfig.columns) return false;
      if (newH > 20) return false; // Máximo 20 linhas

      // Valida limites do grid
      if (widget.x + newW > normalizedGridConfig.columns) return false;

      // Verifica colisões
      return !isPositionOccupied(widget.x, widget.y, newW, newH, widgetId);
    },
    [widgetsLayout, normalizedGridConfig.columns, isPositionOccupied]
  );

  /**
   * Move widget para nova posição
   */
  const moveWidget = useCallback(
    (widgetId: string, x: number, y: number) => {
      if (!canMoveToPosition(widgetId, x, y)) {
        return;
      }

      const updatedLayout = widgetsLayout.map((widget) =>
        widget.id === widgetId ? { ...widget, x, y } : widget
      );

      onUpdateLayout(updatedLayout);
    },
    [widgetsLayout, canMoveToPosition, onUpdateLayout]
  );

  /**
   * Redimensiona widget
   */
  const resizeWidget = useCallback(
    (widgetId: string, w: number, h: number) => {
      if (!canResize(widgetId, w, h)) {
        return;
      }

      const updatedLayout = widgetsLayout.map((widget) =>
        widget.id === widgetId ? { ...widget, w, h } : widget
      );

      onUpdateLayout(updatedLayout);
    },
    [widgetsLayout, canResize, onUpdateLayout]
  );

  /**
   * Atualiza layout completo
   */
  const updateLayout = useCallback(
    (layout: WidgetLayout[]) => {
      onUpdateLayout(layout);
    },
    [onUpdateLayout]
  );

  return {
    gridConfig: normalizedGridConfig,
    getWidgetGridPosition,
    isPositionOccupied,
    findNextAvailablePosition,
    canMoveToPosition,
    canResize,
    moveWidget,
    resizeWidget,
    updateLayout,
  };
}
