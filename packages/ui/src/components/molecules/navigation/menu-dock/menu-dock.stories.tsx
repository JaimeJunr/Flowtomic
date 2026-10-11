import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3, Home, Settings, Shield, Wallet } from "lucide-react";
import { MotionConfig } from "motion/react";
import { MenuDock, type MenuDockItem } from "./menu-dock";

const ITEMS: MenuDockItem[] = [
  { id: "inicio", label: "Início", icon: Home, href: "#inicio" },
  { id: "carteiras", label: "Carteiras", icon: Wallet, href: "#carteiras" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, href: "#relatorios" },
  { id: "seguranca", label: "Segurança", icon: Shield, href: "#seguranca" },
  { id: "ajustes", label: "Ajustes", icon: Settings, href: "#ajustes" },
];

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/MenuDock",
  component: MenuDock,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Dock flutuante com ampliação por proximidade do ponteiro, no estilo do macOS (para abas, use `GooTabs`). Abaixo de `md` vira um botão que abre a lista de atalhos. O componente não se posiciona: quem usa decide onde ele fica (a story o põe no rodapé da moldura). O foco de teclado amplia o item como se o ponteiro estivesse sobre ele.",
      },
    },
  },
  tags: ["autodocs"],
  args: { items: ITEMS },
  argTypes: {
    itemSize: { control: { type: "number", min: 24, max: 72, step: 4 } },
    magnification: { control: { type: "number", min: 40, max: 140, step: 4 } },
    magnifyDistance: { control: { type: "number", min: 60, max: 300, step: 10 } },
  },
  decorators: [
    (Story) => (
      <div className="flex h-72 items-end justify-center p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BigMagnification: Story = {
  args: { itemSize: 48, magnification: 128, magnifyDistance: 220 },
};

export const KeyboardFocus: Story = {
  parameters: {
    docs: {
      description: {
        story: "Use Tab para focar um atalho: ele cresce ao tamanho máximo e mostra o rótulo.",
      },
    },
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  parameters: {
    docs: {
      description: { story: "Abaixo de `md` só o botão de menu aparece; ele abre os atalhos." },
    },
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <MenuDock {...args} />
    </MotionConfig>
  ),
};
