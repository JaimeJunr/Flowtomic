import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { FadeInView } from "./fade-in-view";

function SummaryCard() {
  return (
    <div className="w-80 rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">Rentabilidade em 12 meses</p>
      <p className="font-mono text-3xl font-semibold">+11,4%</p>
      <p className="mt-2 text-xs text-muted-foreground">Carteira Atlas, acima do CDI em 2,1 p.p.</p>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/FadeInView",
  component: FadeInView,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Revela o conteúdo com um fade (e desfoque opcional) quando ele entra na tela. Pode sumir sozinho depois de alguns segundos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    blur: { control: "boolean" },
    duration: { control: { type: "number", min: 0, step: 0.1 } },
    delay: { control: { type: "number", min: 0, step: 0.1 } },
    ease: { control: "select", options: ["linear", "easeIn", "easeOut", "easeInOut"] },
    threshold: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    initialOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    disappearAfter: { control: { type: "number", min: 0, step: 0.5 } },
    once: { control: "boolean" },
  },
  args: { children: <SummaryCard /> },
} satisfies Meta<typeof FadeInView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComDesfoque: Story = {
  args: { blur: true, duration: 1.2 },
};

export const ComAtraso: Story = {
  args: { delay: 0.6, ease: "easeInOut" },
};

export const AvisoQueSome: Story = {
  args: {
    disappearAfter: 3,
    children: (
      <div className="w-80 rounded-lg border border-border bg-card p-4 text-sm">
        Transferência de R$ 15.000,00 agendada para amanhã, às 10h.
      </div>
    ),
  },
};

export const RepetePorEntrada: Story = {
  args: { once: false, blur: true },
};

export const ReducedMotion: Story = {
  args: { blur: true },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <FadeInView {...args} />
    </MotionConfig>
  ),
};
