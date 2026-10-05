import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Button } from "../../actions/button";
import { RotatingText } from "./rotating-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/RotatingText",
  component: RotatingText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    intervalMs: { control: "number" },
    splitBy: { control: "inline-radio", options: ["character", "word", "none"] },
    staggerMs: { control: "number" },
    staggerFrom: { control: "inline-radio", options: ["first", "last", "center"] },
    loop: { control: "boolean" },
    auto: { control: "boolean" },
  },
} satisfies Meta<typeof RotatingText>;

export default meta;
type Story = StoryObj<typeof meta>;

const WORDS = ["análises", "relatórios", "alertas"];

export const Default: Story = {
  args: {
    words: WORDS,
    className: "text-primary",
  },
  render: (args) => (
    <p className="font-display text-3xl font-semibold text-foreground">
      Acompanhe <RotatingText {...args} /> em tempo real
    </p>
  ),
};

export const DoCentro: Story = {
  args: {
    words: WORDS,
    staggerFrom: "center",
    className: "text-primary",
  },
  render: Default.render,
};

export const PorPalavra: Story = {
  args: {
    words: ["contas a pagar", "contas a receber", "fluxo de caixa"],
    splitBy: "word",
    intervalMs: 2500,
    className: "text-primary",
  },
  render: (args) => (
    <p className="font-display text-3xl font-semibold text-foreground">
      Concilie <RotatingText {...args} /> sem planilha
    </p>
  ),
};

export const ParaNaUltima: Story = {
  args: {
    words: ["importando", "validando", "pronto"],
    loop: false,
    className: "text-primary",
  },
  render: (args) => (
    <p className="font-display text-3xl font-semibold text-foreground">
      Extrato: <RotatingText {...args} />
    </p>
  ),
};

export const Controlado: Story = {
  args: {
    words: WORDS,
    auto: false,
    className: "text-primary",
  },
  render: (args) => {
    const [index, setIndex] = useState(0);
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="font-display text-3xl font-semibold text-foreground">
          Acompanhe <RotatingText {...args} activeIndex={index} /> em tempo real
        </p>
        <Button
          variant="outline"
          onClick={() => setIndex((current) => (current + 1) % WORDS.length)}
        >
          Próxima palavra
        </Button>
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  args: {
    words: WORDS,
    className: "text-primary",
  },
  render: Default.render,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
