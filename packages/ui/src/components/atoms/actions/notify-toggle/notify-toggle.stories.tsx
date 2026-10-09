import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { NotifyToggle } from "./notify-toggle";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/NotifyToggle",
  component: NotifyToggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Liga e desliga avisos. Ao ligar, o sino balança pendurado pelo topo; a largura é fixa entre os dois rótulos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    ringAmplitude: { control: "number" },
    ringPasses: { control: "number" },
    ringDecay: { control: "number" },
    ringDurationMs: { control: "number" },
    ringPivot: { control: "number" },
    count: { control: "number" },
    showBadge: { control: "boolean" },
    waves: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    offLabel: "Avisar quando o relatório sair",
    onLabel: "Você será avisado",
    onPressedChange: fn(),
  },
} satisfies Meta<typeof NotifyToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function BadgeDemo() {
  const [count, setCount] = React.useState(2);
  return (
    <div className="flex flex-col items-center gap-4">
      <NotifyToggle defaultPressed count={count} offLabel="Avise-me" />
      <button
        type="button"
        className="text-sm text-muted-foreground underline"
        onClick={() => setCount((value) => value + 1)}
      >
        Chegou uma notificação
      </button>
    </div>
  );
}

export const WithBadge: Story = {
  render: () => <BadgeDemo />,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <NotifyToggle size="sm" offLabel="Avise-me" />
      <NotifyToggle size="default" offLabel="Avise-me" />
      <NotifyToggle size="lg" offLabel="Avise-me" />
    </div>
  ),
};

export const SemOndas: Story = {
  args: { waves: false },
};

export const Disabled: Story = {
  args: { disabled: true, defaultPressed: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <NotifyToggle {...args} />
    </MotionConfig>
  ),
};
