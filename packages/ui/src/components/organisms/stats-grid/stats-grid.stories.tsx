import type { Meta, StoryObj } from "@storybook/react-vite";
import { type StatItem, StatsGrid } from "./stats-grid";

const sampleStats: StatItem[] = [
  // delta calculado automaticamente: ((1240 - 1074) / 1074) * 100 = +15,5%
  { id: "npm", title: "Downloads no npm, 7 dias", value: 1240, lastMonth: 1074 },
  {
    id: "componentes",
    title: "Componentes publicados",
    value: 140,
    subtitle: "6 novos desde a 0.7.0",
  },
  { id: "cobertura", title: "Cobertura de testes", value: "20,9%", subtitle: "meta 75%" },
  // subir é ruim aqui: positive={false} pinta a subida de vermelho
  {
    id: "build",
    title: "Build do registry",
    value: 38,
    lastMonth: 35,
    suffix: " s",
    positive: false,
  },
];

const meta = {
  title: "Flowtomic UI/Organisms/StatsGrid",
  component: StatsGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Régua de métricas: rótulo, valor em JetBrains Mono e a variação contra o período anterior. Só a variação ganha cor, e `positive={false}` inverte o sentido para métricas em que subir é ruim.",
      },
    },
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
      // delta calculado automaticamente: +15,5%
      { id: "npm", title: "Downloads no npm, 7 dias", value: 1240, lastMonth: 1074 },
      // queda boa: com positive={false}, a descida fica verde
      {
        id: "erros",
        title: "Erros no console das stories",
        value: 3,
        lastMonth: 7,
        positive: false,
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
