import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { UndoFuseButton } from "./undo-fuse-button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/UndoFuseButton",
  component: UndoFuseButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Ação feita na hora, com janela para desfazer: um pavio queima na borda enquanto o botão vira Desfazer. Passar o mouse pausa o pavio.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    fuse: { control: "inline-radio", options: ["outline", "bottom", "top"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    commitOn: { control: "inline-radio", options: ["press", "fuseEnd"] },
    settle: { control: "inline-radio", options: ["reset", "stay"] },
    undoWindowMs: { control: "number" },
    pauseOnHover: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Arquivar conciliação",
    undoLabel: "Desfazer",
    doneLabel: "Conciliação arquivada",
    onCommit: fn(),
    onUndo: fn(),
    onFuseEnd: fn(),
  },
} satisfies Meta<typeof UndoFuseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PavioEmbaixo: Story = { args: { fuse: "bottom" } };

export const ConfirmaNoFim: Story = {
  args: { commitOn: "fuseEnd", label: "Arquivar ao fim do prazo" },
};

export const FicaFeito: Story = { args: { settle: "stay" } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <UndoFuseButton {...args} size="sm" />
      <UndoFuseButton {...args} size="default" />
      <UndoFuseButton {...args} size="lg" />
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <UndoFuseButton {...args} />
    </MotionConfig>
  ),
};
