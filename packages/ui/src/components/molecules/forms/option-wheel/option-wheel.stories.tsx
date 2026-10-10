import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { OptionWheel } from "./option-wheel";

const PERIODS = ["Diário", "Semanal", "Quinzenal", "Mensal", "Trimestral", "Anual"];
const PROFILES = ["Conservador", "Moderado", "Arrojado", "Agressivo"];

const meta = {
  title: "Flowtomic UI/Molecules/Forms/OptionWheel",
  component: OptionWheel,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Seletor de uma opção em roda: a escolhida fica acesa e as vizinhas se curvam, desfocam e apagam. Gira por roda do mouse, arraste ou teclado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right"] },
    fontSize: { control: { type: "number", min: 1, max: 5, step: 0.25 } },
    spacing: { control: { type: "number", min: 1, max: 2.5, step: 0.1 } },
    curve: { control: { type: "number", min: 0, max: 2, step: 0.1 } },
    tilt: { control: { type: "number", min: 0, max: 15, step: 1 } },
    blur: { control: { type: "number", min: 0, max: 6, step: 0.5 } },
    fade: { control: { type: "number", min: 0, max: 0.5, step: 0.05 } },
    minOpacity: { control: { type: "number", min: 0, max: 1, step: 0.05 } },
    smoothing: { control: { type: "number", min: 50, max: 800, step: 10 } },
    inset: { control: { type: "number", min: 0, max: 200, step: 10 } },
    loop: { control: "boolean" },
    draggable: { control: "boolean" },
  },
  args: {
    options: PERIODS,
    "aria-label": "Periodicidade do relatório",
    className: "h-96 w-[28rem] border border-border bg-card",
    onValueChange: fn(),
  },
} satisfies Meta<typeof OptionWheel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BordaDireita: Story = {
  args: { side: "right", options: PROFILES, "aria-label": "Perfil de investidor" },
};

export const ComLoop: Story = {
  args: { loop: true, defaultValue: 2 },
};

export const CurvaFechada: Story = {
  args: { curve: 1.6, tilt: 10, blur: 3, fade: 0.3 },
};

export const ListaReta: Story = {
  args: { curve: 0, tilt: 0, blur: 1, fade: 0.2 },
};

export const Controlado: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(3);
    return (
      <div className="flex flex-col items-start gap-3">
        <OptionWheel {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground">
          Relatório enviado: <span className="font-medium text-foreground">{PERIODS[value]}</span>
        </p>
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <OptionWheel {...args} />
    </MotionConfig>
  ),
};
