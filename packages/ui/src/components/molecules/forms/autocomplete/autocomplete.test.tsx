import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Autocomplete } from "./autocomplete";

const components = [
  { value: "data-table", label: "DataTable" },
  { value: "date-picker", label: "DatePicker" },
  { value: "stat-card", label: "StatCard" },
  { value: "time-tracker", label: "TimeTracker", disabled: true },
];

function renderField(props: Partial<React.ComponentProps<typeof Autocomplete>> = {}) {
  return render(<Autocomplete aria-label="Componente" options={components} {...props} />);
}

describe("Autocomplete", () => {
  it("filtra a lista pelo que a pessoa digita", async () => {
    renderField();
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "da");
    const names = screen.getAllByRole("option").map((el) => el.textContent);
    expect(names).toEqual(["DataTable", "DatePicker"]);
  });

  it("escolher uma opção avisa o valor e preenche o campo com o rótulo", async () => {
    const onValueChange = vi.fn();
    renderField({ onValueChange });
    const field = screen.getByRole("combobox", { name: "Componente" });
    await userEvent.type(field, "stat");
    await userEvent.click(screen.getByRole("option", { name: "StatCard" }));
    expect(onValueChange).toHaveBeenCalledWith("stat-card");
    expect(field).toHaveValue("StatCard");
  });

  it("dá para escolher só pelo teclado", async () => {
    const onValueChange = vi.fn();
    renderField({ onValueChange });
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "date");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("date-picker");
  });

  it("sem resultado, mostra a mensagem de vazio", async () => {
    renderField({ emptyMessage: "Nenhum componente com esse nome." });
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "xyz");
    expect(screen.getByText("Nenhum componente com esse nome.")).toBeInTheDocument();
  });

  it("opção desabilitada aparece marcada e não é escolhida", async () => {
    const onValueChange = vi.fn();
    renderField({ onValueChange });
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "time");
    const option = screen.getByRole("option", { name: "TimeTracker" });
    expect(option).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(option, { pointerEventsCheck: 0 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Limpar apaga a escolha", async () => {
    const onValueChange = vi.fn();
    renderField({ defaultValue: "stat-card", onValueChange });
    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByRole("combobox", { name: "Componente" })).toHaveValue("");
  });
});
