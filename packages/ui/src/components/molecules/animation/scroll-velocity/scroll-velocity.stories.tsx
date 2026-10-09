import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ScrollVelocity } from "./scroll-velocity";

const meta = {
  title: "Flowtomic UI/Molecules/Animation/ScrollVelocity",
  component: ScrollVelocity,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    baseVelocity: { control: { type: "number", min: 0, max: 300, step: 10 } },
    maxBoost: { control: { type: "number", min: 0, max: 20, step: 1 } },
    boostAtScrollSpeed: { control: { type: "number", min: 100, max: 4000, step: 100 } },
    itemClassName: { control: "text" },
  },
} satisfies Meta<typeof ScrollVelocity>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = ["Contas a pagar", "Contas a receber", "Fluxo de caixa"];

// A página precisa ser mais alta que a janela para haver scroll que acelere as faixas.
const withTallPage = (Story: () => React.ReactElement) => (
  <div className="min-h-[220vh] bg-background">
    <header className="px-8 pt-16 pb-12 text-center">
      <h2 className="font-display text-3xl font-semibold text-foreground">
        Role a página: as faixas acompanham
      </h2>
      <p className="mt-2 text-muted-foreground">
        A velocidade do scroll acelera as faixas; rolando para cima, elas invertem.
      </p>
    </header>
    <Story />
  </div>
);

export const Default: Story = {
  args: {
    items: ITEMS,
    itemClassName: "font-display text-6xl font-semibold text-foreground",
  },
  decorators: [withTallPage],
};

export const ComIconesEntrePalavras: Story = {
  args: {
    items: [
      <span key="a" className="inline-flex items-center gap-6">
        Conciliação
        <span className="size-3 rounded-full bg-primary" />
        Fechamento
        <span className="size-3 rounded-full bg-primary" />
        Auditoria
      </span>,
      <span key="b" className="inline-flex items-center gap-6 text-primary">
        Extratos
        <span className="size-3 rounded-full bg-foreground" />
        Remessas
        <span className="size-3 rounded-full bg-foreground" />
        Pagamentos
      </span>,
    ],
    itemClassName: "font-display text-5xl font-semibold text-foreground",
  },
  decorators: [withTallPage],
};

export const ImpulsoMaior: Story = {
  args: {
    items: ITEMS,
    baseVelocity: 20,
    maxBoost: 12,
    boostAtScrollSpeed: 600,
    itemClassName: "font-display text-6xl font-semibold text-foreground",
  },
  decorators: [withTallPage],
};

export const ReducedMotion: Story = {
  args: {
    items: ITEMS,
    itemClassName: "font-display text-6xl font-semibold text-foreground",
  },
  decorators: [
    withTallPage,
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
