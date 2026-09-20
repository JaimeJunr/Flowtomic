import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { NumericFilterField, type NumericFilterValue } from "./numeric-filter-field";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/NumericFilterField",
  component: NumericFilterField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Campo de filtro numérico com operador (=, >, <, ≥, ≤) e valor formatado. Suporta número, moeda (BRL) e percentual.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    allowNegative: { control: "boolean" },
    isCurrency: { control: "boolean" },
    isPercent: { control: "boolean" },
    currency: { control: "select", options: [undefined, "BRL"] },
    decimalScale: { control: "number" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
} satisfies Meta<typeof NumericFilterField>;

export default meta;
type Story = StoryObj<typeof meta>;

function NumericFilterFieldControlled(props: {
  initial?: NumericFilterValue | null;
  allowNegative?: boolean;
  isCurrency?: boolean;
  isPercent?: boolean;
  currency?: "BRL";
  decimalScale?: number;
}) {
  const [value, setValue] = useState<NumericFilterValue | null>(
    props.initial ?? { operator: "eq", value: null }
  );
  return (
    <div className="w-80">
      <NumericFilterField
        value={value}
        onChange={setValue}
        placeholder="Valor"
        allowNegative={props.allowNegative}
        isCurrency={props.isCurrency}
        isPercent={props.isPercent}
        currency={props.currency}
        decimalScale={props.decimalScale}
      />
      <p className="mt-2 text-xs text-muted-foreground">Valor: {JSON.stringify(value)}</p>
    </div>
  );
}

export const Default: Story = {
  render: () => <NumericFilterFieldControlled />,
};

export const Currency: Story = {
  render: () => (
    <NumericFilterFieldControlled
      isCurrency
      currency="BRL"
      decimalScale={2}
      initial={{ operator: "gte", value: 100.5 }}
    />
  ),
};

export const Percent: Story = {
  render: () => (
    <NumericFilterFieldControlled
      isPercent
      decimalScale={2}
      initial={{ operator: "lte", value: 50 }}
    />
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <NumericFilterField
        value={{ operator: "eq", value: null }}
        onChange={() => {}}
        placeholder="Campo com erro"
        error
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <NumericFilterField
        value={{ operator: "gt", value: 10 }}
        onChange={() => {}}
        placeholder="Desabilitado"
        disabled
      />
    </div>
  ),
};
