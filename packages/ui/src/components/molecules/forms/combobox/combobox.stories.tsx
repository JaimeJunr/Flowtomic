import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Input com lista filtrável, em Base UI (primeiro componente da lib fora do Radix). Aceita seleção única ou múltipla com chips.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const cidades = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre",
  "Recife",
  "Salvador",
  "Fortaleza",
];

const regioes = [
  { value: "Sudeste", items: ["São Paulo", "Rio de Janeiro", "Belo Horizonte"] },
  { value: "Sul", items: ["Curitiba", "Porto Alegre"] },
  { value: "Nordeste", items: ["Recife", "Salvador", "Fortaleza"] },
];

function ListaDeCidades() {
  return (
    <>
      <ComboboxEmpty>Nenhuma cidade encontrada.</ComboboxEmpty>
      <ComboboxList>
        {(cidade: string) => (
          <ComboboxItem key={cidade} value={cidade}>
            {cidade}
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Combobox items={cidades}>
      <ComboboxInput aria-label="Cidade" placeholder="Buscar cidade" className="w-72" />
      <ComboboxContent>
        <ListaDeCidades />
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithClear: Story = {
  render: () => (
    <Combobox items={cidades} defaultValue="Curitiba">
      <ComboboxInput aria-label="Cidade" placeholder="Buscar cidade" showClear className="w-72" />
      <ComboboxContent>
        <ListaDeCidades />
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Combobox items={regioes}>
      <ComboboxInput aria-label="Cidade" placeholder="Buscar cidade" className="w-72" />
      <ComboboxContent>
        <ComboboxEmpty>Nenhuma cidade encontrada.</ComboboxEmpty>
        <ComboboxList>
          {(regiao: (typeof regioes)[number], index: number) => (
            <React.Fragment key={regiao.value}>
              <ComboboxGroup items={regiao.items}>
                <ComboboxLabel>{regiao.value}</ComboboxLabel>
                {regiao.items.map((cidade) => (
                  <ComboboxItem key={cidade} value={cidade}>
                    {cidade}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
              {index < regioes.length - 1 && <ComboboxSeparator />}
            </React.Fragment>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

function MultipleDemo() {
  const anchor = useComboboxAnchor();
  return (
    <Combobox multiple items={cidades} defaultValue={["Recife", "Salvador"]}>
      <ComboboxChips ref={anchor} className="w-96">
        <ComboboxValue>
          {(selecionadas: string[]) => (
            <React.Fragment>
              {selecionadas.map((cidade) => (
                <ComboboxChip key={cidade}>{cidade}</ComboboxChip>
              ))}
              <ComboboxChipsInput aria-label="Cidades" placeholder="Adicionar cidade" />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ListaDeCidades />
      </ComboboxContent>
    </Combobox>
  );
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
};

export const Disabled: Story = {
  render: () => (
    <Combobox items={cidades} defaultValue="Recife">
      <ComboboxInput aria-label="Cidade" placeholder="Buscar cidade" disabled className="w-72" />
      <ComboboxContent>
        <ListaDeCidades />
      </ComboboxContent>
    </Combobox>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Combobox items={cidades}>
      <ComboboxInput
        aria-label="Cidade"
        aria-invalid="true"
        placeholder="Selecione uma cidade"
        className="w-72"
      />
      <ComboboxContent>
        <ListaDeCidades />
      </ComboboxContent>
    </Combobox>
  ),
};
