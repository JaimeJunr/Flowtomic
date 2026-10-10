import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { AnimatedList } from "./animated-list";

type Portfolio = { name: string; manager: string; value: string };

const PORTFOLIOS: Portfolio[] = [
  { name: "Atlas Multimercado FIC FIM", manager: "Gestão Atlas", value: "R$ 4.218.906,40" },
  { name: "Boreal Renda Fixa Crédito Privado", manager: "Boreal Asset", value: "R$ 2.874.310,15" },
  { name: "Cedro Ações Brasil FIA", manager: "Cedro Capital", value: "R$ 1.932.058,72" },
  { name: "Duna Referenciado DI", manager: "Duna Investimentos", value: "R$ 1.640.220,00" },
  { name: "Esmeralda Previdência Balanceado", manager: "Esmeralda Prev", value: "R$ 1.388.745,90" },
  { name: "Faro Infraestrutura Incentivado", manager: "Faro Gestora", value: "R$ 1.102.480,33" },
  { name: "Granito Long Biased", manager: "Granito Capital", value: "R$ 986.115,08" },
  { name: "Horizonte Cambial", manager: "Horizonte Asset", value: "R$ 754.392,61" },
  { name: "Ipê Small Caps FIA", manager: "Ipê Investimentos", value: "R$ 610.874,27" },
  { name: "Jacarandá Imobiliário FII", manager: "Jacarandá Gestão", value: "R$ 498.230,00" },
];

const PortfolioList = AnimatedList<Portfolio>;

function renderPortfolio(item: Portfolio, _index: number, selected: boolean) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.name}</p>
        <p className={selected ? "text-xs" : "text-xs text-muted-foreground"}>{item.manager}</p>
      </div>
      <span className="shrink-0 font-mono">{item.value}</span>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/AnimatedList",
  component: PortfolioList,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    showGradients: { control: "boolean" },
    showScrollbar: { control: "boolean" },
    enableArrowNavigation: { control: "boolean" },
  },
} satisfies Meta<typeof PortfolioList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Fundos da carteira",
    items: PORTFOLIOS,
    renderItem: renderPortfolio,
    getKey: (item) => item.name,
  },
};

export const SelecaoInicial: Story = {
  args: { ...Default.args, defaultSelectedIndex: 2 },
};

export const SemBarraNemDegrades: Story = {
  args: { ...Default.args, showScrollbar: false, showGradients: false },
};

export const SemNavegacaoPorSetas: Story = {
  args: { ...Default.args, enableArrowNavigation: false },
};

export const ReducedMotion: Story = {
  args: Default.args,
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PortfolioList {...args} />
    </MotionConfig>
  ),
};
