import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { LightningBolts } from "./lightning-bolts";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-end gap-4 p-10 text-center">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Reaja ao mercado no instante em que ele muda
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Alertas de preço e de risco chegam em segundos, direto no painel da sua carteira.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Ativar alertas da carteira
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/LightningBolts",
  component: LightningBolts,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com raios que descem do alto: caminho em zigue-zague que rasteja, galhos que piscam e clarões curtos. O mouse puxa os raios e o clique chama um raio que cai no ponto. Sem WebGL, mostra um fio de gradiente CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    bolts: { control: { type: "range", min: 1, max: 4, step: 1 } },
    spread: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    branches: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    angle: { control: { type: "range", min: -60, max: 60, step: 1 } },
    thickness: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    glow: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    flicker: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <LightningBolts {...args} className="min-h-[480px]">
        <Hero />
      </LightningBolts>
    </div>
  ),
} satisfies Meta<typeof LightningBolts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Storm: Story = { args: { bolts: 3, spread: 0.8, branches: 0.9, flicker: 0.9 } };

export const Tilted: Story = { args: { angle: 20, bolts: 2, thickness: 1.5 } };

export const SoftGlow: Story = { args: { glow: 2, thickness: 0.6, flicker: 0.2 } };

export const AlternativeColor: Story = { args: { color: "--warning" } };

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
