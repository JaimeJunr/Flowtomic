import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { EchoText } from "./echo-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/EchoText",
  component: EchoText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Texto nítido com ecos fantasmas atrás. Na entrada os ecos se juntam atrás do texto; com o ponteiro perto, eles fogem dele e os mais fundos demoram mais a acompanhar. O loop só roda com movimento e área visível. Com movimento reduzido sobra só o texto da frente.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    echoes: { control: { type: "number", min: 0, max: 24 } },
    lag: { control: { type: "number", min: 0, max: 0.95, step: 0.05 } },
    offsetPx: { control: { type: "number", min: 0, max: 120 } },
    direction: {
      control: "inline-radio",
      options: ["right", "left", "up", "down", "diagonal"],
    },
    fade: { control: { type: "number", min: 0.3, max: 0.95, step: 0.01 } },
    blurPx: { control: { type: "number", min: 0, max: 12 } },
    mode: { control: "inline-radio", options: ["entrance", "pointer", "both"] },
    pointerRadiusPx: { control: { type: "number", min: 80, max: 800 } },
    durationMs: { control: { type: "number", min: 100, max: 3000, step: 100 } },
  },
} satisfies Meta<typeof EchoText>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display text-6xl font-semibold text-foreground";

export const Default: Story = {
  args: { text: "Receita recorrente" },
  render: (args) => <EchoText {...args} className={headline} />,
};

export const SoNaEntrada: Story = {
  args: { text: "Fluxo de caixa", mode: "entrance", direction: "left", echoes: 14 },
  render: (args) => <EchoText {...args} className={headline} />,
};

export const SoComPonteiro: Story = {
  args: { text: "Contas a pagar", mode: "pointer", lag: 0.4, offsetPx: 56 },
  render: (args) => <EchoText {...args} className={headline} />,
};

export const EcosNaCorDoTexto: Story = {
  args: { text: "Saldo projetado", tint: false, direction: "diagonal", blurPx: 5 },
  render: (args) => <EchoText {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { text: "Receita recorrente" },
  render: (args) => <EchoText {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
