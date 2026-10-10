import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ProximityNav } from "./proximity-nav";

const SECTIONS = [
  "Visão geral",
  "Carteiras",
  "Rentabilidade",
  "Risco e liquidez",
  "Enquadramento",
  "Relatório mensal",
];

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/ProximityNav",
  component: ProximityNav,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Índice vertical de seções. Os itens próximos ao ponteiro deslizam para o lado, ganham a cor de destaque e as linhas crescem, com queda suave pela distância.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    falloff: { control: "inline-radio", options: ["linear", "smooth", "sharp"] },
    radius: { control: { type: "range", min: 40, max: 300, step: 10 } },
    maxShift: { control: { type: "range", min: 0, max: 60, step: 2 } },
    showIndex: { control: "boolean" },
    showMarker: { control: "boolean" },
  },
  args: { items: SECTIONS, "aria-label": "Seções do relatório" },
  decorators: [
    (Story) => (
      <div className="w-72 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProximityNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SemIndice: Story = { args: { showIndex: false } };

export const SemMarcador: Story = { args: { showMarker: false } };

export const AlcanceCurtoQuedaAbrupta: Story = {
  args: { radius: 60, falloff: "sharp", maxShift: 20 },
};

export const AlcanceLongoLinear: Story = {
  args: { radius: 220, falloff: "linear", maxShift: 40, itemGap: 28 },
};

export const ItemAtivoInicial: Story = { args: { defaultActiveIndex: 2 } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ProximityNav {...args} />
    </MotionConfig>
  ),
};
