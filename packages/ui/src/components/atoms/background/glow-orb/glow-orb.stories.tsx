import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { GlowOrb } from "./glow-orb";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 p-10 text-center">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Sua carteira inteira em um só lugar
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Acompanhe ações, fundos e renda fixa com rentabilidade consolidada e sem planilhas.
      </p>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Conectar minha corretora
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/GlowOrb",
  component: GlowOrb,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com um anel de luz que respira, duas cores girando e uma luz que percorre o anel deixando cauda. O mouse estica e acende o anel na direção do ponteiro e o clique faz o anel pulsar. Sem WebGL, mostra um anel em gradiente CSS. As cores são tokens do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "range", min: 0.2, max: 1.5, step: 0.05 } },
    glow: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    wobble: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    highlight: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    trail: { control: { type: "range", min: 0, max: 2, step: 0.05 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <GlowOrb {...args} className="min-h-[480px]">
        <Hero />
      </GlowOrb>
    </div>
  ),
} satisfies Meta<typeof GlowOrb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SoftAndWide: Story = { args: { size: 1.3, glow: 1.8, highlight: 0.5 } };

export const SmallAndSharp: Story = { args: { size: 0.5, glow: 0.4, wobble: 0.3 } };

export const LongTrail: Story = { args: { highlight: 1.6, trail: 2 } };

export const AlternativeColors: Story = {
  args: { colors: ["--success", "--info", "--warning"] },
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
