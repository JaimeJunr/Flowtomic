import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { WaveBarSlider } from "./wave-bar-slider";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/WaveBarSlider",
  component: WaveBarSlider,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Slider de barras verticais: as barras próximas à alça sobem numa esteira cuja altura segue a velocidade do arrasto.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    bars: { control: { type: "number", min: 4, max: 64 } },
    height: { control: "number" },
    restHeight: { control: "number" },
    sensitivity: { control: "number" },
    reach: { control: "number" },
    skew: { control: { type: "number", min: 0, max: 2, step: 0.1 } },
    step: { control: "number" },
    showValue: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { "aria-label": "Volume", className: "w-72" },
} satisfies Meta<typeof WaveBarSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComValor: Story = {
  args: {
    showValue: true,
    formatValue: (value) => `${value}%`,
    defaultValue: 62,
    className: "w-80",
  },
};

export const PassoGrande: Story = {
  args: { step: 10, showValue: true },
};

export const Simetrica: Story = {
  args: { skew: 0 },
};

export const PoucasBarras: Story = {
  args: { bars: 16 },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <WaveBarSlider {...args} />
    </MotionConfig>
  ),
};
