import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { FolderPicker } from "./folder-picker";

const NOTAS = [
  "Paleta mais quente",
  "Apertar o espaçamento",
  "Logo parece pequeno",
  "Adorei o novo hero",
];

const meta = {
  title: "Flowtomic UI/Molecules/Forms/FolderPicker",
  component: FolderPicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pasta de papel que solta as opções como pílulas flutuando acima dela. Depois de pousar elas boiam e podem ser arrastadas pela nuvem (sem colisão entre si).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    trigger: { control: "inline-radio", options: ["hover", "click"] },
    closeOnSelect: { control: "boolean" },
    float: { control: "boolean" },
    drift: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
    spread: { control: "number" },
    tilt: { control: "number" },
    openMs: { control: "number" },
    staggerMs: { control: "number" },
    bounce: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
  },
  args: {
    items: NOTAS,
    label: "Feedback de design",
    onSelect: fn(),
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-96 w-[28rem] items-end justify-center pb-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FolderPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Clique: Story = { args: { trigger: "click" } };

export const Parado: Story = { args: { float: false } };

export const MantemAberto: Story = { args: { trigger: "click", closeOnSelect: false } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <FolderPicker {...args} />
    </MotionConfig>
  ),
};
