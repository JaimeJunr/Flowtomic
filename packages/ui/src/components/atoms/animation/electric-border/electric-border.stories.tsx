import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ElectricBorder } from "./electric-border";

function RiskAlert() {
  return (
    <div className="flex w-72 flex-col gap-2">
      <p className="text-sm text-muted-foreground">Limite de risco da carteira Atlas</p>
      <p className="font-mono text-3xl font-semibold">92,4% utilizado</p>
      <p className="text-xs text-muted-foreground">
        O VaR diário passou do teto de 2,0% às 14h32. Revise as posições alavancadas.
      </p>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/ElectricBorder",
  component: ElectricBorder,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Borda que treme como uma descarga elétrica, com brilho suave. Serve para destacar cartões de estado crítico ou ao vivo, como alertas de risco e o plano em destaque.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: { control: "text" },
    speed: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
    chaos: { control: { type: "range", min: 0, max: 0.5, step: 0.01 } },
    radius: { control: { type: "range", min: 0, max: 48, step: 1 } },
    thickness: { control: { type: "range", min: 1, max: 6, step: 0.5 } },
  },
  args: { children: <RiskAlert /> },
} satisfies Meta<typeof ElectricBorder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AlertaCritico: Story = {
  args: { color: "var(--destructive)", chaos: 0.2, speed: 1.6, thickness: 2.5 },
};

export const PlanoEmDestaque: Story = {
  args: {
    chaos: 0.08,
    speed: 0.7,
    radius: 24,
    children: (
      <div className="flex w-64 flex-col gap-1">
        <p className="text-sm text-muted-foreground">Plano Gestão</p>
        <p className="font-mono text-3xl font-semibold">R$ 289/mês</p>
        <p className="text-xs text-muted-foreground">Carteiras ilimitadas e relatórios semanais.</p>
      </div>
    ),
  },
};

export const SemTremor: Story = { args: { chaos: 0 } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ElectricBorder {...args} />
    </MotionConfig>
  ),
};
