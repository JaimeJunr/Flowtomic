import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { StatCard } from "./stat-card";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/StatCard",
  component: StatCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Mostra uma métrica com valor, variação e ações opcionais.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
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
    title: "Receita total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
    locale: "pt-BR",
  },
};

export const PositiveTrend: Story = {
  args: {
    title: "Downloads no npm",
    value: 18420,
    delta: 12.4,
    lastMonth: 16388,
    locale: "pt-BR",
  },
};

export const NegativeTrend: Story = {
  args: {
    title: "Builds com falha",
    value: 7,
    delta: 40,
    lastMonth: 5,
    positive: false,
    locale: "pt-BR",
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Builds do registry",
    value: 148,
    delta: 8.8,
    lastMonth: 136,
    subtitle: "Publicações de junho de 2026",
    locale: "pt-BR",
  },
};

export const WithActions: Story = {
  args: {
    title: "PRs revisados",
    value: 32,
    delta: 14.3,
    lastMonth: 28,
    locale: "pt-BR",
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
    title: "Componentes publicados",
    value: 86,
    locale: "pt-BR",
  },
};

export const StringValue: Story = {
  args: {
    title: "Versão do @flowtomic/ui",
    value: "0.9.0",
    subtitle: "Publicado em junho de 2026",
    locale: "pt-BR",
  },
};

export const DifferentColors: Story = {
  args: { title: "Downloads no npm", value: 18420 },
  render: () => (
    <div className="grid w-[800px] grid-cols-2 gap-4">
      <StatCard
        title="Downloads no npm"
        value={18420}
        delta={12.4}
        lastMonth={16388}
        locale="pt-BR"
      />
      <StatCard
        title="Builds com falha"
        value={7}
        delta={40}
        lastMonth={5}
        positive={false}
        locale="pt-BR"
      />
      <StatCard title="PRs revisados" value={32} delta={14.3} lastMonth={28} locale="pt-BR" />
      <StatCard
        title="Erros no registry"
        value={4}
        delta={-20}
        lastMonth={5}
        positive={false}
        locale="pt-BR"
      />
    </div>
  ),
};

export const CompactVariant: Story = {
  args: {
    title: "Receita total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
    locale: "pt-BR",
    variant: "compact",
  },
};

export const DetailedVariant: Story = {
  args: {
    title: "Receita total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
    subtitle: "Fechamento de junho de 2026",
    locale: "pt-BR",
    variant: "detailed",
  },
};

export const WithHoverActions: Story = {
  args: {
    title: "PRs revisados",
    value: 32,
    delta: 14.3,
    lastMonth: 28,
    locale: "pt-BR",
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
    title: "Receita total",
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    currency: "BRL",
    locale: "pt-BR",
  },
};

export const WithCurrencyUSD: Story = {
  args: {
    title: "Receita de licenças",
    value: 50000,
    delta: 12.5,
    lastMonth: 44444,
    currency: "BRL",
    locale: "pt-BR",
  },
};

export const WithLocaleFormatting: Story = {
  args: { title: "Receita total", value: 122380 },
  render: () => (
    <div className="grid w-[800px] grid-cols-2 gap-4">
      <StatCard
        title="Receita total"
        value={122380}
        delta={15.1}
        lastMonth={105922}
        locale="pt-BR"
        currency="BRL"
      />
      <StatCard
        title="Downloads no npm"
        value={18420}
        delta={12.4}
        lastMonth={16388}
        locale="pt-BR"
      />
      <StatCard title="Builds do registry" value={148} delta={8.8} lastMonth={136} locale="pt-BR" />
      <StatCard
        title="Receita de licenças"
        value={122380}
        delta={15.1}
        lastMonth={105922}
        locale="pt-BR"
        prefix="R$ "
      />
    </div>
  ),
};
