import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { LiftRating } from "./lift-rating";

const LABELS = ["Ruim", "Fraco", "Ok", "Bom", "Ótimo"];

const meta = {
  title: "Flowtomic UI/Atoms/Forms/LiftRating",
  component: LiftRating,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Nota de 1 a N. Ao passar o ponteiro, as estrelas acendem e sobem, e um balão mostra o rótulo. Clicar na nota atual limpa.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    shape: { control: "inline-radio", options: ["star", "heart", "bolt"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    count: { control: "number" },
    lift: { control: "number" },
    magnify: { control: "number" },
    popScale: { control: "number" },
    riseMs: { control: "number" },
    showTip: { control: "boolean" },
    allowClear: { control: "boolean" },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    "aria-label": "Avaliação do atendimento",
    onValueChange: fn(),
    onPreview: fn(),
  },
} satisfies Meta<typeof LiftRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComRotulos: Story = {
  args: { labels: LABELS, defaultValue: 4 },
};

export const Heart: Story = {
  args: { shape: "heart", labels: LABELS },
};

export const Bolt: Story = {
  args: { shape: "bolt", labels: LABELS },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      <LiftRating {...args} size="sm" defaultValue={3} />
      <LiftRating {...args} size="default" defaultValue={3} />
      <LiftRating {...args} size="lg" defaultValue={3} />
    </div>
  ),
};

export const SomenteLeitura: Story = {
  args: { readOnly: true, defaultValue: 3 },
};

export const Desabilitado: Story = {
  args: { disabled: true, defaultValue: 2 },
};

export const ReducedMotion: Story = {
  args: { labels: LABELS },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <LiftRating {...args} />
    </MotionConfig>
  ),
};
