import type { Meta, StoryObj } from "@storybook/react-vite";
import { MonthlySummary } from "./monthly-summary";

const meta = {
  title: "Flowtomic UI/Organisms/MonthlySummary",
  component: MonthlySummary,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    growthPercentage: {
      control: "number",
    },
  },
} satisfies Meta<typeof MonthlySummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalRevenue: 125000,
    costs: 45000,
    netProfit: 80000,
    growthPercentage: 15.5,
  },
};

export const WithCurrencyFormat: Story = {
  args: {
    totalRevenue: 125000,
    costs: 45000,
    netProfit: 80000,
    growthPercentage: 15.5,
    formatCurrency: (value) => `R$ ${value.toLocaleString("pt-BR")}`,
  },
};

export const WithoutGrowth: Story = {
  args: {
    totalRevenue: 125000,
    costs: 45000,
    netProfit: 80000,
  },
};

export const CustomLabels: Story = {
  args: {
    totalRevenue: 125000,
    costs: 45000,
    netProfit: 80000,
    growthPercentage: 15.5,
    labels: {
      title: "Resumo Mensal",
      totalRevenue: "Receita Total",
      costs: "Custos Totais",
      netProfit: "Lucro Líquido",
      growthLabel: "vs mês anterior",
    },
  },
};

export const LargeNumbers: Story = {
  args: {
    totalRevenue: 2500000,
    costs: 1200000,
    netProfit: 1300000,
    growthPercentage: 25.0,
    formatCurrency: (value) => `R$ ${(value / 1000).toFixed(0)}k`,
  },
};

export const NegativeProfit: Story = {
  args: {
    totalRevenue: 50000,
    costs: 75000,
    netProfit: -25000,
    growthPercentage: -10.5,
  },
};
