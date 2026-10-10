import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { TiltedCard } from "./tilted-card";

function PaymentCard() {
  return (
    <div className="flex h-52 w-80 flex-col justify-between bg-gradient-to-br from-primary to-foreground p-5 text-primary-foreground">
      <span className="font-medium text-sm">Cartão Corporativo</span>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-lg tracking-widest">0000 0000 0000 4821</span>
        <span className="text-xs opacity-80">Válido até 08/29</span>
      </div>
    </div>
  );
}

function ReportCover() {
  return (
    <div className="flex h-72 w-52 flex-col justify-between border bg-card p-5 text-card-foreground">
      <span className="text-muted-foreground text-xs">Relatório trimestral</span>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-xl">Resultado do 3T</span>
        <span className="text-muted-foreground text-sm">Carteira, fluxo de caixa e projeções</span>
      </div>
    </div>
  );
}

function LimitOverlay() {
  return (
    <div className="flex h-full items-start justify-end p-4">
      <span className="rounded-sm bg-background px-2 py-1 font-medium text-foreground text-xs shadow-sm">
        Limite R$ 25.000
      </span>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/TiltedCard",
  component: TiltedCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cartão que inclina em 3D seguindo o mouse e mostra uma legenda junto ao ponteiro. Serve para apresentar o cartão de crédito do cliente, a capa de um relatório ou um print do produto com presença física. Em toque e com movimento reduzido fica plano.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    rotateAmplitude: { control: { type: "number", min: 0, max: 30 } },
    scaleOnHover: { control: { type: "number", min: 1, max: 1.3, step: 0.01 } },
    showTooltip: { control: "boolean" },
  },
  args: {
    media: <PaymentCard />,
    caption: "Cartão final 4821",
  },
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TiltedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComSobreposicao: Story = {
  args: { overlay: <LimitOverlay /> },
};

export const InclinacaoForte: Story = {
  args: { rotateAmplitude: 22, scaleOnHover: 1.1 },
};

export const CapaDeRelatorio: Story = {
  args: { media: <ReportCover />, caption: "Relatório do 3T" },
};

export const SemLegenda: Story = {
  args: { showTooltip: false },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <TiltedCard {...args} />
    </MotionConfig>
  ),
};
