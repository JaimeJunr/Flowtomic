import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { FuzzyText } from "./fuzzy-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/FuzzyText",
  component: FuzzyText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Texto que treme como sinal de vídeo ruim: cada faixa de 1px é deslocada de forma aleatória. Leve em repouso, forte com o ponteiro em cima. Sem canvas 2D mostra o texto puro; com movimento reduzido desenha estático.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    baseIntensity: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    hoverIntensity: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    rangePx: { control: { type: "number", min: 0, max: 80 } },
    fps: { control: { type: "number", min: 1, max: 120 } },
    direction: { control: "inline-radio", options: ["horizontal", "vertical", "both"] },
    easeFrames: { control: { type: "number", min: 0, max: 60 } },
    hover: { control: "boolean" },
    clickBurst: { control: "boolean" },
    glitch: { control: "boolean" },
    glitchIntervalMs: { control: "number" },
    glitchDurationMs: { control: "number" },
  },
} satisfies Meta<typeof FuzzyText>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display text-7xl font-semibold text-foreground";

export const Default: Story = {
  args: { children: "Conciliação em atraso" },
  render: (args) => <FuzzyText {...args} className={headline} />,
};

export const ComEstouroNoClique: Story = {
  args: { children: "Pagamento recusado", clickBurst: true, hoverIntensity: 0.35 },
  render: (args) => <FuzzyText {...args} className={headline} />,
};

export const PicosPeriodicos: Story = {
  args: {
    children: "Saldo divergente",
    glitch: true,
    glitchIntervalMs: 1800,
    glitchDurationMs: 260,
  },
  render: (args) => <FuzzyText {...args} className={headline} />,
};

export const Vertical: Story = {
  args: { children: "Lote 4821", direction: "vertical", rangePx: 14 },
  render: (args) => <FuzzyText {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { children: "Conciliação em atraso" },
  render: (args) => <FuzzyText {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
