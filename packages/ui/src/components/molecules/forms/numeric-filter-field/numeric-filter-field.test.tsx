import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  NumericFilterField,
  type NumericFilterFieldProps,
  type NumericFilterValue,
} from "./numeric-filter-field";

function Controlled(props: Partial<NumericFilterFieldProps> & { spy?: (v: unknown) => void }) {
  const [value, setValue] = useState<NumericFilterValue | null>(null);
  return (
    <NumericFilterField
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.spy?.(next);
      }}
    />
  );
}

describe("NumericFilterField", () => {
  describe("Nomes acessíveis", () => {
    it("o operador e o valor têm nome, mesmo sem placeholder", () => {
      render(<Controlled />);
      expect(screen.getByRole("combobox", { name: "Operador" })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: "Valor" })).toBeInTheDocument();
    });

    it("o placeholder vira o nome do valor quando passado", () => {
      render(<Controlled placeholder="Patrimônio líquido" />);
      expect(screen.getByRole("textbox", { name: "Patrimônio líquido" })).toBeInTheDocument();
    });

    it("com erro, o campo avisa o leitor de tela", () => {
      render(<Controlled error />);
      expect(screen.getByRole("textbox", { name: "Valor" })).toHaveAttribute(
        "aria-invalid",
        "true"
      );
      expect(screen.getByRole("combobox", { name: "Operador" })).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });
  });

  describe("Valor", () => {
    it("moeda em BRL vira número com vírgula decimal", async () => {
      const spy = vi.fn();
      render(<Controlled isCurrency currency="BRL" spy={spy} />);
      await userEvent.type(screen.getByRole("textbox", { name: "Valor" }), "1234,56");
      expect(spy).toHaveBeenLastCalledWith({ operator: "eq", value: 1234.56 });
    });

    it("apagar tudo devolve valor nulo, não zero", async () => {
      const spy = vi.fn();
      render(<Controlled spy={spy} />);
      const field = screen.getByRole("textbox", { name: "Valor" });
      await userEvent.type(field, "7");
      await userEvent.clear(field);
      expect(spy).toHaveBeenLastCalledWith({ operator: "eq", value: null });
    });
  });
});
