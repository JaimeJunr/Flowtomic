import type { Meta, StoryObj } from "@storybook/react-vite";
import { Landmark } from "lucide-react";
import { MotionConfig } from "motion/react";
import { type PillBurstItem, PillBurstMenu } from "./pill-burst-menu";

const ITEMS: PillBurstItem[] = [
  { label: "Início", href: "#inicio", tone: "primary" },
  { label: "Carteiras", href: "#carteiras", tone: "foreground" },
  { label: "Relatórios", href: "#relatorios", tone: "muted" },
  { label: "Planos", href: "#planos", tone: "primary" },
  { label: "Contato", href: "#contato", tone: "foreground" },
];

const LOGO = <Landmark aria-label="Início" style={{ width: 24, height: 24 }} />;

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/PillBurstMenu",
  component: PillBurstMenu,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { items: ITEMS, logo: LOGO, fixed: false },
  argTypes: {
    stagger: { control: { type: "number", min: 0, max: 0.4, step: 0.02 } },
    menuLabel: { control: "text" },
    fixed: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[560px] bg-muted/40">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PillBurstMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <PillBurstMenu {...args} className="h-[560px]" />,
};

export const Open: Story = {
  args: { defaultOpen: true },
  render: (args) => <PillBurstMenu {...args} className="h-[560px]" />,
};

export const ReducedMotion: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PillBurstMenu {...args} className="h-[560px]" />
    </MotionConfig>
  ),
};
