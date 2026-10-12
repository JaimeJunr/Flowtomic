import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { SpectralBurst } from "./spectral-burst";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 p-10 text-center">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Do aporte ao resultado, sem ruído
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Veja de onde vem cada centavo de rendimento da sua carteira, em um só lugar.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Ver minha carteira
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/SpectralBurst",
  component: SpectralBurst,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com uma explosão de raios de luz saindo de um miolo escuro, como um túnel de velocidade. Os raios giram ou balançam, dobram e correm num gradiente entre dois tokens do tema. Sem WebGL, mostra um gradiente cônico CSS.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    intensity: { control: { type: "range", min: 0, max: 4, step: 0.1 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    motion: { control: "inline-radio", options: ["spin", "sway"] },
    distort: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    rayCount: { control: { type: "range", min: 0, max: 64, step: 1 } },
  },
  // A raiz usa "dark" para o efeito ficar sobre escuro nos dois temas.
  render: (args) => (
    <SpectralBurst {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </SpectralBurst>
  ),
} satisfies Meta<typeof SpectralBurst>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sway: Story = { args: { motion: "sway", distort: 1.2 } };

export const DiscreteRays: Story = { args: { rayCount: 24, intensity: 2.2 } };

export const OffCenter: Story = { args: { center: { x: 0.25, y: -0.15 } } };

export const WarmColors: Story = { args: { colors: ["--warning", "--destructive"] } };

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
