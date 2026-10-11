import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { MasonryGrid, type MasonryItem } from "./masonry-grid";

type Note = { title: string; kind: string; figure: string; tone: string; height: number };

const NOTES: Note[] = [
  {
    title: "Fechamento de setembro",
    kind: "Relatório",
    figure: "R$ 4,2 mi",
    tone: "from-primary/20",
    height: 260,
  },
  {
    title: "Rebalanceamento sugerido",
    kind: "Nota",
    figure: "+3,1% RV",
    tone: "from-muted",
    height: 180,
  },
  {
    title: "Concentração por emissor",
    kind: "Relatório",
    figure: "18,4%",
    tone: "from-primary/10",
    height: 340,
  },
  {
    title: "Marcação a mercado pendente",
    kind: "Alerta",
    figure: "12 ativos",
    tone: "from-destructive/15",
    height: 200,
  },
  {
    title: "Retorno vs. CDI",
    kind: "Relatório",
    figure: "104,7%",
    tone: "from-primary/25",
    height: 300,
  },
  {
    title: "Fluxo de caixa de outubro",
    kind: "Nota",
    figure: "R$ 312 mil",
    tone: "from-muted",
    height: 160,
  },
  {
    title: "Carteira Atlas: risco",
    kind: "Relatório",
    figure: "VaR 1,9%",
    tone: "from-primary/15",
    height: 380,
  },
  {
    title: "Cotas a liquidar",
    kind: "Alerta",
    figure: "D+2",
    tone: "from-destructive/10",
    height: 170,
  },
  { title: "Exposição cambial", kind: "Nota", figure: "6,0%", tone: "from-muted", height: 230 },
  {
    title: "Proventos do trimestre",
    kind: "Relatório",
    figure: "R$ 87,4 mil",
    tone: "from-primary/20",
    height: 280,
  },
  {
    title: "Enquadramento da política",
    kind: "Nota",
    figure: "Em dia",
    tone: "from-primary/10",
    height: 190,
  },
  {
    title: "Custos e taxas",
    kind: "Relatório",
    figure: "0,82% a.a.",
    tone: "from-muted",
    height: 320,
  },
  {
    title: "Vencimentos da renda fixa",
    kind: "Alerta",
    figure: "5 títulos",
    tone: "from-destructive/15",
    height: 210,
  },
  {
    title: "Metas por cliente",
    kind: "Nota",
    figure: "73% atingido",
    tone: "from-primary/25",
    height: 250,
  },
];

function Block({ note }: { note: Note }) {
  return (
    <div
      className={`flex h-full flex-col justify-between bg-gradient-to-b ${note.tone} to-card p-4`}
    >
      <p className="text-xs text-muted-foreground">{note.kind}</p>
      <div className="space-y-1">
        <p className="font-mono text-2xl font-semibold text-foreground">{note.figure}</p>
        <p className="text-sm text-foreground">{note.title}</p>
      </div>
    </div>
  );
}

const ITEMS: MasonryItem[] = NOTES.map((note, index) => ({
  id: `nota-${index}`,
  height: note.height,
  content: <Block note={note} />,
}));

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/MasonryGrid",
  component: MasonryGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Mural em colunas de alturas variadas, sem buracos. Os itens entram de uma direção, desfocados e em sequência; ao redimensionar deslizam para a nova posição.",
      },
    },
  },
  tags: ["autodocs"],
  args: { items: ITEMS },
  argTypes: {
    animateFrom: {
      control: "select",
      options: ["bottom", "top", "left", "right", "center", "random"],
    },
    gap: { control: { type: "range", min: 0, max: 40, step: 2 } },
    duration: { control: { type: "range", min: 0.1, max: 2, step: 0.1 } },
    stagger: { control: { type: "range", min: 0, max: 0.3, step: 0.01 } },
    blurToFocus: { control: "boolean" },
    hoverScale: { control: { type: "range", min: 0.8, max: 1.1, step: 0.01 } },
  },
} satisfies Meta<typeof MasonryGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FromCenter: Story = {
  args: { animateFrom: "center", stagger: 0.08 },
};

export const NoBlur: Story = {
  args: { blurToFocus: false, animateFrom: "random", hoverScale: false },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <MasonryGrid {...args} />
    </MotionConfig>
  ),
};
