import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Textarea } from "./textarea";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
    rows: {
      control: "number",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Digite sua mensagem...",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-96">
      <label htmlFor="message" className="text-sm font-medium">
        Mensagem
      </label>
      <Textarea id="message" placeholder="Digite sua mensagem..." />
    </div>
  ),
};

export const WithRows: Story = {
  args: {
    placeholder: "Digite uma mensagem longa...",
    rows: 5,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
    defaultValue: "Não pode editar",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Este é um texto pré-preenchido no textarea.",
  },
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
