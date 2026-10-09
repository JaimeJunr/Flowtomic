import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { ScrubNumberField } from "./scrub-number-field";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/ScrubNumberField",
  component: ScrubNumberField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Campo numérico que se edita arrastando. Shift acelera 10x, Alt desacelera 0,1x. Clicar sem mover abre a edição por teclado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    sensitivity: { control: "number" },
    rubberReach: { control: "number" },
    returnMs: { control: "number" },
    showDelta: { control: "boolean" },
    showDirty: { control: "boolean" },
    showFill: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Raio",
    suffix: "px",
    defaultValue: 24,
    min: 0,
    max: 100,
    onValueChange: fn(),
    onValueCommit: fn(),
  },
} satisfies Meta<typeof ScrubNumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Painel: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <ScrubNumberField {...args} label="Raio" suffix="px" defaultValue={24} />
      <ScrubNumberField {...args} label="Opacidade" suffix="%" defaultValue={80} />
      <ScrubNumberField
        {...args}
        label="Taxa"
        suffix="%"
        defaultValue={1.5}
        min={0}
        max={10}
        step={0.1}
      />
    </div>
  ),
};

export const Decimais: Story = {
  args: { label: "Taxa", suffix: "%", defaultValue: 1.5, min: 0, max: 10, step: 0.1 },
};

export const ComSujo: Story = {
  args: { showDirty: true },
};

export const SemPreenchimento: Story = {
  args: { showFill: false },
};

export const ParadaSeca: Story = {
  args: { rubberReach: 0 },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ScrubNumberField {...args} />
    </MotionConfig>
  ),
};
