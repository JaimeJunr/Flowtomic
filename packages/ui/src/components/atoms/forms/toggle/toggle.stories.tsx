import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold } from "lucide-react";
import { Toggle } from "./toggle";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <Bold />
    </Toggle>
  ),
};

export const WithText: Story = {
  render: () => (
    <Toggle aria-label="Toggle italic">
      <span>Italic</span>
    </Toggle>
  ),
};

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="Toggle underline">
      <span>Underline</span>
    </Toggle>
  ),
};

export const Small: Story = {
  render: () => (
    <Toggle size="sm" aria-label="Toggle small">
      <Bold />
    </Toggle>
  ),
};

export const Large: Story = {
  render: () => (
    <Toggle size="lg" aria-label="Toggle large">
      <Bold />
    </Toggle>
  ),
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
