import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DashboardMovementsSection } from "./dashboard-movements-section";

const sampleMovements = [
  {
    id: "1",
    name: "Produto A",
    price: "R$ 1.500,00",
    tag: "Disponível",
    buttonText: "Vender",
    onButtonClick: fn(),
  },
  {
    id: "2",
    name: "Produto B",
    price: "R$ 2.300,00",
    tag: "Reservado",
    buttonText: "Aguardando",
    onButtonClick: fn(),
  },
  {
    id: "3",
    name: "Produto C",
    price: "R$ 3.100,00",
    tag: "Vendido",
    buttonText: "Entregue",
    onButtonClick: fn(),
  },
];

const meta = {
  title: "Flowtomic UI/Organisms/DashboardMovementsSection",
  component: DashboardMovementsSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    periodBadge: {
      control: "text",
    },
  },
} satisfies Meta<typeof DashboardMovementsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    movements: sampleMovements,
    title: "Movimentações Semanais",
    periodBadge: "7 dias",
  },
};

export const Empty: Story = {
  args: {
    movements: [],
    title: "Movimentações Semanais",
    periodBadge: "7 dias",
    emptyMessage: "Nenhuma movimentação encontrada",
  },
};

export const CustomPeriod: Story = {
  args: {
    movements: sampleMovements,
    title: "Movimentações",
    periodBadge: "30 dias",
  },
};

export const CustomTitle: Story = {
  args: {
    movements: sampleMovements,
    title: "Atividades Recentes",
    periodBadge: "Última semana",
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    movements: [],
    title: "Movimentações",
    periodBadge: "7 dias",
    emptyMessage: "Nenhuma movimentação encontrada para este período",
  },
};
