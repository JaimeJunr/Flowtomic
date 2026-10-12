import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { PrismGlow } from "./prism-glow";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada taxa, decomposta em cores
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Separe rendimento, custo e imposto de cada aplicação e veja o que realmente sobra.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Abrir a decomposição
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/PrismGlow",
  component: PrismGlow,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL com a silhueta de um prisma de luz, faixas de espectro que se mexem devagar e uma linha de luz na base. O mouse inclina o prisma. Sem WebGL, mostra um gradiente radial CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    glow: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    bands: { control: { type: "range", min: 0.5, max: 4, step: 0.1 } },
    height: { control: { type: "range", min: 0.3, max: 1, step: 0.05 } },
    noise: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  // A raiz usa "dark" para o efeito ficar sobre escuro nos dois temas.
  render: (args) => (
    <PrismGlow {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </PrismGlow>
  ),
} satisfies Meta<typeof PrismGlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TallPrism: Story = { args: { height: 1, bands: 2.5 } };

export const StrongBeam: Story = { args: { glow: 1.8, noise: 0.2 } };

export const InfoTint: Story = { args: { tint: "--info", height: 0.45 } };

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
