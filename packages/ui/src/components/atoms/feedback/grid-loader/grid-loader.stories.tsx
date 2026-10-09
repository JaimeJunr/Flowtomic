import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { Button } from "../../actions/button/button";
import { GridLoader } from "./grid-loader";
import type { GridLoaderPattern } from "./grid-loader-utils";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/GridLoader",
  component: GridLoader,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Indicador de 'pensando' para assistentes de IA: pontos acendem em onda, o cronômetro conta e, ao terminar, a grade vira um check ou um X.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["working", "done", "error"] },
    grid: { control: "inline-radio", options: [3, 4] },
    shape: { control: "inline-radio", options: ["round", "square"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    stepMs: { control: "number" },
    idleOpacity: { control: "number" },
    showTimer: { control: "boolean" },
    elapsed: { control: "number" },
    label: { control: "text" },
    doneLabel: { control: "text" },
    errorLabel: { control: "text" },
  },
  args: { label: "Pensando", doneLabel: "Pronto em", errorLabel: "Falhou após" },
} satisfies Meta<typeof GridLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

const PATTERNS_3: GridLoaderPattern[] = ["orbit", "spiral", "snake", "ripple", "arrow", "dots"];
const PATTERNS_4: GridLoaderPattern[] = ["sweep", "spin", "rain", "pulse", "orbit", "snake"];

export const Default: Story = {};

export const Padroes: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
      {PATTERNS_3.map((pattern) => (
        <div key={pattern} className="flex flex-col gap-1">
          <code className="text-xs text-muted-foreground">{pattern}</code>
          <GridLoader {...args} pattern={pattern} grid={3} />
        </div>
      ))}
    </div>
  ),
};

export const Grade4x4: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
      {PATTERNS_4.map((pattern) => (
        <div key={pattern} className="flex flex-col gap-1">
          <code className="text-xs text-muted-foreground">{pattern}</code>
          <GridLoader {...args} pattern={pattern} grid={4} />
        </div>
      ))}
    </div>
  ),
};

function CicloDeVidaDemo() {
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  return (
    <div className="flex flex-col items-center gap-4">
      <GridLoader status={status} size="lg" />
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setStatus("working")}>
          Reiniciar
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStatus("done")}>
          Concluir
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStatus("error")}>
          Falhar
        </Button>
      </div>
    </div>
  );
}

export const CicloDeVida: Story = { render: () => <CicloDeVidaDemo /> };

export const Quadrado: Story = { args: { shape: "square", pattern: "spiral" } };

export const SemCronometro: Story = { args: { showTimer: false } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <GridLoader {...args} />
    </MotionConfig>
  ),
};
