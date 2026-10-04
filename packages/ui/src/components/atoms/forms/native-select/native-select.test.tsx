import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";

describe("NativeSelect", () => {
  it("renderiza um select nativo com opções e dispara onChange ao trocar o valor", async () => {
    const onChange = vi.fn();
    render(
      <NativeSelect aria-label="Moeda" onChange={onChange}>
        <NativeSelectOption value="brl">Real</NativeSelectOption>
        <NativeSelectOption value="usd">Dólar</NativeSelectOption>
      </NativeSelect>
    );
    const select = screen.getByRole("combobox", { name: "Moeda" }) as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(screen.getAllByRole("option")).toHaveLength(2);

    await userEvent.selectOptions(select, "usd");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(select.value).toBe("usd");
  });

  it('size="sm" define data-size="sm" no select', () => {
    render(
      <NativeSelect aria-label="Moeda" size="sm">
        <NativeSelectOption value="brl">Real</NativeSelectOption>
      </NativeSelect>
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm");
  });

  it("usa data-size=default quando size não é informado", () => {
    render(<NativeSelect aria-label="Moeda" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "default");
  });

  it("select desabilitado fica disabled e não aceita troca", async () => {
    const onChange = vi.fn();
    render(
      <NativeSelect aria-label="Moeda" disabled onChange={onChange}>
        <NativeSelectOption value="brl">Real</NativeSelectOption>
        <NativeSelectOption value="usd">Dólar</NativeSelectOption>
      </NativeSelect>
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    await userEvent.selectOptions(select, "usd");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("repassa aria-invalid ao select", () => {
    render(<NativeSelect aria-label="Moeda" aria-invalid />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("ref passado como prop chega ao elemento select (React 19)", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<NativeSelect aria-label="Moeda" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("className vai para o wrapper, não para o select", () => {
    const { container } = render(<NativeSelect aria-label="Moeda" className="minha-classe" />);
    const wrapper = container.querySelector('[data-slot="native-select-wrapper"]');
    expect(wrapper).toHaveClass("minha-classe");
    expect(screen.getByRole("combobox")).not.toHaveClass("minha-classe");
  });

  it("renderiza optgroup com suas opções", () => {
    render(
      <NativeSelect aria-label="Cidade">
        <NativeSelectOptGroup label="Sudeste">
          <NativeSelectOption value="sp">São Paulo</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    );
    expect(screen.getByRole("group", { name: "Sudeste" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "São Paulo" })).toHaveAttribute(
      "data-slot",
      "native-select-option"
    );
  });
});
