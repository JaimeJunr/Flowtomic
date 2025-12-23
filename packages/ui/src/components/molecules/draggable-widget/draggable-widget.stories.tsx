import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms";
import { DraggableWidget } from "./draggable-widget";

const meta = {
  title: "Flowtomic UI/Molecules/DraggableWidget",
  component: DraggableWidget,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isEditMode: {
      control: "boolean",
    },
    currentWidth: {
      control: { type: "number", min: 2, max: 12 },
    },
    currentHeight: {
      control: { type: "number", min: 2, max: 20 },
    },
  },
} satisfies Meta<typeof DraggableWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [width, setWidth] = useState(args.currentWidth ?? 4);
    const [height, setHeight] = useState(args.currentHeight ?? 3);

    return (
      <div
        className="grid gap-4 p-8"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          width: "800px",
        }}
      >
        <DraggableWidget
          {...args}
          widgetId="demo-widget"
          currentWidth={width}
          currentHeight={height}
          gridPosition={{
            gridColumnStart: 1,
            gridColumnEnd: width + 1,
            gridRowStart: 1,
            gridRowEnd: height + 1,
          }}
          onResize={(_id, w, h) => {
            setWidth(w);
            setHeight(h);
          }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Widget Arrastável</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este widget pode ser arrastado e redimensionado quando em modo de edição.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Tamanho: {width}×{height}
              </p>
            </CardContent>
          </Card>
        </DraggableWidget>
      </div>
    );
  },
  args: {
    widgetId: "demo-widget",
    widgetType: "card",
    isEditMode: true,
    currentWidth: 4,
    currentHeight: 3,
  },
};

export const ViewMode: Story = {
  render: (args) => {
    return (
      <div
        className="grid gap-4 p-8"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          width: "600px",
        }}
      >
        <DraggableWidget
          {...args}
          widgetId="view-widget"
          currentWidth={6}
          currentHeight={4}
          gridPosition={{
            gridColumnStart: 1,
            gridColumnEnd: 7,
            gridRowStart: 1,
            gridRowEnd: 5,
          }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Modo Visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em modo de visualização, o widget não pode ser arrastado ou redimensionado.
              </p>
            </CardContent>
          </Card>
        </DraggableWidget>
      </div>
    );
  },
  args: {
    widgetId: "view-widget",
    isEditMode: false,
    currentWidth: 6,
    currentHeight: 4,
  },
};

export const WithActions: Story = {
  render: (args) => {
    const [width, setWidth] = useState(5);
    const [height, setHeight] = useState(3);

    return (
      <div
        className="grid gap-4 p-8"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          width: "800px",
        }}
      >
        <DraggableWidget
          {...args}
          widgetId="actions-widget"
          currentWidth={width}
          currentHeight={height}
          gridPosition={{
            gridColumnStart: 1,
            gridColumnEnd: width + 1,
            gridRowStart: 1,
            gridRowEnd: height + 1,
          }}
          onResize={(_id, w, h) => {
            setWidth(w);
            setHeight(h);
          }}
          onConfigure={(id) => {
            alert(`Configurar widget: ${id}`);
          }}
          onRemove={(id) => {
            alert(`Remover widget: ${id}`);
          }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Widget com Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Passe o mouse sobre o widget para ver os controles de configuração e remoção.
              </p>
            </CardContent>
          </Card>
        </DraggableWidget>
      </div>
    );
  },
  args: {
    widgetId: "actions-widget",
    isEditMode: true,
    currentWidth: 5,
    currentHeight: 3,
  },
};
