import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "../../actions/button/button";
import { ThinkingLine } from "./thinking-line";

const STEPS = ["Lendo a pergunta", "Buscando nas suas notas", "Comparando duas abordagens"];
const QUESTION = "Como o fundo Alfa Multimercado se saiu contra o CDI neste trimestre?";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/ThinkingLine",
  component: ThinkingLine,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Estado ao vivo do raciocínio de um assistente: o glifo respira, o brilho varre o texto e, ao terminar, a linha assenta em 'Pensou por X s' e dobra a trilha de passos. O registro completo e expansível continua sendo o organism Reasoning.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    glyph: { control: "inline-radio", options: ["sparkle", "dot", "none"] },
    working: { control: "boolean" },
    shimmer: { control: "boolean" },
    showTimer: { control: "boolean" },
    collapsible: { control: "boolean" },
    collapseOnSettle: { control: "boolean" },
    settleAfterS: { control: "number" },
    elapsed: { control: "number" },
    label: { control: "text" },
    doneLabel: { control: "text" },
  },
  args: { label: "Pensando…" },
  decorators: [
    (Story) => (
      <div className="flex w-96 flex-col gap-3">
        <p className="text-muted-foreground text-sm">{QUESTION}</p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThinkingLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function StepsOverTime() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (count >= STEPS.length) return;
    const id = setTimeout(() => setCount((value) => value + 1), 1800);
    return () => clearTimeout(id);
  }, [count]);
  return <ThinkingLine steps={STEPS.slice(0, count)} working={count < STEPS.length} />;
}

export const ComPassos: Story = {
  render: () => <StepsOverTime />,
};

export const Assentado: Story = {
  args: { working: false, elapsed: 2.7, steps: STEPS },
};

function Lifecycle() {
  const [working, setWorking] = useState(true);
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <ThinkingLine key={run} working={working} steps={STEPS} />
      <div className="flex gap-2">
        <Button size="sm" disabled={!working} onClick={() => setWorking(false)}>
          Concluir
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRun((value) => value + 1);
            setWorking(true);
          }}
        >
          Recomeçar
        </Button>
      </div>
    </div>
  );
}

export const CicloDeVida: Story = {
  render: () => <Lifecycle />,
};

export const SemBrilho: Story = {
  args: { shimmer: false, steps: STEPS },
};

export const Ponto: Story = {
  args: { glyph: "dot" },
};

export const ReducedMotion: Story = {
  render: () => (
    <MotionConfig reducedMotion="always">
      <ThinkingLine steps={STEPS} />
    </MotionConfig>
  ),
};
