import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { DriftWall, type DriftWallItem } from "./drift-wall";

type Screen = { label: string; metric: string; bars: number[] };

const SCREENS: Screen[] = [
  { label: "Carteira consolidada", metric: "R$ 4,82 mi", bars: [80, 55, 38] },
  { label: "Fluxo de caixa", metric: "+R$ 312 mil", bars: [60, 90, 45] },
  { label: "Conciliação", metric: "98,4% casado", bars: [95, 70, 30] },
  { label: "Contas a pagar", metric: "27 vencem hoje", bars: [40, 65, 85] },
  { label: "Contas a receber", metric: "R$ 1,07 mi", bars: [75, 50, 62] },
  { label: "Rentabilidade", metric: "+1,32% no mês", bars: [55, 82, 68] },
  { label: "Alocação por classe", metric: "5 classes", bars: [88, 42, 56] },
  { label: "Risco de crédito", metric: "Rating A-", bars: [35, 60, 78] },
  { label: "Extrato bancário", metric: "1.482 lançamentos", bars: [70, 48, 92] },
  { label: "Cotas de fundos", metric: "R$ 18,4021", bars: [52, 76, 40] },
  { label: "Orçamento anual", metric: "63% executado", bars: [66, 84, 36] },
  { label: "Cobranças", metric: "14 em atraso", bars: [45, 58, 90] },
  { label: "Tesouraria", metric: "R$ 920 mil", bars: [85, 38, 64] },
  { label: "Relatório mensal", metric: "Pronto para envio", bars: [58, 72, 50] },
  { label: "Aprovações", metric: "6 pendentes", bars: [30, 68, 82] },
];

function Thumb({ screen }: { screen: Screen }): ReactNode {
  return (
    <div className="flex size-full flex-col justify-between bg-card p-3">
      <div>
        <p className="truncate text-sm font-medium text-foreground">{screen.label}</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{screen.metric}</p>
      </div>
      <div className="space-y-1.5">
        {screen.bars.map((width, i) => (
          <div key={screen.bars.length + i * 7 + width} className="h-1.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const items: DriftWallItem[] = SCREENS.map((screen, i) => ({
  id: `tela-${i}`,
  label: screen.label,
  content: <Thumb screen={screen} />,
}));

const linkedItems = items.map((item, i) => ({ ...item, href: `#tela-${i}` }));

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/DriftWall",
  component: DriftWall,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Parede de ladrilhos em perspectiva com colunas que deslizam sem fim. Fundo de hero ou de login para mostrar várias telas de uma vez.",
      },
    },
  },
  tags: ["autodocs"],
  args: { items, className: "h-[520px] bg-background" },
  argTypes: {
    columns: { control: { type: "range", min: 1, max: 12, step: 1 } },
    tilt: { control: { type: "range", min: -45, max: 45, step: 1 } },
    turn: { control: { type: "range", min: -45, max: 45, step: 1 } },
    roll: { control: { type: "range", min: -30, max: 30, step: 1 } },
    speed: { control: { type: "range", min: 0, max: 200, step: 2 } },
    variance: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    parallax: { control: { type: "range", min: 0, max: 2, step: 0.1 } },
    fade: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    dim: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    direction: { control: "inline-radio", options: ["up", "down"] },
    pauseOnHover: { control: "boolean" },
    grayscale: { control: "boolean" },
  },
} satisfies Meta<typeof DriftWall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Descendo: Story = { args: { direction: "down", speed: 60 } };

export const PausaNoHover: Story = { args: { pauseOnHover: true } };

export const EmTonsDeCinza: Story = { args: { grayscale: true, dim: 0.4 } };

export const ParedeLarga: Story = {
  args: { columns: 8, tileWidth: 170, tileHeight: 112, gap: 14, tilt: 24, turn: -6, fade: 0.8 },
};

export const ComLinks: Story = { args: { items: linkedItems } };

export const SemParalaxe: Story = { args: { parallax: 0, variance: 0 } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <DriftWall {...args} />
    </MotionConfig>
  ),
};
