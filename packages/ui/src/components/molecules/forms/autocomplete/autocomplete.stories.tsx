import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Autocomplete } from "./autocomplete";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/Autocomplete",
  component: Autocomplete,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    disabled: {
      control: "boolean",
    },
    isLoading: {
      control: "boolean",
    },
    allowCustomValue: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { value: "1", label: "Apple" },
  { value: "2", label: "Banana" },
  { value: "3", label: "Cherry" },
  { value: "4", label: "Date" },
  { value: "5", label: "Elderberry" },
  { value: "6", label: "Fig" },
  { value: "7", label: "Grape" },
  { value: "8", label: "Honeydew" },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Selecione uma fruta...",
  },
};

export const Small: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Selecione uma fruta...",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Selecione uma fruta...",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Selecione uma fruta...",
    disabled: true,
  },
};

export const WithDisabledItems: Story = {
  args: {
    options: [
      { value: "1", label: "Apple" },
      { value: "2", label: "Banana", disabled: true },
      { value: "3", label: "Cherry" },
      { value: "4", label: "Date", disabled: true },
      { value: "5", label: "Elderberry" },
    ],
    placeholder: "Selecione uma fruta...",
  },
};

export const WithScroll: Story = {
  args: {
    options: Array.from({ length: 50 }, (_, i) => ({
      value: String(i + 1),
      label: `Option ${i + 1}`,
    })),
    placeholder: "Selecione uma opção...",
    maxListboxHeight: "200px",
  },
};

export const With50Items: Story = {
  args: {
    options: Array.from({ length: 50 }, (_, i) => ({
      value: String(i + 1),
      label: `Opção ${i + 1}`,
    })),
    placeholder: "Selecione uma opção...",
    maxListboxHeight: "300px",
  },
};

export const WithCustomEmptyMessage: Story = {
  args: {
    options: [],
    placeholder: "Digite para buscar...",
    emptyMessage: "Nenhuma opção disponível no momento.",
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("2");

    return (
      <div className="space-y-4 w-80">
        <Autocomplete
          options={defaultOptions}
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

export const WithCustomFilter: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Digite para buscar (filtro: começa com)...",
    filterFunction: (option, searchTerm) => {
      return option.label.toLowerCase().startsWith(searchTerm.toLowerCase());
    },
  },
};

export const AllowCustomValue: Story = {
  args: {
    options: defaultOptions,
    placeholder: "Digite ou selecione...",
    allowCustomValue: true,
  },
};

export const WithDefaultValue: Story = {
  args: {
    options: defaultOptions,
    defaultValue: "3",
    placeholder: "Selecione uma fruta...",
  },
};

export const AsynchronousLoading: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<typeof defaultOptions>([]);

    const handleInputChange = () => {
      setIsLoading(true);
      setTimeout(() => {
        setOptions(defaultOptions);
        setIsLoading(false);
      }, 1500);
    };

    return (
      <Autocomplete
        options={options}
        placeholder="Digite para buscar (simula loading)..."
        isLoading={isLoading}
        onFocus={handleInputChange}
      />
    );
  },
};

export const WithMaxHeight: Story = {
  args: {
    options: Array.from({ length: 20 }, (_, i) => ({
      value: String(i + 1),
      label: `Option ${i + 1}`,
    })),
    placeholder: "Selecione uma opção...",
    maxListboxHeight: "150px",
  },
};

export const FullyControlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
      <div className="space-y-4 w-80">
        <Autocomplete
          options={defaultOptions}
          value={value}
          onValueChange={setValue}
          placeholder="Selecione uma fruta..."
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setValue("1")}
            className="px-3 py-1 text-sm border rounded"
          >
            Selecionar Apple
          </button>
          <button
            type="button"
            onClick={() => setValue(undefined)}
            className="px-3 py-1 text-sm border rounded"
          >
            Limpar
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Valor: <strong>{value || "Nenhum"}</strong>
        </p>
      </div>
    );
  },
};

// Stories de composição
export const CompositionSimple: Story = {
  render: () => {
    return (
      <Autocomplete placeholder="Selecione uma fruta...">
        <Autocomplete.List>
          <Autocomplete.Item value="1">Apple</Autocomplete.Item>
          <Autocomplete.Item value="2">Banana</Autocomplete.Item>
          <Autocomplete.Item value="3">Cherry</Autocomplete.Item>
          <Autocomplete.Item value="4">Date</Autocomplete.Item>
        </Autocomplete.List>
      </Autocomplete>
    );
  },
};

export const CompositionWithSections: Story = {
  render: () => {
    return (
      <Autocomplete placeholder="Selecione uma opção...">
        <Autocomplete.List>
          <Autocomplete.Section title="Frutas">
            <Autocomplete.Item value="1">Apple</Autocomplete.Item>
            <Autocomplete.Item value="2">Banana</Autocomplete.Item>
            <Autocomplete.Item value="3">Cherry</Autocomplete.Item>
          </Autocomplete.Section>
          <Autocomplete.Section title="Vegetais">
            <Autocomplete.Item value="4">Carrot</Autocomplete.Item>
            <Autocomplete.Item value="5">Lettuce</Autocomplete.Item>
            <Autocomplete.Item value="6">Tomato</Autocomplete.Item>
          </Autocomplete.Section>
        </Autocomplete.List>
      </Autocomplete>
    );
  },
};

export const CompositionWithCustomContent: Story = {
  render: () => {
    return (
      <Autocomplete placeholder="Selecione uma opção...">
        <Autocomplete.List>
          <Autocomplete.Item value="1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Apple</span>
              <span className="text-xs text-muted-foreground">Fruta</span>
            </div>
          </Autocomplete.Item>
          <Autocomplete.Item value="2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Banana</span>
              <span className="text-xs text-muted-foreground">Fruta</span>
            </div>
          </Autocomplete.Item>
        </Autocomplete.List>
      </Autocomplete>
    );
  },
};

export const CompositionWithStates: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasItems, setHasItems] = useState(true);

    return (
      <div className="space-y-4 w-80">
        <Autocomplete placeholder="Selecione uma opção..." isLoading={isLoading}>
          {isLoading ? (
            <Autocomplete.Loading />
          ) : hasItems ? (
            <Autocomplete.List>
              <Autocomplete.Item value="1">Apple</Autocomplete.Item>
              <Autocomplete.Item value="2">Banana</Autocomplete.Item>
              <Autocomplete.Item value="3">Cherry</Autocomplete.Item>
            </Autocomplete.List>
          ) : (
            <Autocomplete.Empty>Nenhuma opção disponível</Autocomplete.Empty>
          )}
        </Autocomplete>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                setHasItems(true);
              }, 1500);
            }}
            className="px-3 py-1 text-sm border rounded"
          >
            Simular Loading
          </button>
          <button
            type="button"
            onClick={() => setHasItems(!hasItems)}
            className="px-3 py-1 text-sm border rounded"
          >
            Toggle Items
          </button>
        </div>
      </div>
    );
  },
};
