import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { EvasiveTarget } from "./evasive-target";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/EvasiveTarget",
  component: EvasiveTarget,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pílula que foge do mouse e desiste depois de algumas tentativas. Efeito lúdico para easter egg ou estado vazio. Nunca envolva um controle de recusa, fechar ou cancelar.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    axis: { control: "inline-radio", options: ["both", "x", "y"] },
    wall: { control: "inline-radio", options: ["clamp", "bounce"] },
    patience: { control: "number" },
    reach: { control: "number" },
    radius: { control: "number" },
    falloff: { control: "number" },
    fleeMs: { control: "number" },
    returnMs: { control: "number" },
    returnBounce: { control: "number" },
    fieldHeight: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    touchNotice: "Aqui a pílula só foge de mouse",
    onDodge: fn(),
    onGiveUp: fn(),
    onCatch: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem] rounded-lg border border-dashed p-4">
        <p className="mb-2 text-center text-muted-foreground text-sm">
          Nenhum relatório por aqui ainda.
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EvasiveTarget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SoHorizontal: Story = { args: { axis: "x" } };

export const Quicando: Story = { args: { wall: "bounce", reach: 140, fieldHeight: 200 } };

export const Paciente: Story = { args: { patience: 8 } };

export const FilhoPersonalizado: Story = {
  args: {
    children: (state) => (
      <button
        type="button"
        className="rounded-full bg-secondary px-4 py-2 font-medium text-secondary-foreground text-sm focus-visible:ring-2 focus-visible:ring-ring"
      >
        {state.gaveUp ? "Pode pegar" : `Escapei ${state.dodges}x`}
      </button>
    ),
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
