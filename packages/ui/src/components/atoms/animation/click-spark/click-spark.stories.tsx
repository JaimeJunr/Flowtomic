import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ClickSpark } from "./click-spark";

function TaskPanel() {
  return (
    <div className="w-96 space-y-3 rounded-lg border bg-card p-6 text-card-foreground">
      <h3 className="font-display text-lg font-semibold">Fechamento de abril</h3>
      <p className="text-sm text-muted-foreground">
        Clique em qualquer ponto do painel para confirmar a etapa.
      </p>
      <button type="button" className="rounded-md border px-3 py-1.5 text-sm">
        Conciliar cotas do Fundo Ipê
      </button>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Animation/ClickSpark",
  component: ClickSpark,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Estalo de faíscas no ponto do clique, para dar retorno de concluído em ações pequenas.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: { control: "text" },
    sparkSize: { control: "number" },
    sparkRadius: { control: "number" },
    sparkCount: { control: { type: "number", min: 1, max: 24 } },
    duration: { control: "number" },
    easing: { control: "inline-radio", options: ["linear", "ease-in", "ease-out", "ease-in-out"] },
    extraScale: { control: { type: "range", min: 0.5, max: 3, step: 0.1 } },
  },
  render: (args) => (
    <ClickSpark {...args}>
      <TaskPanel />
    </ClickSpark>
  ),
} satisfies Meta<typeof ClickSpark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Wide: Story = {
  args: { sparkCount: 14, sparkRadius: 36, sparkSize: 14, extraScale: 1.4 },
};

export const Subtle: Story = {
  args: { sparkCount: 5, sparkRadius: 12, sparkSize: 6, duration: 300, easing: "ease-in-out" },
};

export const Muted: Story = {
  args: { color: "var(--muted-foreground)", easing: "linear", duration: 600 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ClickSpark {...args}>
        <TaskPanel />
      </ClickSpark>
    </MotionConfig>
  ),
};
