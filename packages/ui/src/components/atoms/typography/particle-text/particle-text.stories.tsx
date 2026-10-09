import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ParticleText } from "./particle-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/ParticleText",
  component: ParticleText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Nuvem de pontos que voa e se junta até formar a palavra. Formada, respira de leve e os pontos fogem do ponteiro. Com `trigger` o ciclo se repete no hover ou no clique. Sem canvas 2D mostra o texto puro; com movimento reduzido os pontos já nascem no lugar.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    particleSizePx: { control: { type: "number", min: 1, max: 6 } },
    density: { control: { type: "number", min: 2, max: 10 } },
    highlightColor: { control: "text" },
    scatterPx: { control: { type: "number", min: 0, max: 400 } },
    gatherMs: { control: "number" },
    staggerMs: { control: "number" },
    repelStrength: { control: { type: "number", min: 0, max: 120 } },
    repelRadiusPx: { control: { type: "number", min: 0, max: 300 } },
    idleDrift: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    trigger: { control: "inline-radio", options: ["mount", "hover", "click"] },
    glow: { control: "boolean" },
  },
} satisfies Meta<typeof ParticleText>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display text-8xl font-semibold text-foreground";

export const Default: Story = {
  args: { text: "Receita" },
  render: (args) => <ParticleText {...args} className={headline} />,
};

export const ReuneNoClique: Story = {
  args: { text: "Fechado", trigger: "click" },
  render: (args) => <ParticleText {...args} className={headline} />,
};

export const ReuneNoHover: Story = {
  args: { text: "Conciliado", trigger: "hover", gatherMs: 1100 },
  render: (args) => <ParticleText {...args} className={headline} />,
};

export const RepulsaoForte: Story = {
  args: { text: "Caixa", repelStrength: 90, repelRadiusPx: 180, idleDrift: 1 },
  render: (args) => <ParticleText {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { text: "Receita" },
  render: (args) => <ParticleText {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
