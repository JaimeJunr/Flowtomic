import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { StatCard } from "./stat-card";

const meta = {
  title: "Flowtomic UI/Molecules/DataDisplay/StatCard",
  component: StatCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "success", "warning", "error", "info"],
    },
    variant: {
      control: "select",
      options: ["compact", "default", "detailed"],
    },
    showActions: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Receita Total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
  },
};

export const PositiveTrend: Story = {
  args: {
    title: "Vendas",
    value: 250000,
    delta: 25.0,
    lastMonth: 200000,
    prefix: "R$ ",
  },
};

export const NegativeTrend: Story = {
  args: {
    title: "Usuários",
    value: 85000,
    delta: -8.5,
    lastMonth: 92890,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Usuários Ativos",
    value: 1500000,
    delta: 12.3,
    lastMonth: 1336500,
    subtitle: "Total de usuários ativos este mês",
  },
};

export const WithActions: Story = {
  args: {
    title: "Receita",
    value: 500000,
    delta: 10.5,
    lastMonth: 452500,
    prefix: "R$ ",
    showActions: true,
    onSettings: fn(),
    onAddAlert: fn(),
    onPin: fn(),
    onShare: fn(),
    onRemove: fn(),
  },
};

export const NoDelta: Story = {
  args: {
    title: "Total de Pedidos",
    value: 1250,
    prefix: "",
  },
};

export const StringValue: Story = {
  args: {
    title: "Status",
    value: "Ativo",
    subtitle: "Sistema funcionando normalmente",
  },
};

export const DifferentColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[800px]">
      <StatCard title="Receita" value={122380} delta={15.1} color="primary" prefix="R$ " />
      <StatCard title="Vendas" value={85000} delta={-8.5} color="success" prefix="R$ " />
      <StatCard title="Usuários" value={50000} delta={25.0} color="warning" />
      <StatCard title="Pedidos" value={2500} delta={12.3} color="error" />
    </div>
  ),
};

export const CompactVariant: Story = {
  args: {
    title: "Receita Total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
    variant: "compact",
  },
};

export const DetailedVariant: Story = {
  args: {
    title: "Receita Total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
    subtitle: "Total de receita acumulada no período atual",
    variant: "detailed",
  },
};

export const WithHoverActions: Story = {
  args: {
    title: "Receita",
    value: 500000,
    delta: 10.5,
    lastMonth: 452500,
    prefix: "R$ ",
    showActions: true,
    onSettings: fn(),
    onAddAlert: fn(),
    onPin: fn(),
    onShare: fn(),
    onRemove: fn(),
  },
};

export const WithCurrency: Story = {
  args: {
    title: "Receita Total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    currency: "BRL",
    locale: "pt-BR",
  },
};

export const WithCurrencyUSD: Story = {
  args: {
    title: "Revenue",
    value: 50000,
    delta: 12.5,
    lastMonth: 44444,
    currency: "USD",
    locale: "en-US",
  },
};

export const WithLocaleFormatting: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[800px]">
      <StatCard
        title="Receita (pt-BR)"
        value={122380}
        delta={15.1}
        lastMonth={105922}
        locale="pt-BR"
        currency="BRL"
      />
      <StatCard
        title="Revenue (en-US)"
        value={122380}
        delta={15.1}
        lastMonth={105922}
        locale="en-US"
        currency="USD"
      />
      <StatCard
        title="Einnahmen (de-DE)"
        value={122380}
        delta={15.1}
        lastMonth={105922}
        locale="de-DE"
        currency="EUR"
      />
      <StatCard
        title="Receita (sem currency)"
        value={122380}
        delta={15.1}
        lastMonth={105922}
        locale="pt-BR"
        prefix="R$ "
      />
    </div>
  ),
};
