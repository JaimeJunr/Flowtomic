import type { Meta, StoryObj } from "@storybook/react-vite";
import { Shield, Zap } from "lucide-react";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { ElasticSlider } from "./elastic-slider";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const meta = {
  title: "Flowtomic UI/Atoms/Forms/ElasticSlider",
  component: ElasticSlider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    defaultValue: { control: "number" },
  },
} satisfies Meta<typeof ElasticSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Aporte mensal",
    min: 0,
    max: 5000,
    step: 100,
    defaultValue: 1500,
    formatValue: brl,
  },
};

export const ToleranciaARisco: Story = {
  args: {
    "aria-label": "Tolerância a risco",
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 4,
    startIcon: <Shield className="size-4" />,
    endIcon: <Zap className="size-4" />,
  },
};

export const Controlled: Story = {
  args: { "aria-label": "Meta de reserva de emergência" },
  render: (args) => {
    const [value, setValue] = useState(30);
    return (
      <div className="flex flex-col items-center gap-3">
        <ElasticSlider
          {...args}
          value={value}
          onValueChange={setValue}
          formatValue={(v) => `${Math.round(v)}% da meta`}
        />
        <button
          type="button"
          className="text-sm text-muted-foreground underline"
          onClick={() => setValue(100)}
        >
          Atingir a meta
        </button>
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  args: {
    "aria-label": "Aporte mensal",
    min: 0,
    max: 5000,
    step: 100,
    defaultValue: 1500,
    formatValue: brl,
  },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ElasticSlider {...args} />
    </MotionConfig>
  ),
};
