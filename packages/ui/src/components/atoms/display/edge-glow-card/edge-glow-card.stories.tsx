import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { EdgeGlowCard } from "./edge-glow-card";

const BENEFITS = [
  "Carteiras ilimitadas com consolidação diária",
  "Relatórios de risco e enquadramento automáticos",
  "Integração com custodiante e administrador",
] as const;

function PlanoGestora() {
  return (
    <div className="w-80 space-y-5 p-7">
      <div>
        <h3 className="font-display text-xl font-semibold">Plano Gestora</h3>
        <p className="mt-1 text-sm text-muted-foreground">Para casas com mais de dez fundos.</p>
      </div>
      <ul className="space-y-2 text-sm">
        {BENEFITS.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
      <p className="font-mono text-lg">
        R$ 1.490<span className="text-sm text-muted-foreground"> / mês</span>
      </p>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Atoms/Display/EdgeGlowCard",
  component: EdgeGlowCard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Cartão cuja borda acende num cone apontado para o ponteiro quando ele chega perto. Pensado para painéis escuros.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    edgeSensitivity: { control: { type: "range", min: 0, max: 100, step: 5 } },
    radius: { control: "number" },
    glowRadius: { control: "number" },
    intensity: { control: { type: "range", min: 0.1, max: 3, step: 0.1 } },
    coneSpread: { control: { type: "range", min: 5, max: 45, step: 1 } },
    animated: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="dark flex min-h-96 items-center justify-center bg-background p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
  args: { children: <PlanoGestora /> },
} satisfies Meta<typeof EdgeGlowCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VoltaDeLuz: Story = { args: { animated: true } };

export const ConeEstreitoEIntenso: Story = { args: { coneSpread: 10, intensity: 2 } };

export const SensivelDeLonge: Story = { args: { edgeSensitivity: 70, glowRadius: 80 } };

export const CantosRetos: Story = { args: { radius: 8, glowRadius: 24 } };

export const ReducedMotion: Story = {
  args: { animated: true },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <EdgeGlowCard {...args} />
    </MotionConfig>
  ),
};
