import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Input } from "../input/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

/**
 * Stories do componente Field.
 *
 * O Field é um componente de composição para campos de formulário.
 * Fornece estrutura semântica com label, descrição, input e mensagem de erro.
 *
 * @see [Field Component](../field.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/Field",
  component: Field,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente de composição para campos de formulário. Fornece estrutura semântica com label, descrição, input e mensagem de erro.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Orientação do campo (vertical ou horizontal)",
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Field.
 * Demonstra o uso básico com label, descrição e input.
 */
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="email">E-mail</FieldLabel>
      <FieldDescription>Digite seu endereço de e-mail</FieldDescription>
      <Input id="email" type="email" placeholder="email@exemplo.com" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("E-mail");
    const input = canvas.getByPlaceholderText("email@exemplo.com");
    const description = canvas.getByText("Digite seu endereço de e-mail");

    await expect(label).toBeInTheDocument();
    await expect(input).toBeInTheDocument();
    await expect(description).toBeInTheDocument();

    // Testa que clicar no label foca o input
    await userEvent.click(label);
    await expect(input).toHaveFocus();
  },
};

/**
 * Story demonstrando Field com mensagem de erro.
 * O campo exibe uma mensagem de erro quando há validação falha.
 */
export const WithError: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="email-error">E-mail</FieldLabel>
      <FieldDescription>Digite seu endereço de e-mail</FieldDescription>
      <Input id="email-error" type="email" placeholder="email@exemplo.com" variant="error" />
      <FieldError>Este e-mail é inválido</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const errorMessage = canvas.getByText("Este e-mail é inválido");
    await expect(errorMessage).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Field com orientação horizontal.
 * O label e o input são exibidos lado a lado.
 */
export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="name-h">Nome</FieldLabel>
      <Input id="name-h" type="text" placeholder="Seu nome" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Nome");
    const input = canvas.getByPlaceholderText("Seu nome");

    await expect(label).toBeInTheDocument();
    await expect(input).toBeInTheDocument();
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
