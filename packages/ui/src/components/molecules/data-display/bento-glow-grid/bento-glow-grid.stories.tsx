import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { BentoGlowGrid, type BentoGlowItem } from "./bento-glow-grid";

const FEATURES: BentoGlowItem[] = [
  {
    id: "painel",
    eyebrow: "Painel",
    title: "Visão consolidada",
    description: "Patrimônio de todas as carteiras num lugar só",
  },
  {
    id: "relatorios",
    eyebrow: "Relatórios",
    title: "Lâminas prontas para o cliente",
    description: "Rentabilidade, risco e movimentações em PDF, sem montar planilha",
  },
  {
    id: "integracoes",
    eyebrow: "Integrações",
    title: "Custodiantes e administradores conectados",
    description: "Posições e cotas chegam por arquivo ou API, conciliadas todo dia",
  },
  {
    id: "alertas",
    eyebrow: "Alertas",
    title: "Desenquadramentos na hora",
    description: "Aviso por e-mail quando um limite da política é ultrapassado",
  },
  {
    id: "benchmarks",
    eyebrow: "Benchmarks",
    title: "Compare com CDI e Ibovespa",
    description: "Janelas de 1, 3, 6 e 12 meses",
  },
  {
    id: "permissoes",
    eyebrow: "Acesso",
    title: "Permissões por carteira",
    description: "Cada analista vê só o que precisa",
  },
];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/BentoGlowGrid",
  component: BentoGlowGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    spotlightRadius: { control: { type: "range", min: 100, max: 600, step: 20 } },
    particleCount: { control: { type: "range", min: 0, max: 30, step: 1 } },
    spotlight: { control: "boolean" },
    borderGlow: { control: "boolean" },
    particles: { control: "boolean" },
    tilt: { control: "boolean" },
    magnetism: { control: "boolean" },
    ripple: { control: "boolean" },
  },
  args: { items: FEATURES },
} satisfies Meta<typeof BentoGlowGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTilt: Story = { args: { tilt: true } };

export const Minimal: Story = { args: { particles: false, ripple: false } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <BentoGlowGrid {...args} />
    </MotionConfig>
  ),
};

export const Dark: Story = {
  render: (args) => (
    <div className="dark bg-background p-6">
      <BentoGlowGrid {...args} />
    </div>
  ),
};
