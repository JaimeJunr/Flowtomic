import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { Button } from "@/components/atoms/actions/button";
import { LiquidGauge } from "./liquid-gauge";

const meta = {
  title: "Flowtomic UI/Atoms/DataDisplay/LiquidGauge",
  component: LiquidGauge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Tanque de vidro com líquido que corre até o nível com inércia: a superfície inclina com a velocidade e balança antes de assentar. O número troca de cor exatamente onde a superfície passa. Com `interactive`, clicar ou arrastar define o nível e as setas ajustam.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    interactive: { control: "boolean" },
    showValue: { control: "boolean" },
    disabled: { control: "boolean" },
    ticks: { control: "number" },
    viscosity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    tilt: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    splash: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    unit: { control: "text" },
  },
  args: {
    defaultValue: 60,
    "aria-label": "Caixa disponível",
    onValueChange: fn(),
  },
} satisfies Meta<typeof LiquidGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interativo: Story = {
  args: { interactive: true, "aria-label": "Uso da cota" },
};

const LEVELS = [
  { label: "Vazio", value: 0 },
  { label: "25", value: 25 },
  { label: "60", value: 60 },
  { label: "Cheio", value: 100 },
];

function NiveisDemo() {
  const [value, setValue] = React.useState(60);
  return (
    <div className="flex items-center gap-6">
      <LiquidGauge value={value} onValueChange={setValue} aria-label="Caixa disponível" />
      <div className="flex flex-col gap-2">
        {LEVELS.map((level) => (
          <Button
            key={level.label}
            size="sm"
            variant="outline"
            onClick={() => setValue(level.value)}
          >
            {level.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const Niveis: Story = {
  render: () => <NiveisDemo />,
};

export const Rigido: Story = {
  args: { viscosity: 0, interactive: true, "aria-label": "Uso da cota" },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      <LiquidGauge {...args} size="sm" />
      <LiquidGauge {...args} size="default" />
      <LiquidGauge {...args} size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { interactive: true, disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <LiquidGauge {...args} interactive />
    </MotionConfig>
  ),
};
