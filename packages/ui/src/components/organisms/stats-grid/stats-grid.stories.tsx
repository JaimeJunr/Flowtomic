import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatsGrid } from "./stats-grid";

const sampleStats = [
  {
    id: "1",
    title: "Receita Total",
    value: 122380,
    // delta calculado automaticamente: ((122380 - 105922) / 105922) * 100 = +15.5%
    lastMonth: 105922,
    prefix: "R$ ",
    color: "blue" as const,
  },
  {
    id: "2",
    title: "Usuários Ativos",
    value: 85000,
    // delta calculado automaticamente: ((85000 - 92890) / 92890) * 100 = -8.5%
    lastMonth: 92890,
    color: "green" as const,
  },
  {
    id: "3",
    title: "Pedidos",
    value: 2500,
    // delta calculado automaticamente: ((2500 - 2228) / 2228) * 100 = +12.2%
    lastMonth: 2228,
    color: "orange" as const,
  },
  {
    id: "4",
    title: "Taxa de Conversão",
    value: 50,
    suffix: "%",
    // delta calculado automaticamente: ((50 - 28) / 28) * 100 = +78.6%
    lastMonth: 28,
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

export const LoadingWithCount: Story = {
  args: {
    stats: [],
    layout: "grid",
    loading: true,
    skeletonCount: 4,
  },
};

export const LoadingWithStatsLength: Story = {
  args: {
    stats: sampleStats,
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

export const AutoCalculatedDelta: Story = {
  args: {
    stats: [
      {
        id: "1",
        title: "Taxa de Conversão",
        value: 50,
        suffix: "%",
        lastMonth: 28, // delta calculado automaticamente: +78.6%
        color: "purple" as const,
      },
      {
        id: "2",
        title: "Taxa de Engajamento",
        value: 75,
        suffix: "%",
        lastMonth: 60, // delta calculado automaticamente: +25.0%
        color: "green" as const,
      },
    ],
    layout: "grid",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo demonstrando cálculo automático do delta quando apenas `value` e `lastMonth` são fornecidos. O delta é calculado automaticamente pelo hook useStatCard.",
      },
    },
  },
};
