import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { ElasticSegment } from "./elastic-segment";

const PERIODOS = ["Dia", "Semana", "Mês", "Ano"];

const meta = {
  title: "Flowtomic UI/Atoms/Forms/ElasticSegment",
  component: ElasticSegment,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Controle segmentado com thumb elástico: estica cobrindo o segmento antigo e o novo, achata ao chegar e pode ser arrastado e lançado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    equalSlots: { control: "boolean" },
    stretch: { control: { type: "range", min: 0, max: 100, step: 5 } },
    squash: { control: { type: "range", min: 0, max: 12, step: 1 } },
    speed: { control: { type: "range", min: 0.1, max: 2, step: 0.05 } },
    glide: { control: { type: "range", min: 0, max: 100, step: 5 } },
    draggable: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    items: PERIODOS,
    "aria-label": "Período do relatório",
    onValueChange: fn(),
  },
} satisfies Meta<typeof ElasticSegment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LarguraLivre: Story = {
  args: { items: ["Dia", "Semana", "Mês corrente", "Ano fiscal"], equalSlots: false },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <ElasticSegment {...args} size="sm" />
      <ElasticSegment {...args} size="default" />
      <ElasticSegment {...args} size="lg" />
    </div>
  ),
};

export const CameraLenta: Story = {
  args: { speed: 0.25 },
};

export const SemArrastar: Story = {
  args: { draggable: false },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Mês" },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ElasticSegment {...args} />
    </MotionConfig>
  ),
};
