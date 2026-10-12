import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { LiquidMetal } from "./liquid-metal";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira, sem ruído e sem planilha
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Posição consolidada, rentabilidade por ativo e a próxima data de pagamento em uma tela só.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Consolidar minha carteira
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/LiquidMetal",
  component: LiquidMetal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de metal líquido escuro que ondula devagar, com reflexos finos nas cristas. Com o mouse, ondas concêntricas saem do ponteiro. Sem WebGL, mostra um gradiente equivalente. A cor dos reflexos é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    amplitude: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    frequency: { control: { type: "range", min: 1, max: 8, step: 0.5 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <LiquidMetal {...args} className="min-h-[480px]">
        <Hero />
      </LiquidMetal>
    </div>
  ),
} satisfies Meta<typeof LiquidMetal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = { args: { color: "--primary" } };

export const Calm: Story = { args: { amplitude: 0.12, frequency: 2, speed: 0.6 } };

export const Turbulent: Story = { args: { amplitude: 0.7, frequency: 6, speed: 1.6 } };

export const WithoutPointer: Story = { args: { pointer: false } };

export const Frozen: Story = { args: { speed: 0 } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
