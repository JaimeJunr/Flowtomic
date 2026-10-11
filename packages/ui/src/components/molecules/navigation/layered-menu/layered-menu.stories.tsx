import type { Meta, StoryObj } from "@storybook/react-vite";
import { Landmark } from "lucide-react";
import { MotionConfig } from "motion/react";
import { LayeredMenu } from "./layered-menu";

const ITEMS = [
  { label: "Início", href: "#" },
  { label: "Carteiras", href: "#" },
  { label: "Relatórios", href: "#" },
  { label: "Contato", href: "#" },
];

const LINKS = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "E-mail", href: "#" },
];

const logo = <Landmark aria-label="Início" role="img" className="size-6" />;

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/LayeredMenu",
  component: LayeredMenu,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Menu principal de site institucional com poucas seções. Camadas coloridas deslizam da lateral, o painel cobre por cima e os itens sobem de uma máscara, um após o outro. Esc, clique fora ou clique num item fecham. Com movimento reduzido, só o painel aparece, por opacidade.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right"] },
    layers: { control: "inline-radio", options: [1, 2, 3] },
    numbered: { control: "boolean" },
    closeOnClickAway: { control: "boolean" },
    linksTitle: { control: "text" },
  },
  args: {
    items: ITEMS,
    links: LINKS,
    logo,
    className: "h-[560px] bg-muted/40",
  },
} satisfies Meta<typeof LayeredMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Left: Story = {
  args: { side: "left" },
};

export const ThreeLayers: Story = {
  args: { layers: 3 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <LayeredMenu {...args} />
    </MotionConfig>
  ),
};
