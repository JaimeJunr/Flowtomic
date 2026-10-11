import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { SatinPlasma } from "./satin-plasma";

function Hero() {
  return (
    <div className="flex min-h-[480px] flex-col justify-end gap-4 p-10">
      <h2 className="max-w-xl text-4xl font-semibold text-foreground">
        Cada centavo da carteira, em movimento
      </h2>
      <p className="max-w-lg text-muted-foreground">
        Veja a evolução do patrimônio e das taxas de todas as suas contas, atualizada o dia todo.
      </p>
      <div>
        <button
          type="button"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Abrir meu painel
        </button>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Background/SatinPlasma",
  component: SatinPlasma,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fundo WebGL de dobras de luz acetinada em espiral lenta, com brilhos finos nas bordas. O mouse inclina o padrão. Sem WebGL, mostra um gradiente radial CSS. A cor é um token do tema.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    twist: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    softness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    shine: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    fade: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    pointer: { control: "boolean" },
  },
  // A raiz usa "dark" para o efeito ficar sobre escuro nos dois temas.
  render: (args) => (
    <SatinPlasma {...args} className="dark min-h-[480px] bg-background">
      <Hero />
    </SatinPlasma>
  ),
} satisfies Meta<typeof SatinPlasma>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StrongTwist: Story = { args: { twist: 2.5, speed: 1.5 } };

export const Misty: Story = { args: { softness: 1, shine: 0.4 } };

export const FadedEdges: Story = { args: { fade: 1, color: "--info" } };

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
