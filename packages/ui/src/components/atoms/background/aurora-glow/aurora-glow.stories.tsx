import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { AuroraGlow } from "./aurora-glow";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira inteira, num só lugar
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Acompanhe saldo, rentabilidade e vencimentos de todas as suas corretoras sem planilha.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Conectar minha primeira conta
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/AuroraGlow",
  component: AuroraGlow,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com uma faixa de luz ondulante que desce do topo e esmaece para o meio. Sem WebGL, mostra um gradiente CSS equivalente. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    amplitude: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    blend: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    intensity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
  render: (args) => (
    <AuroraGlow {...args} className="min-h-[480px] bg-background">
      <Hero />
    </AuroraGlow>
  ),
} satisfies Meta<typeof AuroraGlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighAmplitude: Story = { args: { amplitude: 2, speed: 1.5 } };

export const Frozen: Story = { args: { speed: 0 } };

export const AlternativeColors: Story = {
  args: { colors: ["--success", "--info", "--primary"], intensity: 0.9 },
};

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
