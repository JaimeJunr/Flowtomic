import type { Meta, StoryObj } from "@storybook/react-vite";
import type { WidgetLayout } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms";
import { WidgetRenderer } from "./widget-renderer";

const meta = {
  title: "Flowtomic UI/Molecules/WidgetRenderer",
  component: WidgetRenderer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isLoading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof WidgetRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockWidget: WidgetLayout = {
  id: "1",
  type: "card",
  x: 0,
  y: 0,
  w: 4,
  h: 2,
};

export const WithRenderProp: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <WidgetRenderer
          {...args}
          widget={mockWidget}
          renderWidget={(widget) => (
            <Card>
              <CardHeader>
                <CardTitle>Widget {widget.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Renderizado via render prop</p>
              </CardContent>
            </Card>
          )}
        />
      </div>
    );
  },
  args: {
    widget: mockWidget,
  },
};

export const WithRegistry: Story = {
  render: (args) => {
    const registry = new Map();
    registry.set("card", ({ widget }: { widget: WidgetLayout }) => (
      <Card>
        <CardHeader>
          <CardTitle>Widget {widget.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Renderizado via registry</p>
        </CardContent>
      </Card>
    ));

    return (
      <div className="w-96">
        <WidgetRenderer {...args} widget={mockWidget} widgetRegistry={registry} />
      </div>
    );
  },
  args: {
    widget: mockWidget,
  },
};

export const Loading: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <WidgetRenderer {...args} widget={mockWidget} isLoading />
      </div>
    );
  },
  args: {
    widget: mockWidget,
  },
};

export const UnknownType: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <WidgetRenderer
          {...args}
          widget={{ ...mockWidget, type: "unknown" }}
          fallback={
            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">Widget desconhecido</p>
              </CardContent>
            </Card>
          }
        />
      </div>
    );
  },
  args: {
    widget: { ...mockWidget, type: "unknown" },
  },
};
