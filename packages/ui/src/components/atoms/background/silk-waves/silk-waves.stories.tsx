import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { SilkWaves } from "./silk-waves";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-primary-foreground">
        Fechamento do mês sem correria
      </h2>
      <p className="max-w-lg text-primary-foreground">
        Concilie extratos, cobranças e repasses em uma única tela, com tudo pronto para o contador.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-background px-5 py-2.5 text-sm font-medium text-foreground"
        >
          Iniciar conciliação
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/SilkWaves",
  component: SilkWaves,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de tecido acetinado de uma cor, com dobras diagonais que deslizam devagar e grão fino. Sem WebGL, mostra um gradiente CSS equivalente. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    scale: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    rotation: { control: { type: "range", min: -180, max: 180, step: 5 } },
    grain: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
  },
  render: (args) => (
    <SilkWaves {...args} className="min-h-[480px] bg-background">
      <Hero />
    </SilkWaves>
  ),
} satisfies Meta<typeof SilkWaves>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargeFolds: Story = { args: { scale: 2, rotation: 20 } };

export const Frozen: Story = { args: { speed: 0 } };

export const GrainyInfo: Story = { args: { color: "--info", grain: 0.9 } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
