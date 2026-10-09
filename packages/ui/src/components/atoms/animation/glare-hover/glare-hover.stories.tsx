import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { GlareHover } from "./glare-hover";

function PlanSummary() {
  return (
    <div className="w-72 space-y-4 p-6">
      <h3 className="font-display text-lg font-semibold">Plano Gestão</h3>
      <p className="font-mono text-2xl">R$ 489/mês</p>
      <p className="text-sm text-muted-foreground">
        Carteiras ilimitadas, conciliação diária e relatórios regulatórios.
      </p>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/GlareHover",
  component: GlareHover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Superfície com um reflexo diagonal que atravessa de um canto ao outro ao passar o ponteiro ou receber foco.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    glareOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    glareAngle: { control: { type: "range", min: -180, max: 180, step: 5 } },
    glareSize: { control: { type: "range", min: 100, max: 400, step: 10 } },
    duration: { control: { type: "range", min: 100, max: 2000, step: 50 } },
    playOnce: { control: "boolean" },
  },
  args: { children: <PlanSummary /> },
} satisfies Meta<typeof GlareHover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FaixaEstreita: Story = {
  args: { glareSize: 400, glareAngle: -30, glareOpacity: 0.7, duration: 900 },
};

export const BrilhoDaMarca: Story = {
  args: { glareColor: "var(--primary)", glareOpacity: 0.25 },
};

export const SoNaEntrada: Story = {
  args: { playOnce: true, duration: 500 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <GlareHover {...args} />
    </MotionConfig>
  ),
};
