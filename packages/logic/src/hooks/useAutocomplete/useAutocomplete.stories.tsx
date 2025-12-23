import type { Meta, StoryObj } from "@storybook/react-vite";
import { useAutocomplete } from "./index";

/**
 * Story demonstrando o uso do hook useAutocomplete
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useAutocomplete",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica e estado para autocomplete. Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 */
function AutocompleteDemo({
  options,
  placeholder = "Digite para buscar...",
}: {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}) {
  const {
    selectedValue,
    isOpen,
    filteredItems,
    getInputProps,
    getPopoverProps,
    getListProps,
    getItemProps,
    clear,
  } = useAutocomplete({
    options,
  });

  return (
    <div className="relative w-80">
      <div className="relative">
        <input
          {...getInputProps()}
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {selectedValue && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && (
        <div
          {...getPopoverProps()}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
        >
          {filteredItems.length > 0 ? (
            <ul {...getListProps()} className="max-h-60 overflow-auto">
              {filteredItems.map((item) => (
                <li
                  key={item.value}
                  {...getItemProps(item)}
                  className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          )}
        </div>
      )}
      {selectedValue && (
        <p className="mt-2 text-xs text-muted-foreground">
          Selecionado: <strong>{selectedValue}</strong>
        </p>
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <AutocompleteDemo
      options={[
        { value: "1", label: "Apple" },
        { value: "2", label: "Banana" },
        { value: "3", label: "Cherry" },
        { value: "4", label: "Date" },
        { value: "5", label: "Elderberry" },
      ]}
    />
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <AutocompleteDemo
      options={[
        { value: "1", label: "Apple" },
        { value: "2", label: "Banana", disabled: true },
        { value: "3", label: "Cherry" },
        { value: "4", label: "Date", disabled: true },
        { value: "5", label: "Elderberry" },
      ]}
    />
  ),
};

export const WithCustomFilter: Story = {
  render: () => {
    const customFilter = (option: { value: string; label: string }, searchTerm: string) => {
      return option.label.toLowerCase().startsWith(searchTerm.toLowerCase());
    };

    const { isOpen, filteredItems, getInputProps, getPopoverProps, getListProps, getItemProps } =
      useAutocomplete({
        options: [
          { value: "1", label: "Apple" },
          { value: "2", label: "Banana" },
          { value: "3", label: "Cherry" },
          { value: "4", label: "Date" },
          { value: "5", label: "Elderberry" },
        ],
        filterFunction: customFilter,
      });

    return (
      <div className="relative w-80">
        <input
          {...getInputProps()}
          placeholder="Digite para buscar (filtro: começa com)..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {isOpen && (
          <div
            {...getPopoverProps()}
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
          >
            {filteredItems.length > 0 ? (
              <ul {...getListProps()} className="max-h-60 overflow-auto">
                {filteredItems.map((item) => (
                  <li
                    key={item.value}
                    {...getItemProps(item)}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
};

export const WithLoading: Story = {
  render: () => {
    const {
      isOpen,
      filteredItems,
      isLoading,
      getInputProps,
      getPopoverProps,
      getListProps,
      getItemProps,
    } = useAutocomplete({
      options: [
        { value: "1", label: "Apple" },
        { value: "2", label: "Banana" },
        { value: "3", label: "Cherry" },
      ],
      isLoading: true,
    });

    return (
      <div className="relative w-80">
        <input
          {...getInputProps()}
          placeholder="Carregando opções..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {isOpen && (
          <div
            {...getPopoverProps()}
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
          >
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Carregando...</div>
            ) : filteredItems.length > 0 ? (
              <ul {...getListProps()} className="max-h-60 overflow-auto">
                {filteredItems.map((item) => (
                  <li
                    key={item.value}
                    {...getItemProps(item)}
                    className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado encontrado
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
};

export const AllowCustomValue: Story = {
  render: () => {
    const {
      selectedValue,
      isOpen,
      filteredItems,
      getInputProps,
      getPopoverProps,
      getListProps,
      getItemProps,
      clear,
    } = useAutocomplete({
      options: [
        { value: "1", label: "Apple" },
        { value: "2", label: "Banana" },
        { value: "3", label: "Cherry" },
      ],
      allowCustomValue: true,
    });

    return (
      <div className="relative w-80">
        <div className="relative">
          <input
            {...getInputProps()}
            placeholder="Digite ou selecione..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {selectedValue && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        {isOpen && filteredItems.length > 0 && (
          <div
            {...getPopoverProps()}
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
          >
            <ul {...getListProps()} className="max-h-60 overflow-auto">
              {filteredItems.map((item) => (
                <li
                  key={item.value}
                  {...getItemProps(item)}
                  className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedValue && (
          <p className="mt-2 text-xs text-muted-foreground">
            Selecionado: <strong>{selectedValue}</strong>
          </p>
        )}
      </div>
    );
  },
};
