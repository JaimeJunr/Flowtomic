import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms";
import { WidgetResizeHandle } from "./widget-resize-handle";

const meta = {
  title: "Flowtomic UI/Atoms/WidgetResizeHandle",
  component: WidgetResizeHandle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    currentWidth: {
      control: { type: "number", min: 2, max: 12 },
    },
    currentHeight: {
      control: { type: "number", min: 2, max: 20 },
    },
    minWidth: {
      control: { type: "number", min: 1, max: 12 },
    },
    minHeight: {
      control: { type: "number", min: 1, max: 20 },
    },
    maxWidth: {
      control: { type: "number", min: 2, max: 24 },
    },
    maxHeight: {
      control: { type: "number", min: 2, max: 40 },
    },
  },
} satisfies Meta<typeof WidgetResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [width, setWidth] = useState(args.currentWidth ?? 4);
    const [height, setHeight] = useState(args.currentHeight ?? 3);

    return (
      <div className="relative w-64 h-48 border border-border rounded-lg bg-card group">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              Widget {width}×{height}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Passe o mouse sobre o widget e arraste o canto inferior direito para redimensionar.
            </p>
          </CardContent>
        </Card>
        <WidgetResizeHandle
          {...args}
          widgetId="demo-widget"
          currentWidth={width}
          currentHeight={height}
          onResize={(_id, w, h) => {
            setWidth(w);
            setHeight(h);
          }}
        />
      </div>
    );
  },
  args: {
    widgetId: "demo-widget",
    currentWidth: 4,
    currentHeight: 3,
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 20,
    cellSize: 50,
    gap: 16,
  },
};

export const WithConstraints: Story = {
  render: (args) => {
    const [width, setWidth] = useState(6);
    const [height, setHeight] = useState(4);

    return (
      <div className="relative w-96 h-64 border border-border rounded-lg bg-card group">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Widget com Restrições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Largura: {width} | Altura: {height}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Mínimo: 3×3 | Máximo: 8×6</p>
          </CardContent>
        </Card>
        <WidgetResizeHandle
          {...args}
          widgetId="constrained-widget"
          currentWidth={width}
          currentHeight={height}
          onResize={(_id, w, h) => {
            setWidth(w);
            setHeight(h);
          }}
          minWidth={3}
          minHeight={3}
          maxWidth={8}
          maxHeight={6}
        />
      </div>
    );
  },
  args: {
    widgetId: "constrained-widget",
    currentWidth: 6,
    currentHeight: 4,
  },
};
