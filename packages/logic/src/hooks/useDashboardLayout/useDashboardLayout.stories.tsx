import { Card, CardContent, CardHeader, CardTitle } from "@flowtomic/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { GridConfig, WidgetLayout } from "./useDashboardLayout";
import { useDashboardLayout } from "./useDashboardLayout";

/**
 * Story demonstrando o uso do hook useDashboardLayout
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useDashboardLayout",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica de layout para dashboards com drag and drop. Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 */
function DashboardLayoutDemo() {
  const [widgets, setWidgets] = useState<WidgetLayout[]>([
    { id: "1", type: "card", x: 0, y: 0, w: 4, h: 2 },
    { id: "2", type: "chart", x: 4, y: 0, w: 4, h: 3 },
    { id: "3", type: "table", x: 8, y: 0, w: 4, h: 4 },
  ]);

  const gridConfig: GridConfig = {
    columns: 12,
    cellSize: 50,
    gap: 16,
  };

  const {
    gridConfig: normalizedConfig,
    getWidgetGridPosition,
    isPositionOccupied,
    findNextAvailablePosition,
    canMoveToPosition,
    canResize,
    moveWidget,
    resizeWidget,
  } = useDashboardLayout({
    widgetsLayout: widgets,
    gridConfig,
    onUpdateLayout: setWidgets,
  });

  const handleMove = (widgetId: string, x: number, y: number) => {
    if (canMoveToPosition(widgetId, x, y)) {
      moveWidget(widgetId, x, y);
    }
  };

  const handleResize = (widgetId: string, w: number, h: number) => {
    if (canResize(widgetId, w, h)) {
      resizeWidget(widgetId, w, h);
    }
  };

  const nextPos = findNextAvailablePosition(3, 2);

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <div
        className="grid gap-4 p-4 border rounded-lg bg-background"
        style={{
          gridTemplateColumns: `repeat(${normalizedConfig.columns}, minmax(0, 1fr))`,
          gap: `${normalizedConfig.gap}px`,
          minHeight: "400px",
        }}
      >
        {widgets.map((widget) => {
          const position = getWidgetGridPosition(widget);
          return (
            <div
              key={widget.id}
              className="border border-border rounded-lg bg-card p-4"
              style={position}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">
                    Widget {widget.id} ({widget.w}×{widget.h})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Posição: ({widget.x}, {widget.y})
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Próxima posição disponível (3×2):</strong>{" "}
          {nextPos ? `(${nextPos.x}, ${nextPos.y})` : "Não encontrada"}
        </p>
        <p>
          <strong>Posição (5, 1) ocupada (3×2):</strong>{" "}
          {isPositionOccupied(5, 1, 3, 2) ? "Sim" : "Não"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleMove("1", 6, 0)}
            className="px-3 py-1 text-xs border rounded"
          >
            Mover Widget 1 para (6, 0)
          </button>
          <button
            type="button"
            onClick={() => handleResize("1", 6, 3)}
            className="px-3 py-1 text-xs border rounded"
          >
            Redimensionar Widget 1 para 6×3
          </button>
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <DashboardLayoutDemo />,
};
