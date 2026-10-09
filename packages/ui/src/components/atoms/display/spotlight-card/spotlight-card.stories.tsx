import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { SpotlightCard } from "./spotlight-card";

const FUNDS = [
  { name: "Fundo Atlas Multimercado", yield12m: "+14,82%", equity: "R$ 312,4 mi" },
  { name: "Fundo Ipê Renda Fixa DI", yield12m: "+11,37%", equity: "R$ 1,08 bi" },
  { name: "Fundo Cerrado Ações Small Caps", yield12m: "-3,15%", equity: "R$ 87,9 mi" },
] as const;

type Fund = (typeof FUNDS)[number];

function FundSummary({ fund }: { fund: Fund }) {
  return (
    <div className="space-y-4 p-6">
      <h3 className="font-display text-lg font-semibold">{fund.name}</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-6">
          <dt className="text-muted-foreground">Rentabilidade em 12 meses</dt>
          <dd className="font-mono">{fund.yield12m}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-muted-foreground">Patrimônio</dt>
          <dd className="font-mono">{fund.equity}</dd>
        </div>
      </dl>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Display/SpotlightCard",
  component: SpotlightCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cartão com uma luz suave que segue o ponteiro e acende a borda. Cartões lado a lado dividem a luz pela proximidade.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    intensity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    size: { control: "number" },
    softness: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    shape: { control: "inline-radio", options: ["circle", "beam"] },
    borderGlow: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    proximity: { control: "number" },
    smoothing: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    ambient: { control: "boolean" },
    flare: { control: "boolean" },
  },
  args: {
    className: "w-80",
    children: <FundSummary fund={FUNDS[0]} />,
  },
} satisfies Meta<typeof SpotlightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Grade: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {FUNDS.map((fund) => (
        <SpotlightCard key={fund.name} {...args} className="w-72">
          <FundSummary fund={fund} />
        </SpotlightCard>
      ))}
    </div>
  ),
};

export const GradeNeutra: Story = {
  ...Grade,
  args: { tone: "neutral" },
};

export const Feixe: Story = {
  args: { shape: "beam", intensity: 0.2 },
};

export const Ambiente: Story = {
  args: { ambient: true },
};

export const Nitido: Story = {
  args: { softness: 0, intensity: 0.1 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <SpotlightCard {...args} />
    </MotionConfig>
  ),
};
