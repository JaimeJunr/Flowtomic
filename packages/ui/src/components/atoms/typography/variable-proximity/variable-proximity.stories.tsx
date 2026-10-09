import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { VariableProximity } from "./variable-proximity";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/VariableProximity",
  component: VariableProximity,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Texto cujas letras engordam perto do ponteiro, numa bolha que acompanha o mouse. Exige fonte variável com eixo wght (Public Sans no tema). Sem animação autônoma, então continua ativo com movimento reduzido, só sem transição.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    fromWeight: { control: { type: "number", min: 100, max: 900, step: 50 } },
    toWeight: { control: { type: "number", min: 100, max: 900, step: 50 } },
    radiusPx: { control: { type: "number", min: 20, max: 300 } },
    falloff: { control: "inline-radio", options: ["linear", "exponential", "gaussian"] },
  },
} satisfies Meta<typeof VariableProximity>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display text-4xl font-semibold text-foreground";

export const Default: Story = {
  args: { text: "Fechamento de março sem pendências" },
  render: (args) => <VariableProximity {...args} className={headline} />,
};

export const BolhaLarga: Story = {
  args: { text: "Saldo consolidado das contas", radiusPx: 180, falloff: "gaussian" },
  render: (args) => <VariableProximity {...args} className={headline} />,
};

export const QuedaExponencial: Story = {
  args: { text: "Contas a pagar vencem em cinco dias", falloff: "exponential", toWeight: 900 },
  render: (args) => <VariableProximity {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { text: "Fechamento de março sem pendências" },
  render: (args) => <VariableProximity {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
