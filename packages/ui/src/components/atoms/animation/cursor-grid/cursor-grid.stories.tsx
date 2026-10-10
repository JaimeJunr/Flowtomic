import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { CursorGrid } from "./cursor-grid";

function AccessHero() {
  return (
    <div className="flex h-80 w-[40rem] max-w-full flex-col items-center justify-center gap-2 text-center">
      <h3 className="font-display text-2xl font-semibold">Acesse a carteira do Fundo Ipê</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Cotas, enquadramento e fechamento de abril em um só lugar.
      </p>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/CursorGrid",
  component: CursorGrid,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Fundo de grade que acende em volta do ponteiro e deixa rastro ao apagar. O clique solta um anel de células.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    cellSize: { control: { type: "number", min: 16, max: 120 } },
    color: { control: "text" },
    radius: { control: { type: "number", min: 40, max: 400 } },
    falloff: { control: "inline-radio", options: ["linear", "smooth", "sharp"] },
    holdTime: { control: "number" },
    fadeDuration: { control: "number" },
    lineWidth: { control: { type: "number", min: 0.5, max: 4, step: 0.5 } },
    maxOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    fillOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    gridOpacity: { control: { type: "range", min: 0, max: 1, step: 0.02 } },
    cellRadius: { control: { type: "number", min: 0, max: 24 } },
    clickPulse: { control: "boolean" },
    pulseSpeed: { control: "number" },
  },
  render: (args) => (
    <CursorGrid {...args} className="rounded-lg border bg-card">
      <AccessHero />
    </CursorGrid>
  ),
} satisfies Meta<typeof CursorGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFaintGrid: Story = {
  args: { gridOpacity: 0.1, fillOpacity: 0.08 },
};

export const RoundedCells: Story = {
  args: { cellSize: 40, cellRadius: 8, fillOpacity: 0.15, gridOpacity: 0.06, falloff: "sharp" },
};

export const LongTrail: Story = {
  args: { holdTime: 900, fadeDuration: 1800, radius: 200, falloff: "linear" },
};

export const WithoutClickPulse: Story = {
  args: { clickPulse: false, color: "var(--muted-foreground)" },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <CursorGrid {...args} className="rounded-lg border bg-card">
        <AccessHero />
      </CursorGrid>
    </MotionConfig>
  ),
};
