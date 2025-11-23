import type { Meta, StoryObj } from "@storybook/react-vite";
import { Command } from "lucide-react";
import { Kbd, KbdGroup } from "./kbd";

const meta = {
  title: "Flowtomic UI/Atoms/Display/Kbd",
  component: Kbd,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Ctrl",
  },
};

export const SingleKey: Story = {
  render: () => (
    <div className="flex gap-2">
      <Kbd>Ctrl</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>Alt</Kbd>
    </div>
  ),
};

export const Shortcut: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>
        <Command />
      </Kbd>
      <span>+</span>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

export const ComplexShortcut: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>Shift</Kbd>
      <span>+</span>
      <Kbd>P</Kbd>
    </KbdGroup>
  ),
};

export const InText: Story = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      Pressione <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> para abrir o menu de comandos.
    </p>
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
