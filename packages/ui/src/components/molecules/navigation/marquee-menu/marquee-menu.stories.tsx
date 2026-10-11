import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { MarqueeMenu, type MarqueeMenuItem } from "./marquee-menu";

function Thumb() {
  return <span className="block h-full w-full bg-gradient-to-r from-primary to-primary/40" />;
}

const ITEMS: MarqueeMenuItem[] = [
  { label: "Investimentos", href: "#investimentos", thumbnail: <Thumb /> },
  { label: "Previdência", href: "#previdencia", thumbnail: <Thumb /> },
  { label: "Crédito", href: "#credito", thumbnail: <Thumb /> },
  { label: "Câmbio", href: "#cambio", thumbnail: <Thumb /> },
];

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/MarqueeMenu",
  component: MarqueeMenu,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Menu de seções em tela cheia. Ao passar o mouse, uma faixa invertida entra pela borda mais próxima e exibe um letreiro com o nome do item.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "number", min: 1, step: 1 } },
  },
  args: {
    "aria-label": "Seções do portal",
    items: ITEMS,
    className: "h-[480px]",
  },
} satisfies Meta<typeof MarqueeMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slow: Story = {
  args: { speed: 30 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <MarqueeMenu {...args} />
    </MotionConfig>
  ),
};
