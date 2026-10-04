import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
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

describe("NumericFilterField: operador, formatos e estados", () => {
  it("escolher outro operador avisa onChange mantendo o valor digitado", async () => {
    const user = userEvent.setup({ skipHover: true });
    const spy = vi.fn();
    render(<Controlled spy={spy} />);
    await user.type(screen.getByRole("textbox", { name: "Valor" }), "10");

    await user.click(screen.getByRole("combobox", { name: "Operador" }));
    await user.click(await screen.findByRole("option", { name: "maior ou igual a" }));

    expect(spy).toHaveBeenLastCalledWith({ operator: "gte", value: 10 });
    expect(screen.getByRole("combobox", { name: "Operador" })).toHaveTextContent("≥");
  });

  it("lista os cinco operadores com nome por extenso", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<Controlled />);
    await user.click(screen.getByRole("combobox", { name: "Operador" }));
    const opcoes = await screen.findAllByRole("option");
    const nomes = ["igual a", "maior que", "menor que", "maior ou igual a", "menor ou igual a"];
    expect(opcoes).toHaveLength(nomes.length);
    opcoes.forEach((opcao, i) => {
      expect(opcao).toHaveAccessibleName(nomes[i]);
    });
  });

  it("cada opção de operador é anunciada pelo nome por extenso (ex.: maior ou igual a)", async () => {
    const user = userEvent.setup({ skipHover: true });
    render(<Controlled />);
    await user.click(screen.getByRole("combobox", { name: "Operador" }));
    expect(await screen.findByRole("option", { name: "maior ou igual a" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "igual a" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "≥" })).not.toBeInTheDocument();
  });

  it("o operador pode ser trocado pelo teclado", async () => {
    const user = userEvent.setup({ skipHover: true });
    const spy = vi.fn();
    render(<Controlled spy={spy} />);
    screen.getByRole("combobox", { name: "Operador" }).focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("option", { name: "menor que" }));
    expect(spy).toHaveBeenLastCalledWith({ operator: "lt", value: null });
  });

  it("mostra o valor e o operador recebidos em value", () => {
    render(<NumericFilterField value={{ operator: "lte", value: 42 }} onChange={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "Valor" })).toHaveValue("42");
    expect(screen.getByRole("combobox", { name: "Operador" })).toHaveTextContent("≤");
  });

  it("percentual mostra o sufixo e devolve o número puro", async () => {
    const spy = vi.fn();
    render(<Controlled isPercent spy={spy} />);
    const campo = screen.getByRole("textbox", { name: "Valor" });
    await userEvent.type(campo, "15,5");
    expect(campo).toHaveValue("15,5 %");
    expect(spy).toHaveBeenLastCalledWith({ operator: "eq", value: 15.5 });
  });

  it("moeda mostra o prefixo R$ e sempre duas casas decimais", async () => {
    render(
      <NumericFilterField
        value={{ operator: "eq", value: 1234.5 }}
        onChange={vi.fn()}
        isCurrency
        currency="BRL"
      />
    );
    expect(screen.getByRole("textbox", { name: "Valor" })).toHaveValue("R$ 1.234,50");
  });

  it("allowNegative falso ignora o sinal de menos", async () => {
    const spy = vi.fn();
    render(<Controlled allowNegative={false} spy={spy} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Valor" }), "-8");
    expect(spy).toHaveBeenLastCalledWith({ operator: "eq", value: 8 });
  });

  it("aceita negativo por padrão", async () => {
    const spy = vi.fn();
    render(<Controlled spy={spy} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Valor" }), "-8");
    expect(spy).toHaveBeenLastCalledWith({ operator: "eq", value: -8 });
  });

  it("decimalScale limita as casas decimais digitadas", async () => {
    const spy = vi.fn();
    render(<Controlled decimalScale={1} spy={spy} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Valor" }), "1,234");
    expect(spy).toHaveBeenLastCalledWith({ operator: "eq", value: 1.2 });
  });

  it("agrupa milhares com ponto", async () => {
    render(<Controlled />);
    const campo = screen.getByRole("textbox", { name: "Valor" });
    await userEvent.type(campo, "1234567");
    expect(campo).toHaveValue("1.234.567");
  });

  it("desabilitado bloqueia o operador e o valor", async () => {
    const spy = vi.fn();
    render(<Controlled disabled spy={spy} />);
    expect(screen.getByRole("combobox", { name: "Operador" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Valor" })).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox", { name: "Valor" }), "5");
    expect(spy).not.toHaveBeenCalled();
  });

  it("com erro, as bordas ficam em tom destrutivo; sem erro, não", () => {
    const { rerender } = render(<Controlled />);
    expect(screen.getByRole("textbox", { name: "Valor" })).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("textbox", { name: "Valor" }).className).not.toContain(
      "border-destructive"
    );
    rerender(<Controlled error />);
    expect(screen.getByRole("textbox", { name: "Valor" }).className).toContain(
      "border-destructive"
    );
    expect(screen.getByRole("combobox", { name: "Operador" }).className).toContain(
      "border-destructive"
    );
  });

  it("repassa className ao contêiner", () => {
    const { container } = render(<Controlled className="largura-total" />);
    expect(container.firstElementChild).toHaveClass("largura-total");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Controlled placeholder="Patrimônio líquido" />);
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
