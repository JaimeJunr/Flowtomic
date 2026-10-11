import type { Meta, StoryObj } from "@storybook/react-vite";
import { Landmark, LineChart, ShieldCheck } from "lucide-react";
import { MotionConfig } from "motion/react";
import type * as React from "react";
import { PixelCard, type PixelCardProps } from "./pixel-card";

type PlanProps = PixelCardProps & {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function PlanCard({ icon, title, description, ...props }: PlanProps) {
  return (
    <PixelCard tabIndex={0} {...props}>
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <span className="text-foreground">{icon}</span>
        <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </PixelCard>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Display/PixelCard",
  component: PixelCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cartão com uma grade de pixels que acende do centro para fora ao passar o mouse ou focar, e cintila até a pessoa sair. Bom para cartões de recurso ou de plano em landing.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "primary", "accent"] },
    gap: { control: { type: "number", min: 2, max: 16 } },
    speed: { control: { type: "range", min: 0, max: 100, step: 5 } },
    noFocus: { control: "boolean" },
  },
  render: (args) => (
    <PlanCard
      {...args}
      icon={<LineChart className="size-6" />}
      title="Gestão de carteiras"
      description="Cotas, fluxo de caixa e enquadramento conciliados antes da abertura."
    />
  ),
} satisfies Meta<typeof PixelCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: "primary" },
  render: (args) => (
    <PlanCard
      {...args}
      icon={<Landmark className="size-6" />}
      title="Plano Gestora"
      description="Controle de passivo e distribuição para até 40 fundos."
    />
  ),
};

export const Accent: Story = {
  args: { variant: "accent", gap: 8, speed: 50 },
  render: (args) => (
    <PlanCard
      {...args}
      icon={<ShieldCheck className="size-6" />}
      title="Compliance contínuo"
      description="Regras de risco verificadas a cada atualização de posição."
    />
  ),
};

export const Dense: Story = {
  args: { gap: 3, speed: 80 },
};

export const IgnoresFocus: Story = {
  args: { noFocus: true },
};

export const ReducedMotion: Story = {
  args: { variant: "primary" },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PlanCard
        {...args}
        icon={<Landmark className="size-6" />}
        title="Plano Gestora"
        description="Controle de passivo e distribuição para até 40 fundos."
      />
    </MotionConfig>
  ),
};
