/**
 * # NativeSelect Component Stories
 *
 * Select nativo do navegador, com o mesmo visual do Select (Radix).
 *
 * ## Características
 *
 * - **Nativo**: usa o seletor do sistema (ótimo no mobile)
 * - **Tamanhos**: `default` e `sm`
 * - **Grupos**: suporte a `optgroup`
 * - **Estados**: desabilitado e inválido
 *
 * @see [NativeSelect Component](./native-select.tsx) para documentação completa do componente
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/NativeSelect",
  component: NativeSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description: "Altura do controle",
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <NativeSelect aria-label="Moeda" defaultValue="brl" {...args}>
      <NativeSelectOption value="brl">Real (BRL)</NativeSelectOption>
      <NativeSelectOption value="usd">Dólar (USD)</NativeSelectOption>
      <NativeSelectOption value="eur">Euro (EUR)</NativeSelectOption>
    </NativeSelect>
  ),
};

export const Small: Story = {
  args: { size: "sm" },
  render: (args) => (
    <NativeSelect aria-label="Itens por página" defaultValue="25" {...args}>
      <NativeSelectOption value="10">10 por página</NativeSelectOption>
      <NativeSelectOption value="25">25 por página</NativeSelectOption>
      <NativeSelectOption value="50">50 por página</NativeSelectOption>
    </NativeSelect>
  ),
};

export const WithGroups: Story = {
  render: (args) => (
    <NativeSelect aria-label="Cidade" defaultValue="" {...args}>
      <NativeSelectOption value="" disabled>
        Selecione a cidade
      </NativeSelectOption>
      <NativeSelectOptGroup label="Sudeste">
        <NativeSelectOption value="sp">São Paulo</NativeSelectOption>
        <NativeSelectOption value="rj">Rio de Janeiro</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Sul">
        <NativeSelectOption value="poa">Porto Alegre</NativeSelectOption>
        <NativeSelectOption value="cwb">Curitiba</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <NativeSelect aria-label="Moeda" defaultValue="brl" {...args}>
      <NativeSelectOption value="brl">Real (BRL)</NativeSelectOption>
      <NativeSelectOption value="usd">Dólar (USD)</NativeSelectOption>
    </NativeSelect>
  ),
};

export const Invalid: Story = {
  args: { "aria-invalid": true },
  render: (args) => (
    <NativeSelect aria-label="Moeda" defaultValue="" {...args}>
      <NativeSelectOption value="" disabled>
        Escolha uma moeda
      </NativeSelectOption>
      <NativeSelectOption value="brl">Real (BRL)</NativeSelectOption>
      <NativeSelectOption value="usd">Dólar (USD)</NativeSelectOption>
    </NativeSelect>
  ),
};
