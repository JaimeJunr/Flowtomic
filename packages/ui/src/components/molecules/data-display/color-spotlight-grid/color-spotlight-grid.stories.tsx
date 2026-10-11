import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Briefcase,
  ChartNoAxesCombined,
  FileCheck2,
  Landmark,
  PieChart,
  ShieldCheck,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import type * as React from "react";

import { ColorSpotlightGrid, type SpotlightGridItem } from "./color-spotlight-grid";

function Media({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex size-full items-center justify-center bg-linear-to-br from-primary to-primary/40">
      <Icon className="size-16 text-primary-foreground" />
    </div>
  );
}

const ITEMS: SpotlightGridItem[] = [
  {
    id: "carteiras",
    title: "Gestão de carteiras",
    subtitle: "Posição consolidada por mandato",
    content: <Media icon={Briefcase} />,
  },
  {
    id: "risco",
    title: "Risco e limites",
    subtitle: "VaR, stress e enquadramento diário",
    content: <Media icon={ShieldCheck} />,
  },
  {
    id: "performance",
    title: "Performance",
    subtitle: "Atribuição contra benchmark",
    content: <Media icon={ChartNoAxesCombined} />,
  },
  {
    id: "previdencia",
    title: "Previdência",
    subtitle: "Planos e passivo atuarial",
    content: <Media icon={Landmark} />,
  },
  {
    id: "compliance",
    title: "Compliance",
    subtitle: "Trilha de auditoria por operação",
    content: <Media icon={FileCheck2} />,
  },
  {
    id: "alocacao",
    title: "Alocação estratégica",
    subtitle: "Cenários de longo prazo",
    content: <Media icon={PieChart} />,
  },
];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ColorSpotlightGrid",
  component: ColorSpotlightGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    reveal: { control: "radio", options: ["spotlight", "card"] },
    columns: { control: { type: "range", min: 1, max: 6, step: 1 } },
    radius: { control: { type: "range", min: 80, max: 500, step: 10 } },
    softness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    damping: { control: { type: "range", min: 0, max: 0.95, step: 0.05 } },
    fadeOut: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    grayscale: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    dim: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    showInfo: { control: "boolean" },
  },
  args: { items: ITEMS },
} satisfies Meta<typeof ColorSpotlightGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CardReveal: Story = { args: { reveal: "card" } };

export const TwoColumns: Story = {
  args: { columns: 2, aspectRatio: "16 / 9", radius: 320 },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
};

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
