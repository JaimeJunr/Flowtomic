import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { NeonBends } from "./neon-bends";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada centavo no lugar certo
      </h2>
      <p className="max-w-lg text-foreground">
        Conecte suas contas e acompanhe receitas, despesas e investimentos em uma única visão.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Conectar minha conta
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/NeonBends",
  component: NeonBends,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de poucas faixas grossas de luz neon que se dobram e deslizam devagar, cada uma com núcleo forte que se desfaz em brilho. As cores vêm de 1 a 4 tokens do tema. O mouse entorta as faixas por perto e desloca o conjunto (paralaxe). Sem WebGL, mostra um brilho elíptico em CSS.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    rotation: { control: { type: "range", min: 0, max: 360, step: 5 } },
    spin: { control: { type: "range", min: -30, max: 30, step: 1 } },
    speed: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    scale: { control: { type: "range", min: 0.3, max: 4, step: 0.1 } },
    frequency: { control: { type: "range", min: 0.2, max: 4, step: 0.1 } },
    warp: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    bandWidth: { control: { type: "range", min: 1, max: 20, step: 1 } },
    intensity: { control: { type: "range", min: 0, max: 4, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <NeonBends {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </NeonBends>
  ),
} satisfies Meta<typeof NeonBends>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FourColors: Story = {
  args: { colors: ["--primary", "--info", "--success", "--warning"] },
};

export const SingleColor: Story = { args: { colors: ["--primary"] } };

export const Vertical: Story = { args: { rotation: 0 } };

export const Spinning: Story = { args: { spin: 8 } };

export const StrongWarp: Story = { args: { warp: 2.5, frequency: 2 } };

export const ThinBands: Story = { args: { bandWidth: 16, intensity: 2.5 } };

export const NoPointer: Story = { args: { pointer: false } };

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
