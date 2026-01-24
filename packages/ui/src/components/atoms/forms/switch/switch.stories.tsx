import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Switch } from "./switch";

/**
 * Stories do componente Switch.
 *
 * O Switch é um controle de alternância usado para ativar ou desativar uma opção.
 * É baseado em Radix UI para garantir acessibilidade completa.
 *
 * @see [Switch Component](../switch.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Controle de alternância para ativar/desativar opções. Suporta estados checked/unchecked e disabled.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Estado checked do switch",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o switch",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Switch.
 * Demonstra o uso básico com estado não marcado.
 */
export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} aria-label="Toggle" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch", { name: "Toggle" });
    await expect(switchElement).toBeInTheDocument();
    await expect(switchElement).not.toBeChecked();
  },
};

/**
 * Story demonstrando Switch no estado checked.
 * O switch está marcado por padrão.
 */
export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} aria-label="Toggle checked" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch", { name: "Toggle checked" });
    await expect(switchElement).toBeChecked();
  },
};

/**
 * Story demonstrando Switch com label associado.
 * O label fornece contexto sobre o que o switch controla.
 */
export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center gap-2">
        <Switch id="notifications" checked={checked} onCheckedChange={setChecked} />
        <label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
          Receber notificações
        </label>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    const label = canvas.getByText("Receber notificações");

    await expect(switchElement).toBeInTheDocument();
    await expect(label).toBeInTheDocument();

    // Testa que clicar no label alterna o switch
    await userEvent.click(label);
    await expect(switchElement).toBeChecked();
  },
};

/**
 * Story demonstrando Switch desabilitado no estado unchecked.
 * O switch não pode ser alternado quando está desabilitado.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <Switch {...args} aria-label="Disabled switch" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch", { name: "Disabled switch" });
    await expect(switchElement).toBeDisabled();
  },
};

/**
 * Story demonstrando Switch desabilitado no estado checked.
 * O switch está marcado mas não pode ser alterado.
 */
export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
  render: (args) => <Switch {...args} aria-label="Disabled checked switch" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch", { name: "Disabled checked switch" });
    await expect(switchElement).toBeDisabled();
    await expect(switchElement).toBeChecked();
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
