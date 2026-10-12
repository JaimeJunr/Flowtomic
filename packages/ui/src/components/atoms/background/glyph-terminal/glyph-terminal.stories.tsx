import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { GlyphTerminal } from "./glyph-terminal";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        A mesa de operações nunca dorme
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Acompanhe ordens, cotas e liquidações em um único terminal, atualizado a cada segundo.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Abrir o terminal
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/GlyphTerminal",
  component: GlyphTerminal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de um terminal antigo com defeito: dígitos miúdos cujo brilho segue manchas de ruído, linhas de varredura, piscar, faixas que escorregam e vidro curvo. O mouse acende a região próxima. Sem WebGL, mostra linhas de varredura em CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    glyphSize: { control: { type: "range", min: 6, max: 32, step: 1 } },
    scanlines: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    glitch: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    flicker: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    curvature: { control: { type: "range", min: 0, max: 0.5, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  // A raiz usa "dark" para o efeito ficar sobre escuro nos dois temas.
  render: (args) => (
    <GlyphTerminal {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </GlyphTerminal>
  ),
} satisfies Meta<typeof GlyphTerminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargeGlyphs: Story = { args: { glyphSize: 24, scanlines: 0.5 } };

export const Faulty: Story = { args: { glitch: 2, flicker: 2, curvature: 0.4 } };

export const Clean: Story = { args: { glitch: 0, flicker: 0, curvature: 0, scanlines: 0.1 } };

export const AmberTint: Story = { args: { tint: "--warning" } };

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
