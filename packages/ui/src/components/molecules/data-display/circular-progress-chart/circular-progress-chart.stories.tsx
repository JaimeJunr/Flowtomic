import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircularProgressChart } from "./circular-progress-chart";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/CircularProgressChart",
  component: CircularProgressChart,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Anel de progresso em SVG puro. A porcentagem no centro é a resposta; label e legenda ficam subordinados.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 100, step: 1 },
    },
    size: {
      control: { type: "number", min: 100, max: 400, step: 50 },
    },
    strokeWidth: {
      control: { type: "number", min: 4, max: 24, step: 2 },
    },
  },
} satisfies Meta<typeof CircularProgressChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 12,
    max: 29,
    label: "com teste",
    title: "Molecules da 0.9.0",
  },
};

export const WithLegend: Story = {
  args: {
    value: 12,
    max: 29,
    label: "com teste",
    title: "Molecules da 0.9.0",
    legend: [
      { label: "Com teste", color: "hsl(var(--primary))" },
      { label: "Sem teste", color: "hsl(var(--muted))" },
    ],
  },
};

export const CustomColors: Story = {
  args: {
    value: 75,
    label: "dos builds passaram",
    title: "Builds do registry",
    size: 200,
    progressColor: "hsl(var(--success))",
    trackColor: "hsl(var(--muted))",
  },
};

export const WithColorRanges: Story = {
  args: {
    value: 65,
    label: "de cobertura",
    title: "Cobertura de branches",
    colorRanges: [
      { min: 0, max: 33, color: "hsl(var(--destructive))" },
      { min: 34, max: 66, color: "hsl(var(--warning))" },
      { min: 67, max: 100, color: "hsl(var(--success))" },
    ],
  },
};

export const Large: Story = {
  args: {
    value: 90,
    label: "da documentação",
    title: "Docs atualizadas",
    size: 300,
    strokeWidth: 16,
  },
};
