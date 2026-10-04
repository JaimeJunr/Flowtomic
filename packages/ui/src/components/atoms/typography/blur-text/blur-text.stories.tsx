import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Button } from "../../actions/button";
import { BlurText } from "./blur-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/BlurText",
  component: BlurText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    splitBy: { control: "inline-radio", options: ["word", "letter"] },
    from: { control: "inline-radio", options: ["above", "below"] },
    staggerMs: { control: "number" },
    durationMs: { control: "number" },
    as: { control: "select", options: ["p", "span", "h1", "h2", "h3", "h4"] },
  },
} satisfies Meta<typeof BlurText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Seu painel agora atualiza sozinho",
    className: "font-display text-3xl font-semibold text-foreground",
  },
};

export const PorLetra: Story = {
  args: {
    text: "Relatório fechado às seis da manhã",
    splitBy: "letter",
    as: "h1",
    className: "font-display text-4xl font-semibold text-foreground",
  },
};

export const DeBaixo: Story = {
  args: {
    text: "A exportação em CSV agora respeita os filtros aplicados na tabela, inclusive os de data.",
    from: "below",
    className: "max-w-md text-base text-muted-foreground",
  },
};

export const Replay: Story = {
  args: {
    text: "Cada alteração fica registrada no histórico",
    className: "font-display text-2xl font-semibold text-foreground",
  },
  render: (args) => {
    const [run, setRun] = useState(0);
    return (
      <div className="flex flex-col items-center gap-6">
        <BlurText key={run} {...args} />
        <Button variant="outline" onClick={() => setRun((current) => current + 1)}>
          Repetir animação
        </Button>
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  args: {
    text: "Com movimento reduzido o texto já aparece pronto",
    className: "font-display text-2xl font-semibold text-foreground",
  },
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
