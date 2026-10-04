import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { Autocomplete } from "./autocomplete";
import { useAutocompleteContext } from "./autocomplete-context";

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

function renderComposed(props: Partial<React.ComponentProps<typeof Autocomplete>> = {}) {
  const {
    children = (
      <>
        <Autocomplete.Section title="Dados">
          <Autocomplete.Item value="data-table">DataTable</Autocomplete.Item>
          <Autocomplete.Item value="stat-card">StatCard</Autocomplete.Item>
        </Autocomplete.Section>
        <Autocomplete.Section>
          <Autocomplete.Item value="time-tracker" disabled>
            TimeTracker
          </Autocomplete.Item>
        </Autocomplete.Section>
      </>
    ),
    ...rest
  } = props;
  return render(
    <Autocomplete aria-label="Componente" {...rest}>
      {children}
    </Autocomplete>
  );
}

describe("Autocomplete no modo composição", () => {
  it("escolher um item avisa o valor e preenche o campo com o texto do item", async () => {
    const onValueChange = vi.fn();
    renderComposed({ onValueChange });
    const field = screen.getByRole("combobox", { name: "Componente" });
    await userEvent.click(field);
    await userEvent.click(screen.getByRole("option", { name: "StatCard" }));
    expect(onValueChange).toHaveBeenCalledWith("stat-card");
    expect(field).toHaveValue("StatCard");
  });

  it("a seção com título vira um grupo nomeado e a sem título não ganha rótulo", async () => {
    renderComposed();
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    const grupos = screen.getAllByRole("group");
    expect(grupos).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Dados" })).toHaveTextContent("DataTable");
    expect(grupos[1]).not.toHaveAccessibleName();
    expect(screen.getByText("Dados")).toBeInTheDocument();
  });

  it("item desabilitado fica marcado e não é escolhido", async () => {
    const onValueChange = vi.fn();
    renderComposed({ onValueChange });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    const item = screen.getByRole("option", { name: "TimeTracker" });
    expect(item).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(item, { pointerEventsCheck: 0 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("dá para escolher um item pelo teclado", async () => {
    const onValueChange = vi.fn();
    renderComposed({ onValueChange });
    const field = screen.getByRole("combobox", { name: "Componente" });
    await userEvent.type(field, "stat");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("stat-card");
  });

  it("item cujo conteúdo é um elemento usa o texto desse elemento como rótulo", async () => {
    renderComposed({
      children: (
        <Autocomplete.Item value="rico">
          <strong>Item rico</strong>
        </Autocomplete.Item>
      ),
    });
    const field = screen.getByRole("combobox", { name: "Componente" });
    await userEvent.click(field);
    await userEvent.click(screen.getByRole("option", { name: "Item rico" }));
    expect(field).toHaveValue("Item rico");
  });

  it("item sem conteúdo mostra o próprio valor como texto", async () => {
    renderComposed({ children: <Autocomplete.Item value="solto" /> });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    expect(screen.getByRole("option", { name: "solto" })).toBeInTheDocument();
  });

  it("Autocomplete.List agrupa os itens numa lista nomeada", async () => {
    renderComposed({
      children: (
        <Autocomplete.List>
          <Autocomplete.Item value="a">Alfa</Autocomplete.Item>
        </Autocomplete.List>
      ),
    });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    const lista = screen.getByRole("listbox", { name: "Opções disponíveis" });
    expect(lista).toHaveTextContent("Alfa");
  });

  it("Autocomplete.Empty mostra a mensagem do campo ou o texto que a pessoa passar", async () => {
    const { unmount } = renderComposed({
      emptyMessage: "Sem componentes.",
      children: <Autocomplete.Empty />,
    });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    expect(screen.getByText("Sem componentes.")).toBeInTheDocument();
    unmount();

    renderComposed({ children: <Autocomplete.Empty>Nada por aqui</Autocomplete.Empty> });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    expect(screen.getByText("Nada por aqui")).toBeInTheDocument();
  });

  it("Autocomplete.Loading mostra o texto padrão ou o que for passado, sem precisar do campo", () => {
    const { rerender } = render(<Autocomplete.Loading />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    rerender(<Autocomplete.Loading>Buscando no servidor</Autocomplete.Loading>);
    expect(screen.getByText("Buscando no servidor")).toBeInTheDocument();
  });

  it("item dentro de um componente próprio ainda aparece e vira escolha com valor livre", async () => {
    function Extra() {
      return (
        <>
          <Autocomplete.Item value="extra">Extra</Autocomplete.Item>
          <Autocomplete.Item value="sem-texto" />
        </>
      );
    }
    const onValueChange = vi.fn();
    renderComposed({ allowCustomValue: true, onValueChange, children: <Extra /> });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    expect(screen.getByRole("option", { name: "sem-texto" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "Extra" }));
    expect(onValueChange).toHaveBeenCalledWith("extra");
  });

  it("item desabilitado fora da lista extraída também não é escolhido", async () => {
    function Extra() {
      return (
        <Autocomplete.Item value="extra" disabled>
          Extra
        </Autocomplete.Item>
      );
    }
    const onValueChange = vi.fn();
    renderComposed({ allowCustomValue: true, onValueChange, children: <Extra /> });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    const item = screen.getByRole("option", { name: "Extra" });
    expect(item).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(item, { pointerEventsCheck: 0 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("no modo composição, a busca esconde os itens que não casam", async () => {
    renderComposed();
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "stat");
    expect(screen.getAllByRole("option").map((el) => el.textContent)).toEqual(["StatCard"]);
  });

  it("não tem nenhuma violação de acessibilidade com a lista aberta (modo composição)", async () => {
    const { container } = renderComposed();
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("fora o atributo aria no gatilho, a lista aberta não tem violações de acessibilidade", async () => {
    const { container } = renderComposed({
      children: (
        <Autocomplete.List>
          <Autocomplete.Item value="a">Alfa</Autocomplete.Item>
        </Autocomplete.List>
      ),
    });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false }, "aria-allowed-attr": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});

describe("Autocomplete fora do contexto", () => {
  it.each([
    ["Autocomplete.Item", () => <Autocomplete.Item value="a">A</Autocomplete.Item>],
    ["Autocomplete.List", () => <Autocomplete.List />],
    ["Autocomplete.Empty", () => <Autocomplete.Empty />],
  ])("%s sem o Autocomplete em volta avisa com erro claro", (_nome, ui) => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(ui())).toThrow(/within Autocomplete component/);
    erro.mockRestore();
  });

  it("useAutocompleteContext lança erro fora do Autocomplete", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    function Sonda() {
      useAutocompleteContext();
      return null;
    }
    expect(() => render(<Sonda />)).toThrow(
      "useAutocompleteContext must be used within Autocomplete component"
    );
    erro.mockRestore();
  });
});

describe("Autocomplete (API de opções), estados e props", () => {
  it("enquanto carrega, mostra o aviso em vez das opções", async () => {
    renderField({ isLoading: true });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("com valor livre permitido, Enter aceita o texto digitado", async () => {
    const onValueChange = vi.fn();
    renderField({ allowCustomValue: true, onValueChange });
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "zzz{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("zzz");
  });

  it("sem valor livre, Enter num texto sem opção não escolhe nada", async () => {
    const onValueChange = vi.fn();
    renderField({ onValueChange });
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "zzz{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("Escape fecha a lista", async () => {
    renderField();
    const field = screen.getByRole("combobox", { name: "Componente" });
    await userEvent.type(field, "da");
    expect(field).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  it("respeita o filtro que a pessoa passar", async () => {
    renderField({ filterFunction: (opcao, busca) => opcao.value.startsWith(busca) });
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "stat");
    expect(screen.getAllByRole("option").map((el) => el.textContent)).toEqual(["StatCard"]);
  });

  it("valor controlado aparece preenchido com o rótulo da opção", () => {
    renderField({ value: "date-picker" });
    expect(screen.getByRole("combobox", { name: "Componente" })).toHaveValue("DatePicker");
  });

  it("desabilitado, o campo não aceita foco de edição nem mostra Limpar", () => {
    renderField({ disabled: true, defaultValue: "stat-card" });
    expect(screen.getByRole("combobox", { name: "Componente" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Limpar" })).not.toBeInTheDocument();
  });

  it("sem escolha feita, não oferece Limpar", () => {
    renderField();
    expect(screen.queryByRole("button", { name: "Limpar" })).not.toBeInTheDocument();
  });

  it("limita a altura da lista pelo maxListboxHeight", async () => {
    renderField({ maxListboxHeight: "120px" });
    await userEvent.click(screen.getByRole("combobox", { name: "Componente" }));
    const lista = screen.getByRole("listbox", { name: "Opções disponíveis" });
    expect(lista.parentElement).toHaveStyle({ maxHeight: "120px" });
  });

  it("não tem nenhuma violação de acessibilidade com a lista aberta (API de opções)", async () => {
    const { container } = renderField();
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "d");
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("fora o atributo aria no gatilho, a lista aberta não tem violações de acessibilidade", async () => {
    const { container } = renderField();
    await userEvent.type(screen.getByRole("combobox", { name: "Componente" }), "d");
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false }, "aria-allowed-attr": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
