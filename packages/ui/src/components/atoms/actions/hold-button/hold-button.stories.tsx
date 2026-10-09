import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Trash2 } from "lucide-react";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { HoldButton } from "./hold-button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/HoldButton",
  component: HoldButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Ação irreversível sem modal: segurar é a confirmação. Um clique rápido só mostra a dica.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["destructive", "primary"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    fillDirection: { control: "inline-radio", options: ["right", "up"] },
    holdMs: { control: "number" },
    releaseMs: { control: "number" },
    resetAfterMs: { control: "number" },
    wave: { control: "boolean" },
    disabled: { control: "boolean" },
    tapHint: { control: "text" },
  },
  args: {
    children: "Segure para excluir a conciliação",
    doneLabel: "Conciliação excluída",
    icon: <Trash2 />,
    doneIcon: <Check />,
    onHoldComplete: fn(),
  },
} satisfies Meta<typeof HoldButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Confirmar: Story = {
  args: {
    tone: "primary",
    children: "Segure para aprovar o pagamento",
    doneLabel: "Pagamento aprovado",
    icon: undefined,
  },
};

export const DeBaixoParaCima: Story = {
  args: { fillDirection: "up", size: "lg" },
};

export const FicaFeito: Story = {
  args: { resetAfterMs: 0 },
};

export const Desabilitado: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <HoldButton {...args} />
    </MotionConfig>
  ),
};
