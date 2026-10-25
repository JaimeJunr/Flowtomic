import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Sparkles, ThumbsUp } from "lucide-react";
import * as React from "react";
import { Button } from "../../../atoms/actions/button";
import type { DayMoment } from "./day-timeline";
import { DayTimeline } from "./day-timeline";

const meta = {
  title: "Flowtomic UI/Molecules/DayTimeline",
  component: DayTimeline,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Um dia em momentos sobre uma régua de horas. O cursor mostra o horário ativo, anda por setas, teclado, clique nos pontos ou arrastando, e o balão e o texto abaixo acompanham. Em contêiner estreito (menos de 640 px) o cursor fica no centro e a régua desliza por baixo dele.",
      },
    },
  },
  tags: ["autodocs"],
  args: { moments: [] },
} satisfies Meta<typeof DayTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const moments: DayMoment[] = [
  {
    id: "fila",
    time: "08:30",
    eyebrow: "No trabalho",
    title: "Comece com a fila arrumada",
    description: "Os PRs chegam separados por risco, e o que bloqueia o resto aparece primeiro.",
    message: "Separei os PRs abertos por risco. Dois dependem de você hoje.",
    reaction: <ThumbsUp aria-hidden="true" className="size-3.5" />,
  },
  {
    id: "revisao",
    time: "11:00",
    eyebrow: "No trabalho",
    title: "Revisão sem caça ao tesouro",
    description: "Os comentários vêm agrupados por arquivo, com o trecho ao lado de cada um.",
    message: "Agrupei 14 comentários em 5 arquivos e marquei os que já foram resolvidos.",
  },
  {
    id: "armadilha",
    time: "13:30",
    eyebrow: "No trabalho",
    title: "Uma armadilha a menos",
    description: "O que quebrou na CI vira uma linha no CLAUDE.md, para o próximo não repetir.",
    message: "Registrei no CLAUDE.md por que o type-check falhava sem o build do logic.",
  },
  {
    id: "build",
    time: "16:00",
    eyebrow: "No trabalho",
    title: "Build por pacote",
    description: "Só o que mudou é construído e testado, em série, sem travar a máquina.",
    message: "Rodei os testes só do pacote ui. 2171 passaram.",
  },
  {
    id: "changelog",
    time: "18:30",
    eyebrow: "No fim do dia",
    title: "Feche o dia com o changelog",
    description: "O rascunho já está pronto para revisar, com os PRs do dia em ordem.",
    message: "O rascunho do changelog está pronto. Falta só a sua leitura.",
    reaction: <Check aria-hidden="true" className="size-3.5" />,
  },
];

const avatar = (
  <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
    <Sparkles className="size-6" />
  </span>
);

export const Default: Story = {
  args: { moments, avatar },
};

export const Automatico: Story = {
  args: { moments, avatar, autoPlay: 4000 },
};

function ControladoDemo() {
  const [value, setValue] = React.useState(moments[0].id);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {moments.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={item.id === value ? "default" : "outline"}
            onClick={() => setValue(item.id)}
          >
            {item.time}
          </Button>
        ))}
      </div>
      <DayTimeline moments={moments} avatar={avatar} value={value} onValueChange={setValue} />
    </div>
  );
}

export const Controlado: Story = {
  args: { moments },
  render: () => <ControladoDemo />,
};

export const Estreito: Story = {
  args: { moments, avatar },
  render: (args) => (
    <div className="w-[360px] max-w-full">
      <DayTimeline {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: { moments, avatar },
  render: (args) => (
    <div className="dark rounded-xl bg-background p-6 text-foreground">
      <DayTimeline {...args} />
    </div>
  ),
};
