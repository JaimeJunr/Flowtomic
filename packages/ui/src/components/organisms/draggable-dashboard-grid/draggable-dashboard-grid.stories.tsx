import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { WidgetLayout } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms";
import { DraggableDashboardGrid } from "./draggable-dashboard-grid";

const meta = {
  title: "Flowtomic UI/Organisms/DraggableDashboardGrid",
  component: DraggableDashboardGrid,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isEditMode: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DraggableDashboardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [widgets, setWidgets] = useState<WidgetLayout[]>([
      { id: "1", type: "card", x: 0, y: 0, w: 4, h: 2 },
      { id: "2", type: "chart", x: 4, y: 0, w: 4, h: 3 },
      { id: "3", type: "table", x: 8, y: 0, w: 4, h: 4 },
    ]);

    return (
      <div className="p-8">
        <DraggableDashboardGrid
          {...args}
          widgets={widgets}
          renderWidget={(widget) => (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Widget {widget.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tipo: {widget.type} | Tamanho: {widget.w}×{widget.h}
                </p>
              </CardContent>
            </Card>
          )}
          onMoveWidget={(id, x, y) => {
            setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
          }}
        />
      </div>
    );
  },
  args: {
    isEditMode: true,
  },
};

export const ViewMode: Story = {
  render: (args) => {
    const widgets: WidgetLayout[] = [
      { id: "1", type: "card", x: 0, y: 0, w: 6, h: 3 },
      { id: "2", type: "chart", x: 6, y: 0, w: 6, h: 3 },
    ];

    return (
      <div className="p-8">
        <DraggableDashboardGrid
          {...args}
          widgets={widgets}
          renderWidget={(widget) => (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Widget {widget.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em modo de visualização, os widgets não podem ser movidos.
                </p>
              </CardContent>
            </Card>
          )}
        />
      </div>
    );
  },
  args: {
    isEditMode: false,
  },
};

export const EmptyState: Story = {
  render: (args) => {
    return (
      <div className="p-8">
        <DraggableDashboardGrid {...args} widgets={[]} renderWidget={() => null} />
      </div>
    );
  },
  args: {
    isEditMode: true,
  },
};
