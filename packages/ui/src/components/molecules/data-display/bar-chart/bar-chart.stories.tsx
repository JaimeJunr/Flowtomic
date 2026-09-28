import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "./bar-chart";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/BarChart",
  component: BarChart,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Gráfico de barras em SVG puro. Valor zero vira um traço na linha de base, para o dia vazio não sumir.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    height: {
      control: { type: "number", min: 100, max: 500, step: 50 },
    },
    showValues: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { label: "seg", value: 3 },
  { label: "ter", value: 7 },
  { label: "qua", value: 5 },
  { label: "qui", value: 0 },
  { label: "sex", value: 9 },
  { label: "sáb", value: 2 },
  { label: "dom", value: 0 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    title: "Builds do registry por dia",
    height: 200,
  },
};

export const WithValues: Story = {
  args: {
    data: sampleData,
    title: "Builds do registry por dia",
    height: 200,
    showValues: true,
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { label: "seg", value: 3, color: "hsl(var(--muted-foreground))" },
      { label: "ter", value: 7, color: "hsl(var(--muted-foreground))" },
      { label: "qua", value: 5, color: "hsl(var(--muted-foreground))" },
      { label: "qui", value: 0 },
      { label: "sex", value: 9, color: "hsl(var(--primary))" },
      { label: "sáb", value: 2, color: "hsl(var(--muted-foreground))" },
      { label: "dom", value: 0 },
    ],
    title: "Builds do registry, hoje em destaque",
    height: 200,
    showValues: true,
  },
};

export const WeeklyData: Story = {
  args: {
    data: [
      { label: "seg", value: 12 },
      { label: "ter", value: 8 },
      { label: "qua", value: 15 },
      { label: "qui", value: 4 },
      { label: "sex", value: 10 },
    ],
    title: "PRs revisados na semana",
    height: 250,
    showValues: true,
  },
};
