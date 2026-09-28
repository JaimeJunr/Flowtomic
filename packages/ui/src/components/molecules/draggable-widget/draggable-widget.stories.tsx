import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DraggableWidget } from "./draggable-widget";

const meta = {
  title: "Flowtomic UI/Molecules/DraggableWidget",
  component: DraggableWidget,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Mostra uma métrica que pode ser movida e redimensionada no painel.",
      },
    },
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

function MetricContent({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="flex h-full flex-col gap-2 p-5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-[32px] font-medium leading-none">{value}</span>
      <span className="text-[13px] text-muted-foreground">
        <span className="font-semibold text-success">{change}</span> sobre ontem
      </span>
    </div>
  );
}

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
          <MetricContent label="Builds hoje" value="9" change="↑ 2" />
        </DraggableWidget>
      </div>
    );
  },
  args: {
    widgetId: "demo-widget",
    widgetType: "card",
    children: null,
    gridPosition: { gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 1, gridRowEnd: 4 },
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
          <MetricContent label="Downloads no npm" value="1.284" change="↑ 86" />
        </DraggableWidget>
      </div>
    );
  },
  args: {
    widgetId: "view-widget",
    children: null,
    gridPosition: { gridColumnStart: 1, gridColumnEnd: 7, gridRowStart: 1, gridRowEnd: 5 },
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
          <MetricContent label="PRs revisados" value="12" change="↑ 3" />
        </DraggableWidget>
      </div>
    );
  },
  args: {
    widgetId: "actions-widget",
    children: null,
    gridPosition: { gridColumnStart: 1, gridColumnEnd: 6, gridRowStart: 1, gridRowEnd: 4 },
    isEditMode: true,
    currentWidth: 5,
    currentHeight: 3,
  },
};
