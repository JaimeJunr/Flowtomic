import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircularProgressChart } from "./circular-progress-chart";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/CircularProgressChart",
  component: CircularProgressChart,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Gráfico circular de progresso usando SVG puro.",
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
    value: 41,
    label: "Project Ended",
    title: "Project Progress",
    size: 200,
  },
};

export const WithLegend: Story = {
  args: {
    value: 41,
    label: "Project Ended",
    title: "Project Progress",
    size: 200,
    legend: [
      { label: "Completed", color: "hsl(var(--primary))" },
      { label: "In Progress", color: "hsl(var(--success))" },
      { label: "Pending", color: "hsl(var(--muted))" },
    ],
  },
};

export const CustomColors: Story = {
  args: {
    value: 75,
    label: "75%",
    title: "Custom Progress",
    size: 250,
    progressColor: "hsl(142, 76%, 36%)",
    trackColor: "hsl(var(--muted))",
  },
};

export const WithColorRanges: Story = {
  args: {
    value: 65,
    label: "65%",
    title: "Progress with Ranges",
    size: 200,
    colorRanges: [
      { min: 0, max: 33, color: "hsl(var(--error))" },
      { min: 34, max: 66, color: "hsl(var(--warning))" },
      { min: 67, max: 100, color: "hsl(var(--success))" },
    ],
  },
};

export const Large: Story = {
  args: {
    value: 90,
    label: "90%",
    title: "Large Progress Chart",
    size: 300,
    strokeWidth: 16,
  },
};
