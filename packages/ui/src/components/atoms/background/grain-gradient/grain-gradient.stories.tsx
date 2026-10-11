import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { GrainGradient } from "./grain-gradient";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-primary-foreground">
        Fechamento do mês sem correria
      </h2>
      <p className="max-w-lg text-primary-foreground">
        Concilie lançamentos, aprove pagamentos e envie o relatório ao contador em poucos cliques.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-background px-5 py-2.5 text-sm font-medium text-foreground"
        >
          Iniciar fechamento
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/GrainGradient",
  component: GrainGradient,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL opaco com um degradê de três cores em manchas macias que escorrem devagar, coberto por grão de filme. Sem WebGL, mostra um gradiente CSS equivalente. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    warp: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    softness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    contrast: { control: { type: "range", min: 0.5, max: 2, step: 0.1 } },
    grain: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    zoom: { control: { type: "range", min: 0.5, max: 3, step: 0.1 } },
  },
  render: (args) => (
    <GrainGradient {...args} className="min-h-[480px]">
      <Hero />
    </GrainGradient>
  ),
} satisfies Meta<typeof GrainGradient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CoarseGrain: Story = { args: { grain: 0.5, softness: 0.2, contrast: 1.5 } };

export const StrongWarp: Story = { args: { warp: 2, speed: 1.5, zoom: 1.5 } };

export const Frozen: Story = { args: { speed: 0 } };

export const AlternativeColors: Story = {
  args: { colors: ["--success", "--info", "--primary"] },
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
