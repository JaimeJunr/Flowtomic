import type { Meta, StoryObj } from "@storybook/react-vite";
import { Boxes, Download, PencilRuler } from "lucide-react";
import { ComparisonTable } from "./comparison-table";

const meta = {
  title: "Flowtomic UI/Molecules/ComparisonTable",
  component: ComparisonTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Recursos por opções, com uma coluna em destaque. Em contêiner abaixo de 640 px vira abas de opção e lista de recursos. A prop `layout` (`auto`, `table`, `stacked`) força um modo; o padrão `auto` mede o contêiner.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    layout: { control: "inline-radio", options: ["auto", "table", "stacked"] },
    highlight: { control: "text" },
  },
} satisfies Meta<typeof ComparisonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { id: "cli", label: "Copiar com o CLI", icon: <Download /> },
  { id: "npm", label: "Instalar pelo npm", icon: <Boxes /> },
  { id: "zero", label: "Escrever do zero", icon: <PencilRuler /> },
];

const updates = {
  id: "updates",
  label: "Recebe atualizações",
  description: "Correções e componentes novos chegam sem refazer a cópia.",
  values: { cli: "partial" as const, npm: true, zero: false },
};
const edit = {
  id: "edit",
  label: "Edita o código",
  description: "O código do componente fica dentro do seu projeto.",
  values: { cli: true, npm: false, zero: true },
};
const types = { id: "types", label: "Tipos inclusos", values: { cli: true, npm: true } };
const a11y = {
  id: "a11y",
  label: "Acessível de fábrica",
  description: "Foco, teclado e leitores de tela já tratados.",
  values: { cli: true, npm: true, zero: false },
};

export const Default: Story = {
  args: {
    title: "Recursos",
    titleHint: "passe o mouse no ?",
    options,
    features: [updates, edit, types, a11y],
    highlight: "cli",
    highlightLabel: "Recomendado",
  },
};

export const ComGrupos: Story = {
  args: {
    title: "Recursos",
    options,
    highlight: "cli",
    highlightLabel: "Recomendado",
    features: [
      { id: "instalacao", label: "Instalação", features: [edit, types] },
      { id: "manutencao", label: "Manutenção", features: [updates, a11y] },
    ],
  },
};

export const ValoresDeTexto: Story = {
  args: {
    title: "Planos",
    options: [
      { id: "free", label: "Gratuito" },
      { id: "pro", label: "Equipe" },
      { id: "enterprise", label: "Empresa" },
    ],
    highlight: "pro",
    highlightLabel: "Mais escolhido",
    features: [
      {
        id: "price",
        label: "Preço por mês",
        values: { free: "R$ 0", pro: "R$ 49", enterprise: "Sob consulta" },
      },
      {
        id: "users",
        label: "Usuários",
        values: { free: "1 usuário", pro: "10 usuários", enterprise: "Ilimitados" },
      },
      {
        id: "projects",
        label: "Projetos",
        values: { free: "3", pro: "50", enterprise: "Ilimitados" },
      },
      {
        id: "support",
        label: "Suporte",
        values: { free: false, pro: "partial", enterprise: true },
      },
    ],
  },
};

export const Estreito: Story = {
  args: { ...Default.args },
  decorators: [
    (Story) => (
      <div className="w-[360px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
