import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { VelvetVeil } from "./velvet-veil";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada centavo da carteira, em movimento
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Veja a evolução do patrimônio e das taxas de todas as suas contas, atualizada o dia todo.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Abrir meu painel
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/VelvetVeil",
  component: VelvetVeil,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de um véu de luz macia que muda de forma devagar, com halo nas partes densas e grão de filme. O mouse enrola o véu e o acende. Sem WebGL, mostra um gradiente radial CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    scale: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    flow: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    sheen: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    glow: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    grain: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    fade: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  // A raiz usa "dark" para o efeito ficar sobre escuro nos dois temas.
  render: (args) => (
    <VelvetVeil {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </VelvetVeil>
  ),
} satisfies Meta<typeof VelvetVeil>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CloseUp: Story = { args: { scale: 2, flow: 2, speed: 1 } };

export const SilkSheen: Story = { args: { sheen: 1, glow: 0.8, grain: 0.08 } };

export const FadedEdges: Story = { args: { fade: 1, color: "--info" } };

export const Frozen: Story = { args: { speed: 0, pointer: false } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
