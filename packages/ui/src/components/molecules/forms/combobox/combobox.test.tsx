import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
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
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox";

const cidades = ["São Paulo", "Rio de Janeiro", "Curitiba", "Recife"];

function CidadesCombobox({
  onValueChange,
  disabled,
  showClear,
  defaultValue,
}: {
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  showClear?: boolean;
  defaultValue?: string;
}) {
  return (
    <Combobox items={cidades} onValueChange={onValueChange} defaultValue={defaultValue}>
      <ComboboxInput
        aria-label="Cidade"
        placeholder="Buscar cidade"
        disabled={disabled}
        showClear={showClear}
      />
      <ComboboxContent>
        <ComboboxEmpty>Nenhuma cidade encontrada.</ComboboxEmpty>
        <ComboboxList>
          {(cidade: string) => (
            <ComboboxItem key={cidade} value={cidade}>
              {cidade}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function ChipsCombobox({ onValueChange }: { onValueChange?: (value: string[]) => void }) {
  const anchor = useComboboxAnchor();
  return (
    <Combobox multiple items={cidades} onValueChange={onValueChange}>
      <ComboboxChips ref={anchor}>
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
        <ComboboxList>
          {(cidade: string) => (
            <ComboboxItem key={cidade} value={cidade}>
              {cidade}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox", () => {
  it("filtra os itens conforme o texto digitado", async () => {
    const user = userEvent.setup();
    render(<CidadesCombobox />);

    await user.type(screen.getByRole("combobox", { name: "Cidade" }), "cur");

    expect(await screen.findByRole("option", { name: "Curitiba" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Recife" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("selecionar um item por clique chama onValueChange e mostra o valor no input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CidadesCombobox onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox", { name: "Cidade" }));
    await user.click(await screen.findByRole("option", { name: "Recife" }));

    expect(onValueChange).toHaveBeenCalledWith("Recife", expect.anything());
    expect(screen.getByRole("combobox", { name: "Cidade" })).toHaveValue("Recife");
  });

  it("ArrowDown + Enter seleciona o primeiro item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CidadesCombobox onValueChange={onValueChange} />);

    const input = screen.getByRole("combobox", { name: "Cidade" });
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("São Paulo", expect.anything()));
    expect(input).toHaveValue("São Paulo");
  });

  it("mostra ComboboxEmpty quando nada combina com a busca", async () => {
    const user = userEvent.setup();
    render(<CidadesCombobox />);

    await user.type(screen.getByRole("combobox", { name: "Cidade" }), "zzz");

    expect(await screen.findByText("Nenhuma cidade encontrada.")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("input desabilitado fica disabled e não abre a lista", async () => {
    const user = userEvent.setup();
    render(<CidadesCombobox disabled />);

    const input = screen.getByRole("combobox", { name: "Cidade" });
    expect(input).toBeDisabled();
    await user.click(input);
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("showClear limpa o valor selecionado", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CidadesCombobox defaultValue="Curitiba" showClear onValueChange={onValueChange} />);

    const input = screen.getByRole("combobox", { name: "Cidade" });
    expect(input).toHaveValue("Curitiba");

    await user.click(screen.getByRole("button", { name: /limpar|clear/i }));

    expect(onValueChange).toHaveBeenCalledWith(null, expect.anything());
    expect(input).toHaveValue("");
  });

  it("modo múltiplo: dois itens viram dois chips e o botão do chip remove o item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ChipsCombobox onValueChange={onValueChange} />);

    const input = screen.getByRole("combobox", { name: "Cidades" });
    await user.click(input);
    await user.click(await screen.findByRole("option", { name: "Curitiba" }));
    await user.click(await screen.findByRole("option", { name: "Recife" }));

    expect(onValueChange).toHaveBeenLastCalledWith(["Curitiba", "Recife"], expect.anything());
    const chips = document.querySelectorAll('[data-slot="combobox-chip"]');
    expect(chips).toHaveLength(2);

    const remover = within(chips[0] as HTMLElement).getByRole("button");
    await user.click(remover);

    await waitFor(() =>
      expect(document.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(1)
    );
    expect(onValueChange).toHaveBeenLastCalledWith(["Recife"], expect.anything());
  });

  it("agrupa itens com ComboboxGroup e ComboboxLabel", async () => {
    const user = userEvent.setup();
    const grupos = [
      { value: "Sudeste", items: ["São Paulo", "Rio de Janeiro"] },
      { value: "Nordeste", items: ["Recife"] },
    ];
    render(
      <Combobox items={grupos}>
        <ComboboxInput aria-label="Cidade" />
        <ComboboxContent>
          <ComboboxList>
            {(grupo: (typeof grupos)[number]) => (
              <ComboboxGroup key={grupo.value} items={grupo.items}>
                <ComboboxLabel>{grupo.value}</ComboboxLabel>
                {grupo.items.map((cidade) => (
                  <ComboboxItem key={cidade} value={cidade}>
                    {cidade}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    await user.click(screen.getByRole("combobox", { name: "Cidade" }));

    expect(await screen.findByText("Sudeste")).toHaveAttribute("data-slot", "combobox-label");
    expect(screen.getByText("Nordeste")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
});
