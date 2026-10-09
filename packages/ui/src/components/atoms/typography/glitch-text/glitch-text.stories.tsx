import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { GlitchText } from "./glitch-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/GlitchText",
  component: GlitchText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Texto com interferência digital: duas cópias coloridas aparecem em faixas que pulam de altura. Com movimento reduzido, fica só o texto.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    durationMs: { control: { type: "number", min: 400, step: 100 } },
    chromatic: { control: "boolean" },
    trigger: { control: "inline-radio", options: ["always", "hover"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof GlitchText>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display text-4xl font-semibold text-foreground";

export const Default: Story = {
  args: { children: "Conciliação com divergência" },
  render: (args) => <GlitchText {...args} className={headline} />,
};

export const AoPassarOMouse: Story = {
  args: { children: "Lote 4821 rejeitado pelo banco", trigger: "hover" },
  render: (args) => (
    <GlitchText {...args} tabIndex={0} className={`${headline} text-destructive`} />
  ),
};

export const SemSombraColorida: Story = {
  args: { children: "Fechamento de março em atraso", chromatic: false },
  render: (args) => <GlitchText {...args} className={headline} />,
};

export const CicloLento: Story = {
  args: { children: "Saldo não confere com o extrato", durationMs: 4500 },
  render: (args) => <GlitchText {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { children: "Conciliação com divergência" },
  render: (args) => <GlitchText {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
