import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { StretchSwitch } from "./stretch-switch";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/StretchSwitch",
  component: StretchSwitch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Interruptor cujo thumb corre numa mola e estica na direção do movimento. Pode ser arrastado: soltar depois do meio troca o estado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    speed: { control: { type: "range", min: 0, max: 100, step: 1 } },
    stretch: { control: { type: "range", min: 0, max: 100, step: 1 } },
    hoverScale: { control: "number" },
    colorDurationMs: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Modo avião",
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof StretchSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true, label: "Notificações por e-mail" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <StretchSwitch {...args} size="sm" label="Pequeno" />
      <StretchSwitch {...args} size="default" label="Padrão" />
      <StretchSwitch {...args} size="lg" label="Grande" />
    </div>
  ),
};

export const Lazy: Story = {
  args: { speed: 5, stretch: 80, label: "Mola preguiçosa" },
};

export const Snappy: Story = {
  args: { speed: 100, stretch: 20, label: "Mola firme" },
};

export const NoStretch: Story = {
  args: { stretch: 0, label: "Sem esticar" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true, label: "Sincronização desativada" },
};

export const WithoutLabel: Story = {
  args: { label: undefined, "aria-label": "Modo avião" },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <StretchSwitch {...args} label="Modo avião (movimento reduzido)" />
    </MotionConfig>
  ),
};
