import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Button } from "../../actions/button";
import { CountUp } from "./count-up";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/CountUp",
  component: CountUp,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    to: { control: "number" },
    from: { control: "number" },
    durationMs: { control: "number" },
    delayMs: { control: "number" },
    decimalPlaces: { control: "number" },
    locale: { control: "text" },
    start: { control: "boolean" },
  },
} satisfies Meta<typeof CountUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    to: 1284500,
    className: "font-display text-5xl font-semibold text-foreground",
  },
};

export const Moeda: Story = {
  args: {
    to: 48230.9,
    decimalPlaces: 2,
    formatOptions: { style: "currency", currency: "BRL" },
    className: "font-display text-4xl font-semibold text-foreground",
  },
};

export const Porcentagem: Story = {
  args: {
    to: 0.874,
    decimalPlaces: 1,
    formatOptions: { style: "percent" },
    className: "font-display text-4xl font-semibold text-success",
  },
};

export const ParaBaixo: Story = {
  args: {
    from: 320,
    to: 12,
    className: "font-display text-4xl font-semibold text-foreground",
  },
};

export const ComPortao: Story = {
  args: {
    to: 3480,
    className: "font-display text-4xl font-semibold text-foreground",
  },
  render: (args) => {
    const [started, setStarted] = useState(false);
    return (
      <div className="flex flex-col items-center gap-6">
        <CountUp {...args} start={started} />
        <Button variant="outline" onClick={() => setStarted(true)}>
          Iniciar contagem
        </Button>
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  args: {
    to: 1284500,
    className: "font-display text-4xl font-semibold text-foreground",
  },
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
