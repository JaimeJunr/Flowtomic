import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Building2,
  Coins,
  Gem,
  Globe2,
  Landmark,
  LineChart,
  type LucideIcon,
  PiggyBank,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { HelixGallery, type HelixItem } from "./helix-gallery";

const ASSETS: { label: string; icon: LucideIcon; gradient: string }[] = [
  { label: "Renda fixa", icon: Landmark, gradient: "from-primary/30 to-card" },
  { label: "Ações", icon: LineChart, gradient: "from-accent to-card" },
  { label: "Fundos imobiliários", icon: Building2, gradient: "from-secondary to-card" },
  { label: "Tesouro direto", icon: Shield, gradient: "from-primary/20 to-muted" },
  { label: "Previdência", icon: PiggyBank, gradient: "from-muted to-card" },
  { label: "Câmbio", icon: Globe2, gradient: "from-accent to-muted" },
  { label: "Criptoativos", icon: Coins, gradient: "from-primary/30 to-secondary" },
  { label: "Multimercado", icon: TrendingUp, gradient: "from-secondary to-accent" },
  { label: "Ouro", icon: Gem, gradient: "from-primary/20 to-accent" },
  { label: "Conta digital", icon: Wallet, gradient: "from-muted to-primary/20" },
];

const ITEMS: HelixItem[] = ASSETS.map(({ label, icon: Icon, gradient }) => ({
  id: label,
  label,
  content: (
    <div
      className={`flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br p-2 ${gradient}`}
    >
      <Icon className="size-6 text-primary" aria-hidden="true" />
      <span className="text-center font-medium text-foreground text-xs">{label}</span>
    </div>
  ),
}));

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/HelixGallery",
  component: HelixGallery,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Galeria em hélice vertical 3D para vitrines de classes de ativos, cases ou telas. Gira e sobe sem fim; ao parar o mouse em cima, desacelera até parar. Os modos drag, scroll e all adicionam arraste com inércia e rolagem. Com movimento reduzido a hélice fica parada, e o arraste continua respondendo direto.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "inline-radio", options: ["auto", "drag", "scroll", "all"] },
    direction: { control: "inline-radio", options: ["up", "down"] },
    fit: { control: "inline-radio", options: ["cover", "contain"] },
    speed: { control: "number" },
    radius: { control: "number" },
    cardWidth: { control: "number" },
    cardHeight: { control: "number" },
    verticalSpacing: { control: "number" },
    perspective: { control: "number" },
    cardsPerTurn: { control: "number" },
    rotation: { control: "number" },
    cardTilt: { control: "number" },
    centerScale: { control: "number" },
    edgeFade: { control: { type: "range", min: 0, max: 0.5, step: 0.05 } },
    edgeBlur: { control: "number" },
    pauseOnHover: { control: "boolean" },
  },
  args: {
    items: ITEMS,
    "aria-label": "Classes de ativos",
    className: "h-[520px]",
    cardWidth: 120,
    cardHeight: 120,
  },
} satisfies Meta<typeof HelixGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Drag: Story = {
  args: { mode: "drag" },
};

export const Down: Story = {
  args: { direction: "down", cardTilt: 6 },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <HelixGallery {...args} />
    </MotionConfig>
  ),
};
