import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { SlideToConfirm } from "./slide-to-confirm";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta = {
  title: "Flowtomic UI/Atoms/Actions/SlideToConfirm",
  component: SlideToConfirm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Confirmação por gesto: deslizar a alça até o fim dispara a ação. Enter, Espaço ou End confirmam pelo teclado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["default", "lg"] },
    speed: { control: { type: "range", min: 0, max: 100 } },
    returnBounce: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    landingDip: { control: { type: "range", min: 0, max: 0.1, step: 0.005 } },
    holdMs: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    className: "w-72",
    label: "Deslize para pagar",
    doneLabel: "Pago",
    errorLabel: "Falha no pagamento",
    onConfirm: fn(),
  },
} satisfies Meta<typeof SlideToConfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ComPromessa: Story = {
  args: { onConfirm: fn(() => wait(1200)) },
};

export const Falha: Story = {
  args: {
    onConfirm: fn(async () => {
      await wait(800);
      throw new Error("Pagamento recusado");
    }),
  },
};

export const FicaConfirmado: Story = {
  args: { holdMs: 0 },
};

export const Grande: Story = {
  args: { size: "lg" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <SlideToConfirm {...args} />
    </MotionConfig>
  ),
};
