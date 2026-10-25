import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "../../../atoms/forms/checkbox";
import { ProcessStepFrame } from "./process-step-frame";
import { ProcessSteps } from "./process-steps";
import type { ProcessStep } from "./process-steps-types";

const meta = {
  title: "Flowtomic UI/Molecules/ProcessSteps",
  component: ProcessSteps,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dois a quatro passos em colunas, cada um com um mini-mock (`ProcessStepFrame`), número, título e frase. O `preview` pode ser uma função que recebe `{ active }`, verdadeiro enquanto o passo está visível e falso com movimento reduzido. Um passo com `detail` abre um carrossel numa janela.",
      },
    },
  },
  tags: ["autodocs"],
  args: { steps: [] },
} satisfies Meta<typeof ProcessSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Avança de 0 a `total` enquanto `active`; parado no fim quando inativo. */
function useProgress(active: boolean, total: number, intervalMs: number): number {
  const [count, setCount] = React.useState(total);
  React.useEffect(() => {
    if (!active) {
      setCount(total);
      return;
    }
    setCount(0);
    const timer = setInterval(() => {
      setCount((current) => (current >= total + 1 ? 0 : current + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, total, intervalMs]);
  return Math.min(count, total);
}

const CHECKLIST = ["Largo", "Celular", "Modo escuro"];

function ChecklistPreview({ active }: { active: boolean }) {
  const done = useProgress(active, CHECKLIST.length, 900);
  return (
    <ProcessStepFrame title="estudo.md">
      <ul className="space-y-3">
        {CHECKLIST.map((label, index) => (
          <li key={label} className="flex items-center gap-2 text-sm">
            <Checkbox checked={index < done} disabled aria-label={label} />
            {label}
          </li>
        ))}
      </ul>
    </ProcessStepFrame>
  );
}

const CODE_LINES = ["const spec = readSpec(site);", "export const Peca = build(spec);"];
const CODE_LENGTH = CODE_LINES.join("\n").length;

function CodePreview({ active }: { active: boolean }) {
  const typed = useProgress(active, CODE_LENGTH, 60);
  const visible = CODE_LINES.join("\n").slice(0, typed).split("\n");
  return (
    <ProcessStepFrame tone="dark" title="day-timeline.tsx">
      <pre className="font-mono text-xs leading-6 text-foreground">
        {visible.map((line, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: linhas fixas, na ordem
          <div key={index}>
            {line}
            {active && index === visible.length - 1 ? (
              <span className="ml-px inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />
            ) : null}
          </div>
        ))}
      </pre>
    </ProcessStepFrame>
  );
}

const WIDTHS = ["390", "700", "900", "1100", "1440"];

function WidthsPreview({ active }: { active: boolean }) {
  const lit = useProgress(active, WIDTHS.length, 700);
  return (
    <ProcessStepFrame title="medidas">
      <div className="flex h-full items-center justify-between gap-1">
        {WIDTHS.map((width, index) => (
          <span
            key={width}
            className={cn(
              "rounded-md border border-border px-1.5 py-1 font-mono text-xs tabular-nums transition-colors",
              index < lit ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {width}
          </span>
        ))}
      </div>
    </ProcessStepFrame>
  );
}

const SLIDE_WIDTHS = [
  { label: "390", className: "w-[27%]" },
  { label: "700", className: "w-[49%]" },
  { label: "900", className: "w-[62%]" },
  { label: "1100", className: "w-[76%]" },
  { label: "1440", className: "w-full" },
];

function WidthsSlide() {
  return (
    <div className="flex flex-col gap-2 bg-card p-6">
      {SLIDE_WIDTHS.map((width) => (
        <div key={width.label} className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
            {width.label}
          </span>
          <span className={`block h-4 rounded-sm bg-primary ${width.className}`} />
        </div>
      ))}
    </div>
  );
}

function ModeCard({ dark }: { dark?: boolean }) {
  return (
    <div className={`${dark ? "dark " : ""}rounded-md border border-border bg-background p-3`}>
      <span className="block h-2 w-1/2 rounded-sm bg-foreground" />
      <span className="mt-2 block h-2 w-3/4 rounded-sm bg-muted-foreground" />
      <span className="mt-3 block h-5 w-1/3 rounded-sm bg-primary" />
    </div>
  );
}

function ModesSlide() {
  return (
    <div className="grid grid-cols-2 gap-3 bg-card p-6">
      <ModeCard />
      <ModeCard dark />
    </div>
  );
}

const STEPS: ProcessStep[] = [
  {
    id: "observe",
    title: "Observe só a tela",
    description: "A spec nasce do que se vê no navegador, nunca do código do site.",
    preview: ({ active }) => <ChecklistPreview active={active} />,
  },
  {
    id: "implement",
    title: "Implemente pela spec",
    description: "Quem escreve o código só recebe a spec, sem ver a página de origem.",
    preview: ({ active }) => <CodePreview active={active} />,
  },
  {
    id: "prove",
    title: "Prove no navegador",
    description: "Cada peça é medida em cinco larguras e nos dois modos antes do PR.",
    preview: ({ active }) => <WidthsPreview active={active} />,
    detail: {
      title: "Prova no navegador",
      slides: [
        {
          media: <WidthsSlide />,
          title: "Cinco larguras",
          description: "390, 700, 900, 1100 e 1440 px, lidos com getBoundingClientRect.",
        },
        {
          media: <ModesSlide />,
          title: "Dois modos",
          description: "O mesmo quadro no tema claro e no escuro, sem cor fixa.",
        },
      ],
    },
  },
];

const BASE = {
  title: "Estude. Escreva. Prove.",
  description: "Cada peça nova passa pelos mesmos três passos, do site observado ao PR mergeado.",
  caption: "Cada estudo alimenta o próximo. Clique em Prove no navegador para ver as medidas.",
  steps: STEPS,
};

export const Default: Story = { args: BASE };

export const SemNumeros: Story = {
  args: { ...BASE, numbering: false, steps: STEPS.slice(0, 2), caption: undefined },
};

export const QuatroPassos: Story = {
  args: {
    ...BASE,
    steps: [
      ...STEPS,
      {
        id: "merge",
        title: "Mergeie com a CI verde",
        description: "Nenhum teste falhando na entrega.",
      },
    ],
  },
};

export const Estreito: Story = {
  args: BASE,
  render: (args) => (
    <div className="w-[390px] max-w-full">
      <ProcessSteps {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: BASE,
  render: (args) => (
    <div className="dark rounded-xl bg-background p-8 text-foreground">
      <ProcessSteps {...args} />
    </div>
  ),
};
