import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { StrikeCheckbox } from "./strike-checkbox";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/StrikeCheckbox",
  component: StrikeCheckbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Item de checklist: o preenchimento cresce numa mola, o ✓ é desenhado e um risco atravessa o texto. `ref` vai no controle; indeterminate não é suportado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    strike: { control: "inline-radio", options: ["left", "center", "right", "none"] },
    bounce: { control: { type: "range", min: 0, max: 0.6, step: 0.05 } },
    strikeLag: { control: { type: "range", min: 0, max: 0.5, step: 0.02 } },
    doneOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    disabled: { control: "boolean" },
  },
  args: { label: "Publicar a build", onCheckedChange: fn() },
} satisfies Meta<typeof StrikeCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checklist: Story = {
  render: (args) => (
    <ul className="flex flex-col gap-3">
      {[
        "Publicar a build",
        "Atualizar o changelog",
        "Avisar o time no canal",
        "Fechar o milestone",
      ].map((label, index) => (
        <li key={label}>
          <StrikeCheckbox {...args} label={label} defaultChecked={index === 0} />
        </li>
      ))}
    </ul>
  ),
};

export const RiscoDoCentro: Story = {
  args: { strike: "center", label: "Atualizar o changelog", defaultChecked: true },
};

export const RiscoDaDireita: Story = {
  args: { strike: "right", label: "Avisar o time no canal", defaultChecked: true },
};

export const SemRisco: Story = {
  args: { strike: "none", label: "Fechar o milestone", defaultChecked: true },
};

export const Tamanhos: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <StrikeCheckbox {...args} size="sm" label="Publicar a build (sm)" />
      <StrikeCheckbox {...args} label="Publicar a build (default)" />
      <StrikeCheckbox {...args} size="lg" label="Publicar a build (lg)" />
    </div>
  ),
};

export const Desabilitado: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <StrikeCheckbox {...args} />
    </MotionConfig>
  ),
};
