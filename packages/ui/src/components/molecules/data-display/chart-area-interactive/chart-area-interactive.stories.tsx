import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChartAreaInteractiveDataPoint } from "./chart-area-interactive";
import { ChartAreaInteractive } from "./chart-area-interactive";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ChartAreaInteractive",
  component: ChartAreaInteractive,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Mostra a evolução de acessos por dispositivo ao longo do tempo.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultTimeRange: {
      control: "select",
      options: ["7d", "30d", "90d"],
    },
    height: {
      control: "text",
    },
  },
} satisfies Meta<typeof ChartAreaInteractive>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: ChartAreaInteractiveDataPoint[] = Array.from({ length: 91 }, (_, day) => ({
  date: new Date(Date.UTC(2026, 3, day + 1)).toISOString().slice(0, 10),
  // Onda semanal (fim de semana cai) + tendência de alta leve, sem aleatório: a story fica estável.
  desktop: Math.round(220 + day * 0.8 + 60 * Math.sin((day / 7) * 2 * Math.PI) + ((day * 37) % 29)),
  mobile: Math.round(
    110 + day * 0.5 + 25 * Math.sin((day / 7) * 2 * Math.PI + 1) + ((day * 23) % 17)
  ),
}));

const chartConfig = {
  visitors: { label: "Acessos" },
  desktop: { label: "Computador", color: "hsl(var(--primary))" },
  mobile: { label: "Celular", color: "hsl(var(--muted-foreground))" },
};

export const Default: Story = {
  args: {
    data: sampleData,
    config: chartConfig,
    title: "Acessos à documentação",
  },
};

export const CustomTitle: Story = {
  args: {
    data: sampleData,
    config: chartConfig,
    title: "Acessos ao catálogo",
    description: "Por dispositivo, de abril a junho de 2026.",
  },
};

export const Last7Days: Story = {
  args: {
    data: sampleData,
    config: chartConfig,
    title: "Acessos à documentação",
    defaultTimeRange: "7d",
  },
};

export const Last30Days: Story = {
  args: {
    data: sampleData,
    config: chartConfig,
    title: "Acessos à documentação",
    defaultTimeRange: "30d",
  },
};

export const CustomHeight: Story = {
  args: {
    data: sampleData,
    config: chartConfig,
    title: "Acessos à documentação",
    height: "400px",
  },
};

export const CustomConfig: Story = {
  args: {
    data: sampleData,
    config: chartConfig,
    title: "Acessos ao catálogo",
    description: "Por dispositivo, de abril a junho de 2026.",
  },
};
