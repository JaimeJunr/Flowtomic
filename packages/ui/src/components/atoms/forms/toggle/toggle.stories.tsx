import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import React from "react";
import { Bold } from "lucide-react";
import { Toggle } from "./toggle";

/**
 * Stories do componente Toggle.
 *
 * O Toggle é um botão de alternância usado para ativar ou desativar uma opção.
 * Diferente do Switch, o Toggle mantém estado visual quando pressionado.
 * É baseado em Radix UI para garantir acessibilidade completa.
 *
 * @see [Toggle Component](../toggle.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Botão de alternância que mantém estado visual quando pressionado. Suporta variantes (default, outline) e tamanhos (default, sm, lg).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "Variante visual do toggle",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
      description: "Tamanho do toggle",
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Toggle.
 * Demonstra o uso básico com ícone.
 */
export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <Bold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle bold" });
    await expect(toggle).toBeInTheDocument();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  },
};

/**
 * Story demonstrando Toggle com texto.
 * O toggle pode conter texto em vez de ícone.
 */
export const WithText: Story = {
  render: () => (
    <Toggle aria-label="Toggle italic">
      <span>Italic</span>
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle italic" });
    await expect(toggle).toHaveTextContent("Italic");
  },
};

/**
 * Story demonstrando Toggle com variante outline.
 * A variante outline adiciona uma borda ao toggle.
 */
export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="Toggle underline">
      <span>Underline</span>
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle underline" });
    await expect(toggle).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Toggle com tamanho pequeno.
 * O tamanho sm reduz o tamanho do toggle.
 */
export const Small: Story = {
  render: () => (
    <Toggle size="sm" aria-label="Toggle small">
      <Bold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle small" });
    await expect(toggle).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Toggle com tamanho grande.
 * O tamanho lg aumenta o tamanho do toggle.
 */
export const Large: Story = {
  render: () => (
    <Toggle size="lg" aria-label="Toggle large">
      <Bold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Toggle large" });
    await expect(toggle).toBeInTheDocument();
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
