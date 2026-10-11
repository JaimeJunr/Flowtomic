import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { type ExpandPanelItem, ExpandPanels } from "./expand-panels";

function Block({ figure, text }: { figure: string; text: string }) {
  return (
    <span className="flex h-full w-full flex-col justify-start gap-3 bg-linear-to-br from-primary/25 to-muted p-6">
      <span className="font-mono text-4xl font-semibold text-foreground">{figure}</span>
      <span className="max-w-56 text-sm text-muted-foreground">{text}</span>
    </span>
  );
}

const ITEMS: ExpandPanelItem[] = [
  {
    id: "renda-fixa",
    label: "Renda fixa",
    content: (
      <Block figure="11,2% a.a." text="Títulos públicos e CDBs com vencimento escalonado." />
    ),
  },
  {
    id: "acoes",
    label: "Ações",
    content: (
      <Block figure="+18,4%" text="Carteira de dividendos com rebalanceamento trimestral." />
    ),
  },
  {
    id: "fiis",
    label: "Fundos imobiliários",
    content: (
      <Block figure="0,87% a.m." text="Renda mensal de galpões logísticos e lajes corporativas." />
    ),
  },
  {
    id: "multimercado",
    label: "Multimercado",
    content: (
      <Block figure="CDI + 3,1%" text="Gestão ativa com limite de risco definido em política." />
    ),
  },
  {
    id: "previdencia",
    label: "Previdência",
    content: (
      <Block
        figure="R$ 2,4 mi"
        text="Patrimônio projetado aos 60 anos com aporte mensal de R$ 1.800."
      />
    ),
  },
];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ExpandPanels",
  component: ExpandPanels,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Fileira de painéis em que um fica aberto e os demais viram faixas apagadas e inclinadas. Abre por hover, clique ou foco, com paralaxe no conteúdo e legenda no painel aberto.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    trigger: { control: "inline-radio", options: ["hover", "click"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    size: { control: "number" },
    gap: { control: "number" },
    expandRatio: { control: { type: "range", min: 0.2, max: 0.9, step: 0.02 } },
    tilt: { control: { type: "range", min: 0, max: 20, step: 1 } },
    parallax: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    showLabels: { control: "boolean" },
    grayscale: { control: "boolean" },
  },
  args: { items: ITEMS, "aria-label": "Classes de ativo" },
} satisfies Meta<typeof ExpandPanels>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Click: Story = { args: { trigger: "click" } };

export const Vertical: Story = {
  args: { orientation: "vertical", size: 320 },
  render: (args) => (
    <div className="mx-auto h-[520px] max-w-md">
      <ExpandPanels {...args} className="h-full" />
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ExpandPanels {...args} />
    </MotionConfig>
  ),
};
