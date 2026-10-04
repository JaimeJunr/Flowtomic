import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorDialog,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorSeparator,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
} from "./model-selector";

describe("ModelSelectorContent", () => {
  it("abre sem o aviso do Radix de descrição faltando", () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <ModelSelector defaultOpen>
        <ModelSelectorContent />
      </ModelSelector>
    );
    expect(aviso.mock.calls.flat().join(" ")).not.toMatch(/Missing `Description`/);
    aviso.mockRestore();
  });

  describe("Título padrão (leitor de tela) em pt-BR", () => {
    it("mostra 'Seletor de modelo' quando nenhum título é passado", () => {
      render(
        <ModelSelector defaultOpen>
          <ModelSelectorContent />
        </ModelSelector>
      );
      expect(screen.getByText("Seletor de modelo")).toBeInTheDocument();
    });

    it("aceita um título customizado no lugar do padrão", () => {
      render(
        <ModelSelector defaultOpen>
          <ModelSelectorContent title="Escolha o modelo do agente" />
        </ModelSelector>
      );
      expect(screen.getByText("Escolha o modelo do agente")).toBeInTheDocument();
      expect(screen.queryByText("Seletor de modelo")).not.toBeInTheDocument();
    });
  });
});

const Catalogo = () => (
  <ModelSelector defaultOpen>
    <ModelSelectorContent>
      <ModelSelectorInput placeholder="Buscar modelo" />
      <ModelSelectorList>
        <ModelSelectorEmpty>Nenhum modelo encontrado</ModelSelectorEmpty>
        <ModelSelectorGroup heading="Anthropic">
          <ModelSelectorItem value="claude">
            <ModelSelectorLogoGroup>
              <ModelSelectorLogo provider="anthropic" />
            </ModelSelectorLogoGroup>
            <ModelSelectorName>Claude</ModelSelectorName>
            <ModelSelectorShortcut>⌘1</ModelSelectorShortcut>
          </ModelSelectorItem>
        </ModelSelectorGroup>
        <ModelSelectorSeparator />
        <ModelSelectorGroup heading="OpenAI">
          <ModelSelectorItem value="gpt">
            <ModelSelectorName>GPT</ModelSelectorName>
          </ModelSelectorItem>
        </ModelSelectorGroup>
      </ModelSelectorList>
    </ModelSelectorContent>
  </ModelSelector>
);

describe("ModelSelector: catálogo", () => {
  it("lista os modelos agrupados por provedor, com logo nomeado e atalho", () => {
    render(<Catalogo />);
    expect(screen.getByRole("group", { name: "Anthropic" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Claude/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "anthropic logo" })).toHaveAttribute(
      "src",
      "https://models.dev/logos/anthropic.svg"
    );
    expect(screen.getByText("⌘1")).toBeInTheDocument();
  });

  it("digitar filtra os modelos pelo teclado", async () => {
    render(<Catalogo />);
    await userEvent.type(screen.getByRole("combobox"), "gpt");
    expect(screen.getByRole("option", { name: "GPT" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Claude/ })).not.toBeInTheDocument();
  });

  it("sem resultado, mostra a mensagem de vazio", async () => {
    render(<Catalogo />);
    await userEvent.type(screen.getByRole("combobox"), "zzzz");
    expect(screen.getByText("Nenhum modelo encontrado")).toBeInTheDocument();
  });

  it("Enter seleciona o modelo destacado", async () => {
    const onSelect = vi.fn();
    render(
      <ModelSelector defaultOpen>
        <ModelSelectorContent>
          <ModelSelectorInput placeholder="Buscar modelo" />
          <ModelSelectorList>
            <ModelSelectorItem onSelect={onSelect} value="claude">
              Claude
            </ModelSelectorItem>
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
    );
    await userEvent.type(screen.getByRole("combobox"), "cla{Enter}");
    expect(onSelect).toHaveBeenCalledWith("claude");
  });

  it("o gatilho abre o diálogo e Esc fecha", async () => {
    render(
      <ModelSelector>
        <ModelSelectorTrigger>Escolher modelo</ModelSelectorTrigger>
        <ModelSelectorContent>
          <ModelSelectorInput placeholder="Buscar modelo" />
        </ModelSelectorContent>
      </ModelSelector>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Escolher modelo" }));
    expect(screen.getByRole("dialog", { name: "Seletor de modelo" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ModelSelectorDialog abre a paleta já com campo de busca", () => {
    render(
      <ModelSelectorDialog open>
        <ModelSelectorInput placeholder="Buscar modelo" />
      </ModelSelectorDialog>
    );
    expect(screen.getByPlaceholderText("Buscar modelo")).toBeInTheDocument();
  });

  it("repassa className ao logo, ao grupo de logos e ao nome", () => {
    render(
      <>
        <ModelSelectorLogoGroup className="grupo" data-testid="g" />
        <ModelSelectorName className="nome">Nome</ModelSelectorName>
      </>
    );
    expect(screen.getByTestId("g")).toHaveClass("grupo");
    expect(screen.getByText("Nome")).toHaveClass("nome", "truncate");
  });

  it("aberto, não tem violações automáticas de acessibilidade", async () => {
    render(<Catalogo />);
    const result = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
