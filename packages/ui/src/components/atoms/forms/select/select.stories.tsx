import type { Meta, StoryObj } from "@storybook/react-vite";
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
 * Select básico com opções simples
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
 * Select com tamanho pequeno
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
 * Select com grupos e labels
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
 * Select com muitas opções (scroll)
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
 * Select desabilitado
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
 * Select com opções desabilitadas
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
 * Select para seleção de tamanho de página (exemplo de uso em tabelas)
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
