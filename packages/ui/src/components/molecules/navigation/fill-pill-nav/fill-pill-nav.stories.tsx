import type { Meta, StoryObj } from "@storybook/react-vite";
import { Landmark } from "lucide-react";
import { MotionConfig } from "motion/react";
import { FillPillNav } from "./fill-pill-nav";

const ITEMS = [
  { label: "Início", href: "#inicio" },
  { label: "Carteiras", href: "#carteiras" },
  { label: "Relatórios", href: "#relatorios" },
  { label: "Contato", href: "#contato" },
];

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/FillPillNav",
  component: FillPillNav,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Cabeçalho compacto com logo redondo e links em pílulas. No hover, um círculo cresce de baixo e enche a pílula enquanto o rótulo rola para cima. Em largura estreita vira um botão de menu com painel. Com movimento reduzido, só a cor troca.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    activeHref: { control: "text" },
    introAnimation: { control: "boolean" },
    logoLabel: { control: "text" },
    logoHref: { control: "text" },
  },
  args: {
    items: ITEMS,
    logo: <Landmark size={18} aria-hidden="true" />,
    logoLabel: "Início",
    logoHref: "#inicio",
  },
  decorators: [
    (Story) => (
      <div className="min-h-48 w-full p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FillPillNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { activeHref: "#carteiras" },
};

export const NoIntro: Story = {
  args: { activeHref: "#relatorios", introAnimation: false },
};

export const Mobile: Story = {
  args: { activeHref: "#inicio", introAnimation: false },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

export const ReducedMotion: Story = {
  args: { activeHref: "#carteiras" },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <FillPillNav {...args} />
    </MotionConfig>
  ),
};
