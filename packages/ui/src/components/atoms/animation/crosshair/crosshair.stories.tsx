import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { Crosshair } from "./crosshair";

function ConciliationPanel() {
  return (
    <div className="grid h-80 w-[640px] content-center gap-6 p-10">
      <div>
        <h3 className="font-display text-lg font-semibold">Conciliação de carteira</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Confira cada posição contra o extrato do custodiante antes de fechar o dia.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Fechar conciliação
        </button>
        <a href="#extrato" className="rounded-md border px-4 py-2 text-sm font-medium">
          Ver extrato
        </a>
      </div>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/Crosshair",
  component: Crosshair,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Mira que segue o ponteiro dentro de uma área, com coordenadas nas bordas, enquadramento de botões e links e um anel a cada clique.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: { control: "text" },
    thickness: { control: { type: "number", min: 1, max: 4 } },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    lineStyle: { control: "inline-radio", options: ["solid", "dashed", "dotted"] },
    gap: { control: { type: "number", min: 0, max: 40 } },
    smoothing: { control: { type: "range", min: 0, max: 0.95, step: 0.05 } },
    showCoordinates: { control: "boolean" },
    targetEffect: { control: "inline-radio", options: ["lock", "none"] },
    clickPulse: { control: "boolean" },
    hideCursor: { control: "boolean" },
  },
  args: { className: "rounded-lg border bg-card text-card-foreground", children: null },
  render: (args) => (
    <Crosshair {...args}>
      <ConciliationPanel />
    </Crosshair>
  ),
} satisfies Meta<typeof Crosshair>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tracejada: Story = {
  args: { lineStyle: "dashed", color: "var(--primary)" },
};

export const ComFolga: Story = {
  args: { gap: 16, hideCursor: true },
};

export const SemAtraso: Story = {
  args: { smoothing: 0 },
};

export const SemEnquadramento: Story = {
  args: { targetEffect: "none", clickPulse: false },
};

export const SemCoordenadas: Story = {
  args: { showCoordinates: false, lineStyle: "dotted" },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <Crosshair {...args}>
        <ConciliationPanel />
      </Crosshair>
    </MotionConfig>
  ),
};
