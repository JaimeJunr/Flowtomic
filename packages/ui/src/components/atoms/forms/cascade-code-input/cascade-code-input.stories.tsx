import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { CascadeCodeInput, type CascadeCodeInputProps } from "./cascade-code-input";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/CascadeCodeInput",
  component: CascadeCodeInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Campo para o código de verificação enviado por SMS. Cada dígito pousa na casa com uma mola; colar o código faz os dígitos pousarem em cascata.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    length: { control: { type: "number", min: 1, max: 8 } },
    status: { control: "inline-radio", options: ["idle", "error", "success"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    mask: { control: "boolean" },
    caret: { control: "boolean" },
    disabled: { control: "boolean" },
    bounce: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    settleS: { control: { type: "range", min: 0.1, max: 1, step: 0.05 } },
    rise: { control: "number" },
    cascadeMs: { control: "number" },
  },
  args: {
    "aria-label": "Código de verificação enviado por SMS",
    onValueChange: fn(),
    onComplete: fn(),
  },
} satisfies Meta<typeof CascadeCodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mascarado: Story = {
  args: { mask: true, defaultValue: "4829" },
};

export const QuatroDigitos: Story = {
  args: { length: 4, size: "lg" },
};

const WRONG_CODE = "000000";

function ErroDemo(args: CascadeCodeInputProps) {
  const [status, setStatus] = useState<"idle" | "error">("idle");
  return (
    <div className="flex flex-col items-center gap-3">
      <CascadeCodeInput
        {...args}
        status={status}
        onValueChange={(code) => {
          args.onValueChange?.(code);
          if (code !== "") setStatus("idle");
        }}
        onComplete={(code) => {
          args.onComplete?.(code);
          if (code === WRONG_CODE) setStatus("error");
        }}
      />
      <p className="text-muted-foreground text-sm">
        Digite {WRONG_CODE} para ver o código ser recusado.
      </p>
    </div>
  );
}

export const Erro: Story = {
  render: (args) => <ErroDemo {...args} />,
};

export const Sucesso: Story = {
  args: { defaultValue: "482913", status: "success" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "482" },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <CascadeCodeInput {...args} />
    </MotionConfig>
  ),
};
