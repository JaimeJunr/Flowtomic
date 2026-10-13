import type { Meta, StoryObj } from "@storybook/react-vite";
import { Star } from "lucide-react";
import type { Metric } from "./metric-strip";
import { MetricStrip } from "./metric-strip";

const meta = {
  title: "Flowtomic UI/Molecules/MetricStrip",
  component: MetricStrip,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Faixa de números de produto em colunas, linhas ou texto corrido. O `<dl>` lê 'rótulo: número' no leitor de tela; `animate` conta de 0 ao valor quando o item entra na tela e respeita movimento reduzido.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["columns", "rows", "inline"] },
    size: { control: "select", options: ["md", "lg", "xl"] },
    separator: { control: "select", options: ["none", "dot"] },
    mono: { control: "boolean" },
    accent: { control: "boolean" },
    dividers: { control: "boolean" },
    animate: { control: "boolean" },
  },
} satisfies Meta<typeof MetricStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

const quatro: Metric[] = [
  {
    id: "componentes",
    value: 291,
    label: "Componentes",
    description: "Átomos, moléculas e organismos",
  },
  { id: "testes", value: 2171, label: "Testes no ui" },
  {
    id: "cobertura",
    value: 96.9,
    label: "Cobertura de linhas",
    suffix: "%",
    formatOptions: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  },
  { id: "stories", value: 312, label: "Stories", suffix: "+" },
];

const tres: Metric[] = [
  { id: "componentes", value: 291, label: "Componentes", suffix: "+" },
  { id: "testes", value: 2171, label: "Testes no ui" },
  {
    id: "nota",
    value: 4.9,
    label: "Nota da documentação",
    suffix: <Star aria-hidden="true" className="ml-1 inline size-[0.6em]" />,
    formatOptions: { minimumFractionDigits: 1 },
  },
];

const linhas: Metric[] = [
  {
    id: "build",
    value: 300,
    unit: "ms",
    label: "Build por pacote",
    description: "Do arquivo salvo ao navegador atualizado.",
  },
  {
    id: "componentes",
    value: 12,
    suffix: "+",
    label: "Famílias de componentes",
    description: "Cada uma com story e teste.",
  },
  {
    id: "cobertura",
    value: 95,
    suffix: "%",
    label: "Cobertura mínima",
    description: "O CI barra o PR abaixo de 90%.",
  },
];

export const Default: Story = {
  args: { items: quatro, variant: "columns", dividers: true },
};

export const Linhas: Story = {
  args: { items: linhas, variant: "rows" },
  render: (args) => (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
      <div className="min-h-64 rounded-lg bg-muted" aria-hidden="true" />
      <MetricStrip {...args} />
    </div>
  ),
};

export const EmLinha: Story = {
  args: { items: tres, variant: "inline", accent: true, separator: "dot", size: "md" },
};

export const Mono: Story = {
  args: { items: tres.slice(0, 3), variant: "columns", mono: true, size: "xl" },
};

export const Animado: Story = {
  args: { items: quatro, variant: "columns", animate: true, dividers: true },
};

export const Estreito: Story = {
  args: { items: quatro, variant: "columns", dividers: true },
  render: (args) => (
    <div className="w-[360px] border border-dashed border-border p-4">
      <MetricStrip {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: { items: quatro, variant: "columns", dividers: true },
  render: (args) => (
    <div className="dark rounded-lg bg-background p-8 text-foreground">
      <MetricStrip {...args} />
    </div>
  ),
};
