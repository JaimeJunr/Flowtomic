import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { DepthRailCarousel, type DepthRailItem } from "./depth-rail-carousel";

type ReportCard = {
  id: string;
  label: string;
  title: string;
  kind: string;
  value: string;
  caption: string;
  bars: number[];
};

const reports: ReportCard[] = [
  {
    id: "carteira",
    label: "Carteira consolidada",
    title: "Carteira consolidada",
    kind: "Relatório de março",
    value: "R$ 4,82 mi",
    caption: "Patrimônio sob gestão, 38 clientes",
    bars: [42, 55, 48, 63, 71, 84],
  },
  {
    id: "captacao",
    label: "Captação líquida",
    title: "Captação líquida",
    kind: "Relatório de março",
    value: "+R$ 312 mil",
    caption: "Aportes menos resgates no mês",
    bars: [30, 22, 45, 52, 40, 66],
  },
  {
    id: "inadimplencia",
    label: "Inadimplência",
    title: "Inadimplência",
    kind: "Plano Pro",
    value: "2,1%",
    caption: "Menor taxa dos últimos 12 meses",
    bars: [80, 74, 68, 60, 52, 38],
  },
  {
    id: "conciliacao",
    label: "Conciliação bancária",
    title: "Conciliação bancária",
    kind: "Plano Essencial",
    value: "98,4%",
    caption: "Lançamentos conciliados sem revisão",
    bars: [60, 66, 72, 79, 88, 94],
  },
  {
    id: "fluxo",
    label: "Fluxo de caixa",
    title: "Fluxo de caixa projetado",
    kind: "Plano Pro",
    value: "R$ 1,07 mi",
    caption: "Saldo previsto para os próximos 90 dias",
    bars: [50, 44, 58, 62, 57, 76],
  },
  {
    id: "rentabilidade",
    label: "Rentabilidade",
    title: "Rentabilidade acumulada",
    kind: "Relatório do trimestre",
    value: "+11,6%",
    caption: "Acima do CDI em 3,2 pontos",
    bars: [20, 34, 41, 58, 64, 90],
  },
];

function ReportBody({ card }: { card: ReportCard }) {
  return (
    <div className="flex h-full flex-col justify-between bg-linear-to-br from-primary/20 to-card p-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{card.kind}</p>
        <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
      </div>
      <div className="space-y-4">
        <p className="font-mono text-4xl font-semibold text-foreground">{card.value}</p>
        <div className="flex h-24 items-end gap-2" aria-hidden="true">
          {card.bars.map((height, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: barras fixas e decorativas
              key={i}
              className={
                i === card.bars.length - 1
                  ? "flex-1 rounded-sm bg-primary"
                  : "flex-1 rounded-sm bg-muted"
              }
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{card.caption}</p>
      </div>
    </div>
  );
}

const items: DepthRailItem[] = reports.map((card) => ({
  id: card.id,
  label: card.label,
  content: <ReportBody card={card} />,
}));

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/DepthRailCarousel",
  component: DepthRailCarousel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Carrossel de destaques em que os próximos cartões recuam em profundidade num trilho. Aceita setas, pontos, teclado e arrasto.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right"] },
    cardWidth: { control: "number" },
    cardHeight: { control: "number" },
    depth: { control: "number" },
    spread: { control: "number" },
    tilt: { control: "number" },
    perspective: { control: "number" },
    visibleCards: { control: { type: "number", min: 1, max: 8 } },
    falloff: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    blur: { control: "number" },
    duration: { control: "number" },
    autoplay: { control: "boolean" },
    autoplayDelay: { control: "number" },
    loop: { control: "boolean" },
    showControls: { control: "boolean" },
    showIndicators: { control: "boolean" },
  },
  args: {
    items,
    "aria-label": "Destaques do mês",
    cardHeight: 420,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-4xl px-6 py-10" style={{ minHeight: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DepthRailCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Left: Story = {
  args: { side: "left" },
};

export const Autoplay: Story = {
  args: { autoplay: true, autoplayDelay: 2500 },
};

export const NoLoop: Story = {
  args: { loop: false },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <DepthRailCarousel {...args} />
    </MotionConfig>
  ),
};
