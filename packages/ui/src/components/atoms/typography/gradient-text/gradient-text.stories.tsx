import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { GradientText } from "./gradient-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/GradientText",
  component: GradientText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "O componente não garante contraste: ao passar `colors`, confira cada cor contra o fundo, porque o degradê passa por todas.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    direction: { control: "inline-radio", options: ["horizontal", "vertical", "diagonal"] },
    durationMs: { control: "number" },
    yoyo: { control: "boolean" },
    pauseOnHover: { control: "boolean" },
    bordered: { control: "boolean" },
  },
} satisfies Meta<typeof GradientText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "fechamento automático",
    className: "font-display text-4xl font-semibold",
  },
  render: (args) => (
    <h2 className="font-display text-4xl font-semibold text-foreground">
      Concilie o mês com <GradientText {...args} />
    </h2>
  ),
};

export const Diagonal: Story = {
  args: {
    children: "carteira consolidada",
    direction: "diagonal",
    className: "font-display text-4xl font-semibold",
  },
};

export const SemVaiEVolta: Story = {
  args: {
    children: "retorno acumulado",
    yoyo: false,
    durationMs: 5000,
    className: "font-display text-3xl font-semibold",
  },
};

export const ComMoldura: Story = {
  args: {
    children: "Novo: relatório de risco",
    bordered: true,
    className: "text-sm font-medium",
  },
};

export const PausaNoHover: Story = {
  args: {
    children: "passe o mouse para congelar",
    pauseOnHover: true,
    className: "font-display text-3xl font-semibold",
  },
};

export const ReducedMotion: Story = {
  args: {
    children: "degradê parado",
    className: "font-display text-3xl font-semibold",
  },
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
