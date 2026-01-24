import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import React from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";

/**
 * Stories do componente RadioGroup.
 *
 * O RadioGroup é um grupo de botões de opção usado para permitir que o usuário
 * selecione uma opção de um conjunto. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * @see [RadioGroup Component](../radio-group.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Grupo de botões de opção para seleção única. Suporta navegação por teclado e acessibilidade completa via Radix UI.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Valor padrão selecionado",
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do RadioGroup.
 * Demonstra o uso básico com duas opções.
 */
export const Default: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm font-medium cursor-pointer">
          Opção 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-sm font-medium cursor-pointer">
          Opção 2
        </label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option1 = canvas.getByLabelText("Opção 1");
    const option2 = canvas.getByLabelText("Opção 2");

    await expect(option1).toBeInTheDocument();
    await expect(option2).toBeInTheDocument();

    // Testa seleção
    await userEvent.click(option1);
    await expect(option1).toBeChecked();
    await expect(option2).not.toBeChecked();
  },
};

/**
 * Story demonstrando RadioGroup em layout horizontal.
 * As opções são exibidas lado a lado usando flexbox.
 */
export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" className="flex gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="h-option1" />
        <label htmlFor="h-option1" className="text-sm font-medium cursor-pointer">
          Opção 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="h-option2" />
        <label htmlFor="h-option2" className="text-sm font-medium cursor-pointer">
          Opção 2
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="h-option3" />
        <label htmlFor="h-option3" className="text-sm font-medium cursor-pointer">
          Opção 3
        </label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option1 = canvas.getByLabelText("Opção 1");
    await expect(option1).toBeChecked();
  },
};

/**
 * Story demonstrando RadioGroup com opção desabilitada.
 * Uma das opções está desabilitada e não pode ser selecionada.
 */
export const WithDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="d-option1" />
        <label htmlFor="d-option1" className="text-sm font-medium cursor-pointer">
          Opção 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="d-option2" disabled />
        <label htmlFor="d-option2" className="text-sm font-medium cursor-pointer opacity-50">
          Opção 2 (Desabilitada)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="d-option3" />
        <label htmlFor="d-option3" className="text-sm font-medium cursor-pointer">
          Opção 3
        </label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option1 = canvas.getByLabelText("Opção 1");
    const option2 = canvas.getByLabelText("Opção 2 (Desabilitada)");

    await expect(option1).toBeChecked();
    await expect(option2).toBeDisabled();
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
