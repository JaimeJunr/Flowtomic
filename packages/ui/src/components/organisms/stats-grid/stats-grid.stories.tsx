import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatsGrid } from "./stats-grid";

const sampleStats = [
  {
    id: "1",
    title: "Receita Total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
    color: "blue" as const,
  },
  {
    id: "2",
    title: "Usuários Ativos",
    value: 85000,
    delta: -8.5,
    lastMonth: 92890,
    color: "green" as const,
  },
  {
    id: "3",
    title: "Pedidos",
    value: 2500,
    delta: 12.3,
    lastMonth: 2228,
    color: "orange" as const,
  },
  {
    id: "4",
    title: "Taxa de Conversão",
    value: 3.2,
    suffix: "%",
    delta: 0.5,
    lastMonth: 2.7,
    color: "purple" as const,
  },
];

const meta = {
  title: "Flowtomic UI/Organisms/StatsGrid",
  component: StatsGrid,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "select",
      options: ["grid", "list"],
    },
    loading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof StatsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: sampleStats,
    layout: "grid",
  },
};

export const ListLayout: Story = {
  args: {
    stats: sampleStats,
    layout: "list",
  },
};

export const Loading: Story = {
  args: {
    stats: [],
    layout: "grid",
    loading: true,
  },
};

export const CustomColumns: Story = {
  args: {
    stats: sampleStats,
    layout: "grid",
    columns: {
      sm: 1,
      md: 2,
      lg: 4,
    },
  },
};

export const TwoColumns: Story = {
  args: {
    stats: sampleStats.slice(0, 2),
    layout: "grid",
    columns: {
      sm: 1,
      md: 2,
      lg: 2,
    },
  },
};

export const SingleColumn: Story = {
  args: {
    stats: sampleStats.slice(0, 1),
    layout: "grid",
    columns: {
      sm: 1,
      md: 1,
      lg: 1,
    },
  },
};
