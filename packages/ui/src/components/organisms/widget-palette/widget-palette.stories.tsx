import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity, BarChart3, Table, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { WidgetPaletteItem } from "./widget-palette";
import { WidgetPalette } from "./widget-palette";

const meta = {
  title: "Flowtomic UI/Organisms/WidgetPalette",
  component: WidgetPalette,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof WidgetPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultWidgets: WidgetPaletteItem[] = [
  {
    id: "stats",
    type: "stats",
    name: "Estatísticas",
    description: "Exibe métricas e estatísticas",
    icon: TrendingUp,
    defaultSize: { w: 4, h: 2 },
  },
  {
    id: "chart",
    type: "chart",
    name: "Gráfico",
    description: "Visualização de dados em gráfico",
    icon: BarChart3,
    defaultSize: { w: 6, h: 4 },
  },
  {
    id: "table",
    type: "table",
    name: "Tabela",
    description: "Exibe dados em formato tabular",
    icon: Table,
    defaultSize: { w: 12, h: 6 },
  },
  {
    id: "movements",
    type: "movements",
    name: "Movimentações",
    description: "Histórico de movimentações",
    icon: Activity,
    defaultSize: { w: 6, h: 4 },
  },
];

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen ?? true);
    return (
      <div className="relative h-screen">
        <WidgetPalette
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          widgets={defaultWidgets}
        />
      </div>
    );
  },
  args: {
    isOpen: true,
    widgets: defaultWidgets,
  },
};

export const CustomTitle: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div className="relative h-screen">
        <WidgetPalette
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Adicionar Widgets"
          description="Selecione e arraste widgets para o dashboard"
        />
      </div>
    );
  },
  args: {
    isOpen: true,
    widgets: defaultWidgets,
  },
};

export const Empty: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div className="relative h-screen">
        <WidgetPalette {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} widgets={[]} />
      </div>
    );
  },
  args: {
    isOpen: true,
    widgets: [],
  },
};
