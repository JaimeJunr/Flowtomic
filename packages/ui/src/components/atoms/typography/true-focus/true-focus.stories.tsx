import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { TrueFocus } from "./true-focus";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/TrueFocus",
  component: TrueFocus,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Frase com uma palavra nítida e as demais borradas, envolvida por uma moldura de quatro cantos que desliza para a próxima. Pausa com hover, foco e fora da tela.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    sentence: { control: "text" },
    separator: { control: "text" },
    mode: { control: "inline-radio", options: ["auto", "hover"] },
    blurPx: { control: { type: "number", min: 0, max: 12 } },
    transitionMs: { control: "number" },
    holdMs: { control: "number" },
  },
} satisfies Meta<typeof TrueFocus>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display text-4xl font-semibold text-foreground";

export const Default: Story = {
  args: { sentence: "Concilie, aprove e feche o mês" },
  render: (args) => <TrueFocus {...args} className={headline} />,
};

export const SegueOMouse: Story = {
  args: { sentence: "Contas a pagar vencem em cinco dias", mode: "hover" },
  render: (args) => <TrueFocus {...args} className={headline} />,
};

export const SeparadorPersonalizado: Story = {
  args: {
    sentence: "Contas a pagar, Contas a receber, Fluxo de caixa",
    separator: ",",
    holdMs: 1800,
  },
  render: (args) => <TrueFocus {...args} className={headline} />,
};

export const BorraoForte: Story = {
  args: { sentence: "Saldo projetado para o trimestre", blurPx: 8, transitionMs: 700 },
  render: (args) => <TrueFocus {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { sentence: "Concilie, aprove e feche o mês" },
  render: (args) => <TrueFocus {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
