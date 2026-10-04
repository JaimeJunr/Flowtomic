import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
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

describe("Combobox: botões do input, separador, coleção e gatilho avulso", () => {
  it("o botão de abrir lista, no fim do input, abre as opções", async () => {
    const user = userEvent.setup();
    render(<CidadesCombobox />);

    await user.click(screen.getByRole("button", { name: "Abrir lista" }));

    expect(await screen.findAllByRole("option")).toHaveLength(cidades.length);
  });

  it("com showTrigger desligado o input não tem o botão de abrir", () => {
    render(
      <Combobox items={cidades}>
        <ComboboxInput aria-label="Cidade" showTrigger={false} />
      </Combobox>
    );
    expect(screen.queryByRole("button", { name: "Abrir lista" })).not.toBeInTheDocument();
  });

  it("showRemove desligado deixa o chip sem botão de remover", async () => {
    const user = userEvent.setup();
    render(
      <Combobox multiple items={cidades} defaultValue={["Recife"]}>
        <ComboboxChips>
          <ComboboxValue>
            {(selecionadas: string[]) =>
              selecionadas.map((cidade) => (
                <ComboboxChip key={cidade} showRemove={false}>
                  {cidade}
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput aria-label="Cidades" />
        </ComboboxChips>
      </Combobox>
    );
    await user.click(screen.getByRole("combobox", { name: "Cidades" }));
    expect(screen.getByText("Recife")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remover" })).not.toBeInTheDocument();
  });

  it("o botão do chip tem nome acessível Remover", () => {
    render(
      <Combobox multiple items={cidades} defaultValue={["Recife"]}>
        <ComboboxChips>
          <ComboboxValue>
            {(selecionadas: string[]) =>
              selecionadas.map((cidade) => <ComboboxChip key={cidade}>{cidade}</ComboboxChip>)
            }
          </ComboboxValue>
          <ComboboxChipsInput aria-label="Cidades" />
        </ComboboxChips>
      </Combobox>
    );
    expect(screen.getByRole("button", { name: "Remover" })).toBeInTheDocument();
  });

  it("separa grupos e monta os itens por ComboboxCollection", async () => {
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
            {(grupo: (typeof grupos)[number], indice: number) => (
              <React.Fragment key={grupo.value}>
                <ComboboxGroup items={grupo.items}>
                  <ComboboxLabel>{grupo.value}</ComboboxLabel>
                  <ComboboxCollection>
                    {(cidade: string) => (
                      <ComboboxItem key={cidade} value={cidade}>
                        {cidade}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
                {indice < grupos.length - 1 && <ComboboxSeparator />}
              </React.Fragment>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    await user.click(screen.getByRole("combobox", { name: "Cidade" }));

    expect(await screen.findAllByRole("option")).toHaveLength(3);
    expect(document.querySelector('[data-slot="combobox-separator"]')).toBeInTheDocument();
  });

  it("o gatilho avulso abre a lista, e a escolha aparece no ComboboxValue", async () => {
    const user = userEvent.setup();
    render(
      <Combobox items={cidades}>
        <ComboboxTrigger aria-label="Escolher cidade">
          <ComboboxValue placeholder="Selecione" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput aria-label="Filtrar cidade" showTrigger={false} />
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

    await user.click(screen.getByRole("combobox", { name: "Escolher cidade" }));
    await user.click(await screen.findByRole("option", { name: "Curitiba" }));

    expect(screen.getByRole("combobox", { name: "Escolher cidade" })).toHaveTextContent("Curitiba");
  });

  it("não tem violações de acessibilidade com a lista aberta", async () => {
    const user = userEvent.setup();
    render(<CidadesCombobox showClear defaultValue="Recife" />);
    await user.click(screen.getByRole("combobox", { name: "Cidade" }));
    await screen.findAllByRole("option");
    const resultado = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });
    expect(resultado.violations).toEqual([]);
  });
});
