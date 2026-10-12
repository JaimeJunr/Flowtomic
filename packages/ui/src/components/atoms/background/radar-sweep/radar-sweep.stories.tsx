import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { RadarSweep } from "./radar-sweep";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 p-10 text-center">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada posição da carteira no radar
      </h2>
      <p className="max-w-lg text-muted-foreground">
        O monitor varre limites, enquadramento e concentração e acende o que se afastou do mandato.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Ver alertas de hoje
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/RadarSweep",
  component: RadarSweep,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de uma tela de radar: anéis de distância, linhas de rumo e marcas na borda. Um feixe gira com rastro que esmaece e acende contatos e retornos esparsos; no modo pulse, anéis de sonar saem do centro. O mouse acende a grade por perto e vira um contato. Sem WebGL, mostra anéis concentricos em CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "inline-radio", options: ["sweep", "pulse"] },
    speed: { control: { type: "range", min: -3, max: 3, step: 0.1 } },
    trail: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    scale: { control: { type: "range", min: 0.2, max: 1.5, step: 0.05 } },
    rings: { control: { type: "range", min: 1, max: 12, step: 1 } },
    spokes: { control: { type: "range", min: 0, max: 36, step: 1 } },
    targets: { control: { type: "range", min: 0, max: 16, step: 1 } },
    clutter: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <RadarSweep {...args} className="min-h-[480px]">
        <Hero />
      </RadarSweep>
    </div>
  ),
} satisfies Meta<typeof RadarSweep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pulse: Story = { args: { mode: "pulse", speed: 0.8 } };

export const CounterClockwise: Story = { args: { speed: -1 } };

export const LongTrail: Story = { args: { trail: 1, targets: 10, clutter: 0.6 } };

export const DenseGrid: Story = { args: { rings: 10, spokes: 24, scale: 1.1 } };

export const Minimal: Story = { args: { rings: 3, spokes: 0, targets: 3, clutter: 0 } };

export const AlternativeColor: Story = { args: { color: "--info" } };

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
