import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { ToolCallChip, type ToolCallStatus } from "./index";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/ToolCallChip",
  component: ToolCallChip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Chip de uma chamada de ferramenta em andamento: preenchimento que estaciona em 90%, contador, e troca de ícone ao concluir ou falhar.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["idle", "running", "done", "error"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
    icon: { control: "inline-radio", options: ["terminal", "file", "search", "edit"] },
    expectedMs: { control: "number" },
    shake: { control: "number" },
    showTimer: { control: "boolean" },
  },
  args: { name: "bash", argument: "npm test", icon: "terminal", status: "running" },
} satisfies Meta<typeof ToolCallChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Concluido: Story = { args: { status: "done" } };

export const Erro: Story = { args: { status: "error", onRetry: fn() } };

const STEPS: { icon: "terminal" | "file" | "search" | "edit"; name: string; argument: string }[] = [
  { icon: "terminal", name: "bash", argument: "npm test" },
  { icon: "file", name: "ler", argument: "src/relatorio.ts" },
  { icon: "search", name: "buscar", argument: "'taxa de administração'" },
  { icon: "edit", name: "editar", argument: "README.md" },
];
const STEP_MS = 1800;

function statusAt(index: number, tick: number): ToolCallStatus {
  if (index > tick) return "idle";
  if (index === tick) return "running";
  return index === 2 ? "error" : "done";
}

function SequenceDemo() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % (STEPS.length + 2)), STEP_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-start gap-2">
      {STEPS.map((step, index) => (
        <ToolCallChip
          key={step.argument}
          {...step}
          status={statusAt(index, tick)}
          onRetry={() => setTick(index)}
        />
      ))}
    </div>
  );
}

export const Sequencia: Story = { render: () => <SequenceDemo /> };

export const Icones: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      {STEPS.map((step) => (
        <ToolCallChip key={step.icon} {...step} status="done" />
      ))}
    </div>
  ),
};

export const Pequeno: Story = { args: { size: "sm" } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ToolCallChip {...args} />
    </MotionConfig>
  ),
};
