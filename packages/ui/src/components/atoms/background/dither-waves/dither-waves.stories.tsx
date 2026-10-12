import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { DitherWaves } from "./dither-waves";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Rendimento em ondas, sem ruído nenhum
      </h2>
      <p className="max-w-lg text-foreground">
        Veja a evolução da carteira em tempo real e saiba quando aportar sem abrir uma planilha.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Ver minha carteira
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/DitherWaves",
  component: DitherWaves,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de ondas de ruído suave desenhadas em pontilhado ordenado, com blocos de pixel visíveis. O mouse apaga as ondas por onde passa e, ao montar, a imagem começa em blocos grandes e fica nítida. Sem WebGL, mostra um pontilhado CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    pattern: { control: "inline-radio", options: ["bayer4", "bayer8", "lines"] },
    levels: { control: { type: "range", min: 2, max: 8, step: 1 } },
    pixelSize: { control: { type: "range", min: 1, max: 8, step: 1 } },
    scale: { control: { type: "range", min: 0.3, max: 3, step: 0.1 } },
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    contrast: { control: { type: "range", min: 0.5, max: 2, step: 0.1 } },
    pointer: { control: "boolean" },
  },
  render: (args) => (
    <div className="dark bg-background">
      <DitherWaves {...args} className="min-h-[480px]">
        <Hero />
      </DitherWaves>
    </div>
  ),
} satisfies Meta<typeof DitherWaves>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Bayer4: Story = { args: { pattern: "bayer4", pixelSize: 4, levels: 3 } };

export const Lines: Story = { args: { pattern: "lines", pixelSize: 3 } };

export const FineGrain: Story = { args: { pixelSize: 1, levels: 6, contrast: 1.4 } };

export const SuccessColor: Story = { args: { color: "--success", scale: 1.8 } };

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
