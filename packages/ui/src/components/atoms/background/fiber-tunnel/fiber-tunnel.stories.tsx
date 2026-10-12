import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { FiberTunnel } from "./fiber-tunnel";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 p-10 text-center">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada lançamento chega ao razão sem atraso
      </h2>
      <p className="max-w-lg text-muted-foreground">
        A conciliação lê as fontes em paralelo e entrega o saldo fechado antes da abertura do
        mercado.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Conectar a primeira conta
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/FiberTunnel",
  component: FiberTunnel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de um túnel de fibras ópticas visto de frente: cabos finos saem de um ponto de fuga escuro e carregam pulsos de luz para fora ou para dentro. O mouse puxa o ponto de fuga. Sem WebGL, mostra raios em CSS com o centro apagado. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    direction: { control: "inline-radio", options: ["outward", "inward"] },
    cables: { control: { type: "range", min: 4, max: 48, step: 1 } },
    thickness: { control: { type: "range", min: 0.1, max: 1, step: 0.05 } },
    pulseLength: { control: { type: "range", min: 0.05, max: 1, step: 0.05 } },
    waviness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <FiberTunnel {...args} className="min-h-[480px]">
        <Hero />
      </FiberTunnel>
    </div>
  ),
} satisfies Meta<typeof FiberTunnel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inward: Story = { args: { direction: "inward" } };

export const DenseBundle: Story = { args: { cables: 44, thickness: 0.2, pulseLength: 0.15 } };

export const FewThickCables: Story = { args: { cables: 8, thickness: 0.8, waviness: 0.8 } };

export const Straight: Story = { args: { waviness: 0 } };

export const AlternativeColors: Story = {
  args: { cableColor: "--info", pulseColor: "--success" },
};

export const Frozen: Story = { args: { speed: 0 } };

export const WithoutPointer: Story = { args: { pointer: false } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
