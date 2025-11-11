import { Badge } from "@flowtomic/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStatCard } from "./index";

/**
 * Story demonstrando o uso do hook useStatCard
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useStatCard",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica e formatação para cards de estatística. Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 */
function StatCardDemo({
  value,
  delta,
  lastMonth,
  prefix,
  suffix,
}: {
  value: number;
  delta?: number;
  lastMonth?: number;
  prefix?: string;
  suffix?: string;
}) {
  const { formattedValue, formattedLastMonth, trend, getCardProps } = useStatCard({
    value,
    delta,
    lastMonth,
    prefix,
    suffix,
  });

  return (
    <div {...getCardProps()} className="rounded-lg border bg-card p-6 shadow-sm w-[300px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{formattedValue}</p>
          {formattedLastMonth && (
            <p className="text-xs text-muted-foreground mt-1">Mês anterior: {formattedLastMonth}</p>
          )}
        </div>
        {trend.delta > 0 && (
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={
                trend.variant === "success"
                  ? "success"
                  : trend.variant === "destructive"
                    ? "destructive"
                    : "secondary"
              }
            >
              {trend.percentage}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const PositiveTrend: Story = {
  render: () => (
    <StatCardDemo value={122380} lastMonth={105922} prefix="R$ " />
  ),
  parameters: {
    docs: {
      description: {
        story: "Delta calculado automaticamente: ((122380 - 105922) / 105922) * 100 = +15.5%",
      },
    },
  },
};

export const NegativeTrend: Story = {
  render: () => <StatCardDemo value={85000} lastMonth={92890} prefix="R$ " />,
  parameters: {
    docs: {
      description: {
        story: "Delta calculado automaticamente: ((85000 - 92890) / 92890) * 100 = -8.5%",
      },
    },
  },
};

export const WithSuffix: Story = {
  render: () => (
    <StatCardDemo value={1500000} lastMonth={1336500} prefix="$" suffix=" USD" />
  ),
  parameters: {
    docs: {
      description: {
        story: "Delta calculado automaticamente com sufixo customizado",
      },
    },
  },
};

export const ExplicitDelta: Story = {
  render: () => (
    <StatCardDemo value={122380} delta={15.1} lastMonth={105922} prefix="R$ " />
  ),
  parameters: {
    docs: {
      description: {
        story: "Delta explícito tem prioridade sobre o cálculo automático",
      },
    },
  },
};

export const NoDelta: Story = {
  render: () => <StatCardDemo value={50000} prefix="R$ " />,
};

export const LargeValue: Story = {
  render: () => <StatCardDemo value={2500000} delta={25.0} lastMonth={2000000} prefix="R$ " />,
};

export const PercentGrowth: Story = {
  render: () => (
    <StatCardDemo value={50} lastMonth={28} suffix="%" />
  ),
  parameters: {
    docs: {
      description: {
        story: "Crescimento percentual: de 28% para 50%. Delta calculado automaticamente: ((50 - 28) / 28) * 100 = +78.6%",
      },
    },
  },
};
