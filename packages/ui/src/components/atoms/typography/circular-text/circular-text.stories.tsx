import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkles } from "lucide-react";
import { MotionConfig } from "motion/react";
import { CircularText } from "./circular-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/CircularText",
  component: CircularText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    size: { control: "number" },
    durationMs: { control: "number" },
    onHover: { control: "inline-radio", options: ["none", "slow", "fast", "pause"] },
  },
} satisfies Meta<typeof CircularText>;

export default meta;
type Story = StoryObj<typeof meta>;

const BADGE = "relatórios · novo · desde 2024 · ";

export const Default: Story = {
  args: {
    text: BADGE,
    className: "font-display text-sm font-semibold uppercase text-foreground",
    children: <Sparkles aria-hidden="true" className="size-8 text-primary" />,
  },
};

export const PausaNoHover: Story = {
  args: {
    text: "relatório trimestral · carteira em dia · ",
    size: 200,
    onHover: "pause",
    className: "font-display text-sm font-semibold text-foreground",
    children: <Sparkles aria-hidden="true" className="size-10 text-primary" />,
  },
};

export const AceleraNoHover: Story = {
  args: {
    text: "carteira em dia · fechamento · ",
    onHover: "fast",
    durationMs: 14000,
    className: "font-display text-sm font-semibold text-muted-foreground",
  },
};

export const ReducedMotion: Story = {
  args: {
    text: BADGE,
    className: "font-display text-sm font-semibold uppercase text-foreground",
    children: <Sparkles aria-hidden="true" className="size-8 text-primary" />,
  },
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
