import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChartBarInteractiveDataPoint } from "./chart-bar-interactive";
import { ChartBarInteractive } from "./chart-bar-interactive";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ChartBarInteractive",
  component: ChartBarInteractive,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Compara acessos por dispositivo em barras e permite alternar a série.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultActiveChart: {
      control: "select",
      options: ["desktop", "mobile"],
    },
    height: {
      control: "text",
    },
  },
} satisfies Meta<typeof ChartBarInteractive>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: ChartBarInteractiveDataPoint[] = Array.from({ length: 91 }, (_, day) => ({
  date: new Date(Date.UTC(2026, 3, day + 1)).toISOString().slice(0, 10),
  // Onda semanal (fim de semana cai) + tendência de alta leve, sem aleatório: a story fica estável.
  desktop: Math.round(220 + day * 0.8 + 60 * Math.sin((day / 7) * 2 * Math.PI) + ((day * 37) % 29)),
  mobile: Math.round(
    110 + day * 0.5 + 25 * Math.sin((day / 7) * 2 * Math.PI + 1) + ((day * 23) % 17)
  ),
}));

const chartConfig = {
  views: { label: "Acessos" },
  desktop: { label: "Computador", color: "var(--primary)" },
  mobile: { label: "Celular", color: "var(--muted-foreground)" },
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

export const MobileDefault: Story = {
  args: {
    data: sampleData,
    config: chartConfig,
    title: "Acessos à documentação",
    defaultActiveChart: "mobile",
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
