import type { Meta, StoryObj } from "@storybook/react-vite";
import { Award, PiggyBank, ShieldCheck } from "lucide-react";
import { MotionConfig } from "motion/react";
import { PeelSticker } from "./peel-sticker";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/PeelSticker",
  component: PeelSticker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Adesivo com borda branca que descola uma ponta no hover e ao pressionar, com o verso do papel e sombra na dobra. Pode ser arrastado pela área e movido pelas setas. Bom para conquistas e estados vazios de onboarding.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    width: { control: { type: "number", min: 96, max: 280 } },
    peelDirection: { control: { type: "range", min: 0, max: 360, step: 15 } },
    peelHover: { control: { type: "range", min: 0, max: 0.9, step: 0.05 } },
    peelActive: { control: { type: "range", min: 0, max: 0.9, step: 0.05 } },
    dragRotate: { control: "number" },
    shadowIntensity: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
    draggable: { control: "boolean" },
    initialPosition: {
      control: "select",
      options: ["center", "top-left", "top-right", "bottom-left", "bottom-right"],
    },
  },
  args: {
    label: "Selo Primeiro aporte",
    children: (
      <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-primary to-primary/60 text-primary-foreground">
        <Award style={{ width: 56, height: 56 }} />
        <span className="font-semibold text-sm">Primeiro aporte</span>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-[480px] rounded-xl border border-border bg-muted/40">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PeelSticker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DescolaPelaDireita: Story = {
  args: {
    peelDirection: 90,
    label: "Selo Carteira protegida",
    initialPosition: "top-left",
    children: (
      <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-success to-success/60 text-success-foreground">
        <ShieldCheck style={{ width: 56, height: 56 }} />
        <span className="font-semibold text-sm">Carteira protegida</span>
      </div>
    ),
  },
};

export const DescolaPelaDiagonal: Story = {
  args: {
    peelDirection: 225,
    peelHover: 0.4,
    initialPosition: "bottom-right",
  },
};

export const Fixo: Story = {
  args: {
    draggable: false,
    label: "Selo Meta de reserva",
    children: (
      <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-primary to-primary/60 text-primary-foreground">
        <PiggyBank style={{ width: 56, height: 56 }} />
        <span className="font-semibold text-sm">Meta de reserva</span>
      </div>
    ),
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PeelSticker {...args} />
    </MotionConfig>
  ),
};
