import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Progress } from "./progress";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 100, step: 1 },
      description: "Valor atual do progresso (0-100)",
    },
    max: {
      control: { type: "number", min: 1 },
      description: "Valor máximo do progresso",
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    max: 100,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    max: 100,
  },
};

export const Full: Story = {
  args: {
    value: 100,
    max: 100,
  },
};

export const Quarter: Story = {
  args: {
    value: 25,
    max: 100,
  },
};

export const ThreeQuarters: Story = {
  args: {
    value: 75,
    max: 100,
  },
};

export const CustomMax: Story = {
  args: {
    value: 50,
    max: 200,
  },
};

export const ContextStyle: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-2">
      <Progress className="bg-muted" value={65} />
      <p className="text-xs text-muted-foreground">65% usado</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Progress como no Context, usado para exibir percentual de uso com background muted.",
      },
    },
  },
};
