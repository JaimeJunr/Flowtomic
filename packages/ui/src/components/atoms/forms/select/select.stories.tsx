/**
 * # Select Component Stories
 *
 * Stories do componente Select demonstrando uso básico, grupos, labels, scroll e casos de uso.
 *
 * ## Características
 *
 * - **Composição**: Múltiplos sub-componentes
 * - **Grupos e Labels**: Organização visual
 * - **Scroll**: Suporte a listas longas
 * - **Acessibilidade**: Navegação completa por teclado
 *
 * @see [Select Component](./select.tsx) para documentação completa do componente
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ## Exemplo Padrão
 *
 * Select básico com opções simples.
 */
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
        <SelectItem value="option2">Opção 2</SelectItem>
        <SelectItem value="option3">Opção 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * ## Tamanho Pequeno
 *
 * Select com tamanho pequeno, útil para espaços compactos.
 */
export const Small: Story = {
  render: () => (
    <Select defaultValue="option1">
      <SelectTrigger size="sm" className="w-[180px]">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
        <SelectItem value="option2">Opção 2</SelectItem>
        <SelectItem value="option3">Opção 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * ## Com Grupos e Labels
 *
 * Select com grupos e labels para organização visual de opções.
 */
export const WithGroups: Story = {
  render: () => (
    <Select defaultValue="apple">
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecione uma fruta" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frutas</SelectLabel>
          <SelectItem value="apple">Maçã</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Laranja</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetais</SelectLabel>
          <SelectItem value="carrot">Cenoura</SelectItem>
          <SelectItem value="lettuce">Alface</SelectItem>
          <SelectItem value="tomato">Tomate</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

/**
 * ## Com Scroll
 *
 * Select com muitas opções demonstrando scroll automático.
 */
export const WithScroll: Story = {
  render: () => (
    <Select defaultValue="item1">
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecione um item" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 20 }, (_, i) => (
          <SelectItem key={`item${i + 1}`} value={`item${i + 1}`}>
            Item {i + 1}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

/**
 * ## Estado Desabilitado
 *
 * Select desabilitado, não interativo.
 */
export const Disabled: Story = {
  render: () => (
    <Select defaultValue="option1" disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
        <SelectItem value="option2">Opção 2</SelectItem>
        <SelectItem value="option3">Opção 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * ## Com Itens Desabilitados
 *
 * Select com algumas opções desabilitadas.
 */
export const WithDisabledItems: Story = {
  render: () => (
    <Select defaultValue="option1">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
        <SelectItem value="option2" disabled>
          Opção 2 (Desabilitada)
        </SelectItem>
        <SelectItem value="option3">Opção 3</SelectItem>
        <SelectItem value="option4" disabled>
          Opção 4 (Desabilitada)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * ## Uso em Tabelas
 *
 * Exemplo de uso do Select para seleção de tamanho de página em tabelas.
 */
export const PageSizeSelector: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <label htmlFor="page-size" className="text-sm text-muted-foreground">
        Mostrar
      </label>
      <Select defaultValue="20">
        <SelectTrigger id="page-size" size="sm" className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
          <SelectItem value="200">200</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * ## Uso em PromptInput
 *
 * Exemplo de uso do Select em contexto de PromptInput para seleção de modelo.
 */
export const PromptInputStyle: Story = {
  render: () => (
    <Select defaultValue="gpt-4">
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gpt-4">GPT-4</SelectItem>
        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
        <SelectItem value="claude">Claude</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Select como no PromptInput, usado para seleção de modelo com largura fixa e sem placeholder visível.",
      },
    },
  },
};

/**
 * ## Teste de Acessibilidade
 *
 * Valida que o Select é renderizado corretamente e possui estrutura acessível.
 */
export const Accessibility: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
        <SelectItem value="option2">Opção 2</SelectItem>
        <SelectItem value="option3">Opção 3</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Teste de acessibilidade do Select. Valida renderização e estrutura básica do componente.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
  },
};
