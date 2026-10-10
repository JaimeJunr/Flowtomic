import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { Button } from "@/components/atoms/actions/button";
import { Magnetic } from "./magnetic";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/Magnetic",
  component: Magnetic,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Puxa o filho em direção ao mouse quando o ponteiro chega perto. Útil para chamar atenção para o CTA principal de um estado vazio ou de um hero. Em toque e com movimento reduzido nada se move.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    padding: { control: "number" },
    strength: { control: "number" },
    maxOffset: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    children: <Button>Criar primeira carteira</Button>,
  },
  decorators: [
    (Story) => (
      <div className="p-24">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Magnetic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PuxaoForte: Story = {
  args: { strength: 1.5, maxOffset: 40, padding: 120 },
};

export const PuxaoSutil: Story = {
  args: { strength: 6, maxOffset: 12, padding: 60 },
};

export const Desativado: Story = {
  args: { disabled: true },
};

export const CardDeResumo: Story = {
  args: {
    children: (
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <p className="text-sm text-muted-foreground">Patrimônio líquido</p>
        <p className="font-mono text-lg">R$ 1.284.350,00</p>
      </div>
    ),
  },
};

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
