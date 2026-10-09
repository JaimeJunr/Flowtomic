import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, BellOff } from "lucide-react";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { SwellChipGroup } from "./swell-chip-group";

const LEVELS = ["Desligado", "Baixo", "Médio", "Alto", "Máximo"];

const meta = {
  title: "Flowtomic UI/Atoms/Forms/SwellChipGroup",
  component: SwellChipGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Escolha única em chips: o escolhido incha como gelatina e os vizinhos abrem espaço em cascata.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    swell: { control: { type: "range", min: 0, max: 0.6, step: 0.05 } },
    push: { control: "number" },
    shrink: { control: { type: "range", min: 0, max: 0.2, step: 0.01 } },
    jelly: { control: { type: "range", min: 0, max: 1.5, step: 0.1 } },
    bounce: { control: { type: "range", min: 0, max: 0.6, step: 0.05 } },
    staggerMs: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    items: LEVELS,
    "aria-label": "Nível de alerta",
    onValueChange: fn(),
  },
} satisfies Meta<typeof SwellChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pequeno: Story = { args: { size: "sm" } };

export const Grande: Story = { args: { size: "lg" } };

export const ComIcones: Story = {
  args: {
    items: [
      { value: "off", label: "Desligado", icon: <BellOff className="size-4" /> },
      { value: "on", label: "Ligado", icon: <Bell className="size-4" /> },
    ],
  },
};

export const ItemDesabilitado: Story = {
  args: {
    items: [
      "Desligado",
      "Baixo",
      { value: "Médio", label: "Médio", disabled: true },
      "Alto",
      "Máximo",
    ],
  },
};

export const Desabilitado: Story = { args: { disabled: true } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <SwellChipGroup {...args} />
    </MotionConfig>
  ),
};
