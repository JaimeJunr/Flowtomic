import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { StarBorder } from "./star-border";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/StarBorder",
  component: StarBorder,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Botão ou link com um ponto de luz percorrendo a borda. Use como CTA principal, uma vez por tela. Polimórfico via prop `as`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    direction: { control: "inline-radio", options: ["clockwise", "counterclockwise"] },
    hover: { control: "select", options: ["lap", "brighten", "reveal", "none"] },
    stars: { control: { type: "range", min: 1, max: 6, step: 1 } },
    trailLength: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    glow: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    duration: { control: { type: "range", min: 1, max: 12, step: 0.5 } },
    clickPulse: { control: "boolean" },
  },
  args: { children: "Assinar o plano Pro" },
} satisfies Meta<typeof StarBorder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pilula: Story = {
  args: { radius: 999, children: "Abrir conta empresarial" },
};

export const DuasEstrelasAntiHorario: Story = {
  args: { stars: 2, direction: "counterclockwise", duration: 6, children: "Simular investimento" },
};

export const RastroLongoEBrilho: Story = {
  args: { trailLength: 0.6, glow: 1, thickness: 2, children: "Ver carteira recomendada" },
};

export const HoverRevela: Story = {
  args: { hover: "reveal", children: "Solicitar proposta" },
};

export const HoverIlumina: Story = {
  args: { hover: "brighten", children: "Contratar seguro" },
};

export const ComoLink: Story = {
  render: (args) => (
    <StarBorder {...args} as="a" href="#planos">
      Comparar planos
    </StarBorder>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <StarBorder {...args} />
    </MotionConfig>
  ),
};
