import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { TechText } from "./tech-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/TechText",
  component: TechText,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Logotipo de texto sólido que vira contorno tracejado sob o ponteiro, com moldura de seleção, etiqueta, letras arrastáveis (voltam com mola) e varredura automática sem ponteiro. Com movimento reduzido não há varredura nem mola; o reveal por ponteiro continua.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    maxFontSizePx: { control: { type: "number", min: 24, max: 240 } },
    letterSpacingEm: { control: { type: "number", min: -0.2, max: 0.4, step: 0.01 } },
    accentColor: { control: "text" },
    reveal: { control: "inline-radio", options: ["area", "letter", "off"] },
    reachPx: { control: { type: "number", min: 40, max: 500 } },
    softness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    lineStyle: { control: "inline-radio", options: ["dashed", "solid"] },
    dashPx: { control: { type: "number", min: 1, max: 16 } },
    gapPx: { control: { type: "number", min: 1, max: 16 } },
    strokeWidthPx: { control: { type: "number", min: 0.5, max: 6, step: 0.5 } },
    specks: { control: { type: "number", min: 0, max: 24 } },
    selection: { control: "boolean" },
    labels: { control: "boolean" },
    draggable: { control: "boolean" },
    sweep: { control: "boolean" },
    sweepSpeed: { control: { type: "number", min: 0.25, max: 4, step: 0.25 } },
  },
} satisfies Meta<typeof TechText>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display font-semibold text-foreground";

export const Default: Story = {
  args: { text: "Conciliação" },
  render: (args) => <TechText {...args} className={headline} />,
};

export const RevelaPorArea: Story = {
  args: { text: "Fluxo de caixa", reveal: "area", reachPx: 240, softness: 0.9 },
  render: (args) => <TechText {...args} className={headline} />,
};

export const ContornoContinuo: Story = {
  args: { text: "Tesouraria", lineStyle: "solid", strokeWidthPx: 2, specks: 0, labels: false },
  render: (args) => <TechText {...args} className={headline} />,
};

export const SempreSolido: Story = {
  args: { text: "Fechamento", reveal: "off", draggable: false, sweep: false },
  render: (args) => <TechText {...args} className={headline} />,
};

export const VarreduraRapida: Story = {
  args: { text: "Provisões", sweepSpeed: 2.5, specks: 14 },
  render: (args) => <TechText {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { text: "Conciliação" },
  render: (args) => <TechText {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
