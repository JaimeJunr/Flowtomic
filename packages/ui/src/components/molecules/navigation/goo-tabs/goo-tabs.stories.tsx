import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { GooTabs, type GooTabsItem } from "./goo-tabs";

const ITEMS: GooTabsItem[] = [
  { value: "inicio", label: "Início" },
  { value: "carteiras", label: "Carteiras" },
  { value: "relatorios", label: "Relatórios" },
  { value: "cotas", label: "Cotas" },
];

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/GooTabs",
  component: GooTabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    duration: { control: { type: "number", min: 200, max: 1500, step: 50 } },
    particleCount: { control: { type: "number", min: 0, max: 40, step: 1 } },
  },
  args: { items: ITEMS },
  decorators: [
    (Story) => (
      <div className="px-24 py-24">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GooTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComBolinhasDensas: Story = {
  args: { particleCount: 28, particleDistances: [120, 20] },
};

export const PulosLentos: Story = {
  args: { duration: 1200, particleCount: 10 },
};

export const ComLinks: Story = {
  args: {
    items: [
      { value: "painel", label: "Painel", href: "#painel" },
      { value: "posicao", label: "Posição consolidada", href: "#posicao" },
      { value: "extrato", label: "Extrato", href: "#extrato" },
    ],
  },
};

function ControlledDemo() {
  const [value, setValue] = React.useState("carteiras");
  return (
    <div className="flex flex-col items-center gap-6">
      <GooTabs items={ITEMS} value={value} onValueChange={setValue} />
      <p className="text-sm text-muted-foreground">
        Seção aberta: <span className="font-mono text-foreground">{value}</span>
      </p>
    </div>
  );
}

export const Controlado: Story = {
  render: () => <ControlledDemo />,
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <GooTabs {...args} />
    </MotionConfig>
  ),
};
