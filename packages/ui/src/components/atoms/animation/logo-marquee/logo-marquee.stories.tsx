import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banknote, Building2, Landmark, QrCode, ShieldCheck } from "lucide-react";
import { MotionConfig } from "motion/react";
import { LogoMarquee, type LogoMarqueeItem } from "./logo-marquee";

function Brand({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-semibold text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

const INTEGRATIONS: LogoMarqueeItem[] = [
  {
    node: <Brand icon={<Landmark className="size-5" />} label="Open Finance" />,
    title: "Open Finance",
  },
  { node: <Brand icon={<QrCode className="size-5" />} label="Pix" />, title: "Pix" },
  { node: <Brand icon={<Building2 className="size-5" />} label="B3" />, title: "B3" },
  { node: <Brand icon={<ShieldCheck className="size-5" />} label="CVM" />, title: "CVM" },
  { node: <Brand icon={<Banknote className="size-5" />} label="ANBIMA" />, title: "ANBIMA" },
];

const LINKED: LogoMarqueeItem[] = INTEGRATIONS.map((item) => ({
  ...item,
  href: "#integracoes",
}));

const meta = {
  title: "Flowtomic UI/Atoms/Animation/LogoMarquee",
  component: LogoMarquee,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Faixa de logos que rola sem fim e sem emenda. Desacelera com o mouse em cima e pausa quando um link recebe foco.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: -200, max: 200, step: 5 } },
    direction: { control: "inline-radio", options: ["left", "right", "up", "down"] },
    itemHeight: { control: { type: "range", min: 16, max: 64, step: 2 } },
    gap: { control: { type: "range", min: 8, max: 120, step: 4 } },
    hoverSpeed: { control: { type: "range", min: 0, max: 200, step: 5 } },
    fadeEdges: { control: "boolean" },
    scaleOnHover: { control: "boolean" },
  },
  args: { items: INTEGRATIONS, "aria-label": "Integrações e órgãos suportados" },
} satisfies Meta<typeof LogoMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BordasEsmaecidas: Story = {
  args: { fadeEdges: true, scaleOnHover: true },
};

export const SentidoInverso: Story = {
  args: { direction: "right", speed: 90, hoverSpeed: 20, fadeEdges: true },
};

export const ComLinks: Story = {
  args: { items: LINKED, scaleOnHover: true, fadeEdges: true },
};

export const Vertical: Story = {
  args: { direction: "up", itemHeight: 32, gap: 24, fadeEdges: true },
  render: (args) => (
    <div className="h-48 w-56">
      <LogoMarquee {...args} className="h-full" />
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <LogoMarquee {...args} />
    </MotionConfig>
  ),
};
