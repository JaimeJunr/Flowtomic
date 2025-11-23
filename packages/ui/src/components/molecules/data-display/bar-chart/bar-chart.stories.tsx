import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "./bar-chart";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/BarChart",
  component: BarChart,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Gráfico de barras simples para analytics usando SVG puro.",
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
  { label: "S", value: 0 },
  { label: "M", value: 45 },
  { label: "T", value: 74 },
  { label: "W", value: 60 },
  { label: "T", value: 0 },
  { label: "F", value: 0 },
  { label: "S", value: 0 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    title: "Project Analytics",
    height: 200,
  },
};

export const WithValues: Story = {
  args: {
    data: sampleData,
    title: "Project Analytics",
    height: 200,
    showValues: true,
  },
};

export const CustomColors: Story = {
  args: {
    data: [
      { label: "S", value: 0, color: "hsl(var(--muted))" },
      { label: "M", value: 45, color: "hsl(var(--primary))" },
      { label: "T", value: 74, color: "hsl(var(--primary))" },
      { label: "W", value: 60, color: "hsl(var(--primary))" },
      { label: "T", value: 0, color: "hsl(var(--muted))" },
      { label: "F", value: 0, color: "hsl(var(--muted))" },
      { label: "S", value: 0, color: "hsl(var(--muted))" },
    ],
    title: "Project Analytics",
    height: 200,
    showValues: true,
  },
};

export const WeeklyData: Story = {
  args: {
    data: [
      { label: "Mon", value: 80 },
      { label: "Tue", value: 65 },
      { label: "Wed", value: 90 },
      { label: "Thu", value: 75 },
      { label: "Fri", value: 85 },
    ],
    title: "Weekly Progress",
    height: 250,
    showValues: true,
  },
};
