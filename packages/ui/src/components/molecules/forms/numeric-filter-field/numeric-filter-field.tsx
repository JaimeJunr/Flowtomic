/**
 * NumericFilterField - Campo de filtro numérico com operador (eq, gt, lt, gte, lte)
 * e valor formatado. Suporta número, moeda (BRL) e percentual.
 */

import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../atoms";

export type NumericFilterOperator = "eq" | "gt" | "lt" | "gte" | "lte";

export interface NumericFilterValue {
  operator: NumericFilterOperator;
  value: number | null;
}

export interface NumericFilterFieldProps {
  /** Valor atual { operator, value } */
  value?: NumericFilterValue | null;
  /** Callback ao alterar */
  onChange: (value: NumericFilterValue) => void;
  /** Placeholder do campo numérico */
  placeholder?: string;
  /** Permitir negativos */
  allowNegative?: boolean;
  /** É moeda (ex.: 2 decimais, prefix R$) */
  isCurrency?: boolean;
  /** É percentual (suffix %) */
  isPercent?: boolean;
  /** Moeda: "BRL" para prefix "R$ " */
  currency?: "BRL";
  /** Casas decimais (para moeda usa 2) */
  decimalScale?: number;
  /** Desabilitado */
  disabled?: boolean;
  /** Classe do container */
  className?: string;
  /** Aplicar estilo de erro (borda destrutiva) */
  error?: boolean;
}

const defaultNumericValue: NumericFilterValue = {
  operator: "eq",
  value: null,
};

// Símbolo na tela, nome por extenso para o leitor de tela
const OPERATORS: { value: NumericFilterOperator; symbol: string; name: string }[] = [
  { value: "eq", symbol: "=", name: "igual a" },
  { value: "gt", symbol: ">", name: "maior que" },
  { value: "lt", symbol: "<", name: "menor que" },
  { value: "gte", symbol: "≥", name: "maior ou igual a" },
  { value: "lte", symbol: "≤", name: "menor ou igual a" },
];

const inputErrorClassName = "border-destructive focus-visible:ring-destructive";

export function NumericFilterField({
  value,
  onChange,
  placeholder,
  allowNegative = true,
  isCurrency,
  isPercent,
  currency,
  decimalScale,
  disabled,
  className,
  error,
}: NumericFilterFieldProps) {
  const current = value ?? defaultNumericValue;

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select
          value={current.operator ?? "eq"}
          onValueChange={(operator) => {
            onChange({
              ...current,
              operator: operator as NumericFilterOperator,
            });
          }}
          disabled={disabled}
        >
          <SelectTrigger
            aria-label="Operador"
            aria-invalid={error || undefined}
            className={cn("w-24 cursor-pointer shrink-0", error && inputErrorClassName)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPERATORS.map((op) => (
              <SelectItem key={op.value} value={op.value} aria-label={op.name}>
                <span className="font-mono">{op.symbol}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NumericFormat
          customInput={Input}
          placeholder={placeholder}
          aria-label={placeholder ?? "Valor"}
          aria-invalid={error || undefined}
          value={current.value ?? ""}
          maxLength={isCurrency ? undefined : 25}
          allowNegative={allowNegative}
          allowLeadingZeros={false}
          decimalScale={decimalScale ?? (isCurrency ? 2 : 20)}
          onValueChange={(values) => {
            const numericValue = values.value === "" ? null : (values.floatValue ?? null);
            onChange({
              ...current,
              value: numericValue,
            });
          }}
          className={cn("min-w-0 flex-1", error && inputErrorClassName)}
          fixedDecimalScale={!!isCurrency}
          decimalSeparator=","
          thousandSeparator="."
          suffix={isPercent ? " %" : undefined}
          prefix={currency === "BRL" ? "R$ " : undefined}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

NumericFilterField.displayName = "NumericFilterField";
