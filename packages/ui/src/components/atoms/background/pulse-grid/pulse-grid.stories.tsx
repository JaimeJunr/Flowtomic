import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { PulseGrid } from "./pulse-grid";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada lançamento no lugar certo
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Concilie extratos, boletos e rendimentos e veja o saldo do mês fechar sozinho.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Conciliar este mês
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/PulseGrid",
  component: PulseGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com uma grade fina. Ondas saem do centro de tempos em tempos, entortam a grade e acendem as linhas. O mouse deixa um rastro de ondinhas e o clique solta uma onda forte. Sem WebGL, mostra uma grade de CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["lines", "dots", "cross"] },
    cellSize: { control: { type: "range", min: 8, max: 200, step: 2 } },
    lineWidth: { control: { type: "range", min: 0.5, max: 4, step: 0.5 } },
    glow: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    rippleStrength: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    rippleSpeed: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
    rippleInterval: { control: { type: "range", min: 0, max: 10, step: 0.2 } },
    fade: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <PulseGrid {...args} className="min-h-[480px]">
        <Hero />
      </PulseGrid>
    </div>
  ),
} satisfies Meta<typeof PulseGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = { args: { color: "--primary", glow: 0.9 } };

export const Dots: Story = { args: { variant: "dots", cellSize: 32, lineWidth: 1.5 } };

export const Cross: Story = { args: { variant: "cross", cellSize: 64 } };

export const Dense: Story = { args: { cellSize: 20, rippleStrength: 0.6 } };

export const Strong: Story = { args: { rippleStrength: 2, rippleSpeed: 1.6, rippleInterval: 1.6 } };

export const NoAutomaticRipples: Story = { args: { rippleInterval: 0 } };

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
