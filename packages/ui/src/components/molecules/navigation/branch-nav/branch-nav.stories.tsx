import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen, Layers, Rocket } from "lucide-react";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { BranchNav, type BranchNavItem, type BranchNavLeaf } from "./branch-nav";

const PRIMEIROS_PASSOS: BranchNavLeaf[] = [
  { value: "instalacao", label: "Instalação" },
  { value: "inicio-rapido", label: "Início rápido" },
  { value: "configuracao", label: "Configuração" },
  { value: "temas", label: "Temas" },
];

const COMPONENTES: BranchNavLeaf[] = [
  { value: "botoes", label: "Botões" },
  { value: "tipografia", label: "Tipografia" },
  { value: "sobreposicoes", label: "Sobreposições" },
  { value: "avisos", label: "Avisos" },
];

const ITEMS: BranchNavItem[] = [
  { label: "Primeiros passos", children: PRIMEIROS_PASSOS },
  { label: "Componentes", children: COMPONENTES },
  { value: "changelog", label: "Changelog" },
];

const WITH_ICONS: BranchNavItem[] = [
  {
    label: "Primeiros passos",
    icon: <Rocket />,
    children: PRIMEIROS_PASSOS,
  },
  {
    label: "Componentes",
    icon: <Layers />,
    children: COMPONENTES,
  },
  { value: "changelog", label: "Changelog", icon: <BookOpen /> },
];

const WITH_LINKS: BranchNavItem[] = [
  {
    label: "Primeiros passos",
    children: [
      { value: "instalacao", label: "Instalação", href: "#instalacao" },
      { value: "inicio-rapido", label: "Início rápido", href: "#inicio-rapido" },
      { value: "configuracao", label: "Configuração", href: "#configuracao" },
      { value: "temas", label: "Temas", href: "#temas" },
    ],
  },
  { value: "changelog", label: "Changelog", href: "#changelog" },
];

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/BranchNav",
  component: BranchNav,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Menu de documentação em árvore: o tronco desce à esquerda, cada filho tem um galho curvo e uma linha de destaque é desenhada até o item escolhido. Teclado pela ordem natural de tab.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    rowHeight: { control: "number" },
    indent: { control: "number" },
    trunkX: { control: "number" },
    radius: { control: "number" },
    drawMs: { control: "number" },
    foldMs: { control: "number" },
  },
  args: { items: ITEMS, onValueChange: fn(), onToggle: fn(), className: "w-64" },
} satisfies Meta<typeof BranchNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DuasAbertas: Story = { args: { defaultOpen: [0, 1] } };

export const TodasFechadas: Story = { args: { defaultOpen: -1 } };

export const ComIcones: Story = { args: { items: WITH_ICONS } };

export const ComLinks: Story = { args: { items: WITH_LINKS } };

export const ReducedMotion: Story = {
  args: { defaultOpen: [0, 1] },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <BranchNav {...args} />
    </MotionConfig>
  ),
};
