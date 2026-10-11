import type { Meta, StoryObj } from "@storybook/react-vite";
import { Landmark } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Button } from "@/components/atoms/actions/button";
import { type CardNavGroup, ExpandingCardNav } from "./expanding-card-nav";

const groups: CardNavGroup[] = [
  {
    label: "Produtos",
    tone: "primary",
    links: [
      { label: "Carteiras", href: "#carteiras" },
      { label: "Previdência", href: "#previdencia" },
      { label: "Câmbio", href: "#cambio" },
    ],
  },
  {
    label: "Empresa",
    tone: "foreground",
    links: [
      { label: "Sobre", href: "#sobre" },
      { label: "Carreiras", href: "#carreiras" },
    ],
  },
  {
    label: "Contato",
    tone: "muted",
    links: [
      { label: "E-mail", href: "#email" },
      { label: "Ouvidoria", href: "#ouvidoria" },
    ],
  },
];

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/ExpandingCardNav",
  component: ExpandingCardNav,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Barra de navegação flutuante que cresce para baixo e revela cartões agrupados de links. Fecha com o botão, Esc ou ao escolher um link.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  args: {
    groups,
    logo: <Landmark aria-label="Início" style={{ width: 24, height: 24 }} />,
    action: <Button size="sm">Abrir conta</Button>,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto h-[420px] w-full max-w-[900px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExpandingCardNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

export const ReducedMotion: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ExpandingCardNav {...args} />
    </MotionConfig>
  ),
};
