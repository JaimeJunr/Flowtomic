import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { GlidePicker } from "./glide-picker";

const FORMATOS = [
  { value: "png", label: "PNG", tag: "imagem" },
  { value: "svg", label: "SVG", tag: "vetor" },
  { value: "pdf", label: "PDF", tag: "documento" },
  { value: "csv", label: "CSV", tag: "planilha" },
];

const meta = {
  title: "Flowtomic UI/Molecules/Forms/GlidePicker",
  component: GlidePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Seletor compacto: o menu cresce do canto do chip e a pílula de destaque desliza entre as linhas, seguindo ponteiro e teclado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    side: { control: "inline-radio", options: ["top", "bottom"] },
    align: { control: "inline-radio", options: ["start", "end"] },
    popMs: { control: "number" },
    glideMs: { control: "number" },
    menuWidth: { control: "number" },
    showTags: { control: "boolean" },
    rememberPosition: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    options: FORMATOS,
    defaultValue: "png",
    "aria-label": "Formato de exportação",
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-64 w-72 items-start justify-center pt-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlidePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SemEtiquetas: Story = { args: { showTags: false } };

export const Placeholder: Story = {
  args: { defaultValue: undefined, placeholder: "Escolher formato…" },
};

export const Pequeno: Story = { args: { size: "sm" } };

export const Grande: Story = { args: { size: "lg" } };

export const AlinhadoAoFim: Story = {
  args: { align: "end" },
  decorators: [
    (Story) => (
      <div className="flex w-64 justify-end">
        <Story />
      </div>
    ),
  ],
};

export const HoverComum: Story = { args: { glideMs: 0 } };

export const Disabled: Story = { args: { disabled: true } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <GlidePicker {...args} />
    </MotionConfig>
  ),
};
