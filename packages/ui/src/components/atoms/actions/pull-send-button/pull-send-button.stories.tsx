import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { PullSendButton } from "./pull-send-button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/PullSendButton",
  component: PullSendButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Botão de enviar que se puxa como estilingue: passou do ponto de armar, soltar lança a mensagem. Enter envia, ou puxe e solte.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "number" },
    armAt: { control: "number" },
    maxPull: { control: "number" },
    recoil: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    flight: { control: "number" },
    particles: { control: "number" },
    spread: { control: "number" },
    axis: { control: "inline-radio", options: ["any", "horizontal", "vertical"] },
    tapSends: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { onSend: fn(), "aria-label": "Enviar mensagem" },
  decorators: [
    (Story) => (
      <div className="flex w-80 items-center gap-3 rounded-2xl border border-border bg-card p-3 text-card-foreground">
        <p className="flex-1 text-sm text-muted-foreground">Enter envia, ou puxe e solte</p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PullSendButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: { axis: "horizontal" },
};

export const SemParticulas: Story = {
  args: { particles: 0 },
};

export const ToqueNaoEnvia: Story = {
  args: { tapSends: false },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PullSendButton {...args} />
    </MotionConfig>
  ),
};
