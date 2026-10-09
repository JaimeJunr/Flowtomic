import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { LikeButton } from "./like-button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/LikeButton",
  component: LikeButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Curtir com contador: o ícone encolhe até um ponto, troca para preenchido e volta com rebote; só o dígito que mudou rola.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "inline-radio", options: ["heart", "star", "thumb"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    showCount: { control: "boolean" },
    idleOutline: { control: "boolean" },
    disabled: { control: "boolean" },
    durationMs: { control: "number" },
    dotSize: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    overshoot: { control: { type: "range", min: 0, max: 4, step: 0.1 } },
    beat: { control: "number" },
    rollDurationMs: { control: "number" },
    label: { control: "text" },
  },
  args: {
    count: 1204,
    label: "Curtir o relatório mensal",
    onLikedChange: fn(),
  },
} satisfies Meta<typeof LikeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { count: 1204 },
};

export const Star: Story = {
  args: { icon: "star", label: "Favoritar a carteira", count: 87 },
};

export const Thumb: Story = {
  args: { icon: "thumb", label: "Aprovar a conciliação", count: 12 },
};

export const SemContagem: Story = {
  args: { showCount: false },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <LikeButton {...args} size="sm" />
      <LikeButton {...args} size="default" />
      <LikeButton {...args} size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <LikeButton {...args} />
    </MotionConfig>
  ),
};
