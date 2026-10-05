import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { SplitFlapText } from "./split-flap-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/SplitFlapText",
  component: SplitFlapText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Painel de plaquinhas que viram letra por letra até a frase certa. O fundo é escuro nos dois temas. Pausa com hover, foco e fora da tela.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    flipMs: { control: "number" },
    staggerMs: { control: "number" },
    holdMs: { control: "number" },
    charset: { control: "inline-radio", options: ["alpha", "alphanumeric", "numeric"] },
    flipsPerChar: { control: { type: "number", min: 0, max: 20 } },
    padTo: { control: "number" },
    loop: { control: "boolean" },
  },
} satisfies Meta<typeof SplitFlapText>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUS = ["Conciliado", "Em análise", "Pendente", "Rejeitado"];

export const Default: Story = {
  args: { words: STATUS, className: "text-3xl" },
};

export const FraseUnica: Story = {
  args: { text: "Fechamento 03", className: "text-3xl" },
};

export const SoNumeros: Story = {
  args: {
    words: ["R$ 12480", "R$ 12510", "R$ 12395"],
    charset: "numeric",
    className: "text-3xl",
  },
};

export const ParaNaUltima: Story = {
  args: { words: ["Importando", "Validando", "Concluído"], loop: false, className: "text-3xl" },
};

export const VirandoMaisRapido: Story = {
  args: { words: STATUS, flipMs: 70, staggerMs: 25, flipsPerChar: 3, className: "text-3xl" },
};

export const ReducedMotion: Story = {
  args: { words: STATUS, className: "text-3xl" },
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
