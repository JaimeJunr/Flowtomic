import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { TrailDial } from "./trail-dial";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/TrailDial",
  component: TrailDial,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Mostrador circular: arraste em volta para mudar o valor. Em giro rápido a conta deixa uma cauda de cometa, e soltar deixa o valor seguir pela inércia antes de assentar numa mola. Clicar no arco leva o valor até lá.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    unit: { control: "text" },
    size: { control: { type: "range", min: 100, max: 320, step: 10 } },
    sweep: { control: { type: "range", min: 90, max: 360, step: 10 } },
    thickness: { control: { type: "range", min: 2, max: 16, step: 1 } },
    speed: { control: { type: "range", min: 0, max: 100, step: 1 } },
    tapBounce: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    flickBounce: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    momentum: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    cometReach: { control: { type: "range", min: 0, max: 360, step: 10 } },
    cometWidth: { control: { type: "range", min: 0, max: 24, step: 1 } },
    disabled: { control: "boolean" },
  },
  args: {
    "aria-label": "Meta de alocação",
    defaultValue: 62,
    onValueChange: fn(),
    onValueCommit: fn(),
  },
} satisfies Meta<typeof TrailDial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SemUnidade: Story = {
  args: { unit: "", "aria-label": "Volume", defaultValue: 35 },
};

export const ArcoCompleto: Story = {
  args: { sweep: 360, defaultValue: 75 },
};

export const Pequeno: Story = {
  args: { size: 140, thickness: 5, cometWidth: 6 },
};

export const SemInercia: Story = {
  args: { momentum: 0 },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <TrailDial {...args} />
    </MotionConfig>
  ),
};
