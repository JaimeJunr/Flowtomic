import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart3, Building2, Coins, Landmark, PiggyBank, TrendingUp } from "lucide-react";
import { MotionConfig } from "motion/react";
import type * as React from "react";
import { PhotoTrail } from "./photo-trail";

function Tile({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: string;
}) {
  return (
    <div className={`flex size-full flex-col items-center justify-center gap-2 ${tone}`}>
      <Icon className="size-8" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

const ITEMS = [
  <Tile
    key="rf"
    icon={Landmark}
    label="Renda fixa"
    tone="bg-gradient-to-br from-primary to-accent text-primary-foreground"
  />,
  <Tile
    key="acoes"
    icon={TrendingUp}
    label="Ações"
    tone="bg-gradient-to-br from-success to-muted text-foreground"
  />,
  <Tile
    key="fundos"
    icon={BarChart3}
    label="Fundos"
    tone="bg-gradient-to-br from-secondary to-primary text-foreground"
  />,
  <Tile
    key="fii"
    icon={Building2}
    label="Fundos imobiliários"
    tone="bg-gradient-to-br from-accent to-secondary text-foreground"
  />,
  <Tile
    key="reserva"
    icon={PiggyBank}
    label="Reserva"
    tone="bg-gradient-to-br from-muted to-card text-foreground"
  />,
  <Tile
    key="cripto"
    icon={Coins}
    label="Câmbio"
    tone="bg-gradient-to-br from-primary to-secondary text-primary-foreground"
  />,
];

const meta = {
  title: "Flowtomic UI/Atoms/Animation/PhotoTrail",
  component: PhotoTrail,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cartões de conteúdo surgem atrás do mouse, um a cada trecho percorrido, e somem sozinhos. Para seções de destaque; com movimento reduzido só o título aparece.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["pop", "drift", "tilt"] },
    spacing: { control: { type: "range", min: 20, max: 200, step: 5 } },
    cardWidth: { control: { type: "range", min: 80, max: 260, step: 10 } },
    lifetime: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
    maxCards: { control: { type: "range", min: 1, max: 30, step: 1 } },
  },
  args: { items: ITEMS },
  render: (args) => (
    <PhotoTrail
      {...args}
      className="h-96 w-[min(48rem,90vw)] rounded-2xl border border-border bg-card"
    >
      <h2 className="text-4xl font-semibold text-foreground">Passe o mouse</h2>
    </PhotoTrail>
  ),
} satisfies Meta<typeof PhotoTrail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Drift: Story = { args: { variant: "drift" } };

export const Tilt: Story = { args: { variant: "tilt" } };

export const DenseTrail: Story = { args: { spacing: 40, maxCards: 20, cardWidth: 120 } };

export const LongLived: Story = { args: { lifetime: 1.8, spacing: 110, cardWidth: 200 } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PhotoTrail
        {...args}
        className="h-96 w-[min(48rem,90vw)] rounded-2xl border border-border bg-card"
      >
        <h2 className="text-4xl font-semibold text-foreground">Passe o mouse</h2>
      </PhotoTrail>
    </MotionConfig>
  ),
};
