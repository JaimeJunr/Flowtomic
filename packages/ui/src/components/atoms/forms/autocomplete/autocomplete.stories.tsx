import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Autocomplete } from "./autocomplete";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Autocomplete",
  component: Autocomplete,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

const fruits = [
  { value: "apple", label: "Maçã" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Laranja" },
  { value: "grape", label: "Uva" },
  { value: "strawberry", label: "Morango" },
  { value: "watermelon", label: "Melancia" },
  { value: "pineapple", label: "Abacaxi" },
  { value: "mango", label: "Manga" },
];

const vegetables = [
  { value: "carrot", label: "Cenoura" },
  { value: "lettuce", label: "Alface" },
  { value: "tomato", label: "Tomate" },
  { value: "cucumber", label: "Pepino" },
  { value: "broccoli", label: "Brócolis" },
];

const allOptions = [...fruits, ...vegetables];

/**
 * Autocomplete básico com opções simples
 */
export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <Autocomplete options={fruits} placeholder="Selecione uma fruta..." />
    </div>
  ),
};

/**
 * Autocomplete com tamanho pequeno
 */
export const Small: Story = {
  render: () => (
    <div className="w-[300px]">
      <Autocomplete options={fruits} placeholder="Selecione uma fruta..." size="sm" />
    </div>
  ),
};

/**
 * Autocomplete com tamanho grande
 */
export const Large: Story = {
  render: () => (
    <div className="w-[300px]">
      <Autocomplete options={fruits} placeholder="Selecione uma fruta..." size="lg" />
    </div>
  ),
};

/**
 * Autocomplete desabilitado
 */
export const Disabled: Story = {
  render: () => (
    <div className="w-[300px]">
      <Autocomplete options={fruits} placeholder="Selecione uma fruta..." disabled />
    </div>
  ),
};

/**
 * Autocomplete com opções desabilitadas
 */
export const WithDisabledItems: Story = {
  render: () => {
    const optionsWithDisabled = [
      { value: "apple", label: "Maçã" },
      { value: "banana", label: "Banana", disabled: true },
      { value: "orange", label: "Laranja" },
      { value: "grape", label: "Uva", disabled: true },
    ];

    return (
      <div className="w-[300px]">
        <Autocomplete options={optionsWithDisabled} placeholder="Selecione uma fruta..." />
      </div>
    );
  },
};

/**
 * Autocomplete com muitas opções (scroll)
 */
export const WithScroll: Story = {
  render: () => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      value: `item${i + 1}`,
      label: `Item ${i + 1}`,
    }));

    return (
      <div className="w-[300px]">
        <Autocomplete options={items} placeholder="Selecione um item..." />
      </div>
    );
  },
};

/**
 * Autocomplete com mensagem de "sem resultados" customizada
 */
export const WithCustomEmptyMessage: Story = {
  render: () => (
    <div className="w-[300px]">
      <Autocomplete
        options={[]}
        placeholder="Digite para buscar..."
        emptyMessage="Nenhum resultado encontrado. Tente outra busca."
      />
    </div>
  ),
};

/**
 * Autocomplete controlado com estado
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("apple");

    return (
      <div className="space-y-2 w-[300px]">
        <Autocomplete
          options={fruits}
          value={value}
          onValueChange={setValue}
          placeholder="Selecione uma fruta..."
        />
        <p className="text-sm text-muted-foreground">
          Valor selecionado: <strong>{value || "Nenhum"}</strong>
        </p>
      </div>
    );
  },
};

/**
 * Autocomplete com filtro customizado (busca)
 */
export const WithCustomFilter: Story = {
  render: () => {
    const customFilter = (option: { value: string; label: string }, searchTerm: string) => {
      // Busca apenas no início do texto
      return option.label.toLowerCase().startsWith(searchTerm.toLowerCase());
    };

    return (
      <div className="w-[300px]">
        <Autocomplete
          options={fruits}
          placeholder="Digite para buscar (início)..."
          filterFunction={customFilter}
        />
      </div>
    );
  },
};

/**
 * Autocomplete que permite valores customizados
 */
export const AllowCustomValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>();

    return (
      <div className="space-y-2 w-[300px]">
        <Autocomplete
          options={fruits}
          value={value}
          onValueChange={setValue}
          placeholder="Digite ou selecione..."
          allowCustomValue
        />
        <p className="text-sm text-muted-foreground">
          Valor: <strong>{value || "Nenhum"}</strong>
        </p>
      </div>
    );
  },
};

/**
 * Autocomplete com valor padrão
 */
export const WithDefaultValue: Story = {
  render: () => (
    <div className="w-[300px]">
      <Autocomplete options={fruits} defaultValue="banana" placeholder="Selecione uma fruta..." />
    </div>
  ),
};

/**
 * Autocomplete com todas as opções (frutas e vegetais)
 */
export const WithAllOptions: Story = {
  render: () => (
    <div className="w-[300px]">
      <Autocomplete options={allOptions} placeholder="Selecione fruta ou vegetal..." />
    </div>
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
