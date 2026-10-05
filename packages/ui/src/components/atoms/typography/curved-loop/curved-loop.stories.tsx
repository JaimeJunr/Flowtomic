import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { CurvedLoop } from "./curved-loop";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/CurvedLoop",
  component: CurvedLoop,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    speed: { control: { type: "number", min: 0, max: 300, step: 10 } },
    curve: { control: { type: "range", min: -300, max: 300, step: 10 } },
    direction: { control: "inline-radio", options: ["left", "right"] },
    draggable: { control: "boolean" },
  },
} satisfies Meta<typeof CurvedLoop>;

export default meta;
type Story = StoryObj<typeof meta>;

const TEXT = "Conciliação bancária automática • Fechamento mensal sem planilha •";

export const Default: Story = {
  args: {
    text: TEXT,
  },
  render: (args) => (
    <section className="flex min-h-[28rem] flex-col justify-center gap-2 bg-background py-16">
      <h2 className="px-8 text-center font-display text-3xl font-semibold text-foreground">
        Do extrato ao fechamento, no mesmo fluxo
      </h2>
      <CurvedLoop {...args} className="font-display font-semibold text-primary" />
    </section>
  ),
};

export const ArcoParaCima: Story = {
  args: {
    text: TEXT,
    curve: -140,
    direction: "right",
  },
  render: Default.render,
};

export const Reta: Story = {
  args: {
    text: TEXT,
    curve: 0,
    speed: 90,
  },
  render: Default.render,
};

export const SemArrasto: Story = {
  args: {
    text: TEXT,
    draggable: false,
  },
  render: Default.render,
};

export const ReducedMotion: Story = {
  args: {
    text: TEXT,
  },
  render: Default.render,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
