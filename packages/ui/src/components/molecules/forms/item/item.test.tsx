import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item";

describe("Item", () => {
  it("por padrão é um bloco de variante e tamanho padrão", () => {
    render(<Item>Conteúdo</Item>);
    const item = screen.getByText("Conteúdo");
    expect(item.tagName).toBe("DIV");
    expect(item).toHaveAttribute("data-slot", "item");
    expect(item).toHaveAttribute("data-variant", "default");
    expect(item).toHaveAttribute("data-size", "default");
  });

  it.each([
    ["outline", "border-border"],
    ["muted", "bg-muted/50"],
  ] as const)("variante %s muda o visual do item", (variant, classe) => {
    render(<Item variant={variant}>Conteúdo</Item>);
    const item = screen.getByText("Conteúdo");
    expect(item).toHaveAttribute("data-variant", variant);
    expect(item).toHaveClass(classe);
  });

  it("tamanho sm usa espaçamento menor que o padrão", () => {
    const { rerender } = render(<Item size="sm">Conteúdo</Item>);
    expect(screen.getByText("Conteúdo")).toHaveAttribute("data-size", "sm");
    expect(screen.getByText("Conteúdo")).toHaveClass("py-3", "px-4");
    rerender(<Item>Conteúdo</Item>);
    expect(screen.getByText("Conteúdo")).toHaveClass("p-4");
  });

  it("com asChild vira o próprio link, sem div em volta", () => {
    render(
      <Item asChild variant="outline">
        <a href="/componentes/button">Button</a>
      </Item>
    );
    const link = screen.getByRole("link", { name: "Button" });
    expect(link).toHaveAttribute("href", "/componentes/button");
    expect(link).toHaveAttribute("data-slot", "item");
    expect(link).toHaveAttribute("data-variant", "outline");
  });

  it("repassa className e atributos nativos", () => {
    render(
      <Item className="minha-classe" aria-label="Linha de resumo">
        Conteúdo
      </Item>
    );
    expect(screen.getByLabelText("Linha de resumo")).toHaveClass("minha-classe");
  });
});

describe("Item e seus pedaços", () => {
  it("ItemGroup é uma lista sem marcadores", () => {
    render(
      <ItemGroup aria-label="Componentes">
        <li>Um</li>
        <li>Dois</li>
      </ItemGroup>
    );
    const lista = screen.getByRole("list", { name: "Componentes" });
    expect(lista).toHaveAttribute("data-slot", "item-group");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it.each([
    ["default", "bg-transparent"],
    ["icon", "bg-muted"],
    ["image", "overflow-hidden"],
  ] as const)("ItemMedia variante %s", (variant, classe) => {
    render(<ItemMedia variant={variant}>mídia</ItemMedia>);
    const media = screen.getByText("mídia");
    expect(media).toHaveAttribute("data-slot", "item-media");
    expect(media).toHaveAttribute("data-variant", variant);
    expect(media).toHaveClass(classe);
  });

  it("ItemMedia sem variante é a padrão", () => {
    render(<ItemMedia>mídia</ItemMedia>);
    expect(screen.getByText("mídia")).toHaveAttribute("data-variant", "default");
  });

  it("título, descrição, ações, cabeçalho, rodapé e conteúdo carregam o slot e o texto", () => {
    render(
      <Item>
        <ItemHeader>cabeçalho</ItemHeader>
        <ItemContent>
          <ItemTitle>título</ItemTitle>
          <ItemDescription>descrição</ItemDescription>
        </ItemContent>
        <ItemActions>ações</ItemActions>
        <ItemFooter>rodapé</ItemFooter>
      </Item>
    );
    for (const [texto, slot] of [
      ["cabeçalho", "item-header"],
      ["título", "item-title"],
      ["descrição", "item-description"],
      ["ações", "item-actions"],
      ["rodapé", "item-footer"],
    ] as const) {
      expect(screen.getByText(texto)).toHaveAttribute("data-slot", slot);
    }
    expect(screen.getByText("descrição").tagName).toBe("P");
    expect(screen.getByText("título").closest("[data-slot=item-content]")).toBeInTheDocument();
  });

  it("className de cada pedaço é somada à classe base", () => {
    render(
      <ItemGroup className="g" aria-label="Grupo">
        <ItemMedia className="m">mídia</ItemMedia>
        <ItemContent className="c">conteúdo</ItemContent>
        <ItemTitle className="t">título</ItemTitle>
        <ItemDescription className="d">descrição</ItemDescription>
        <ItemActions className="a">ações</ItemActions>
        <ItemHeader className="h">cabeçalho</ItemHeader>
        <ItemFooter className="f">rodapé</ItemFooter>
      </ItemGroup>
    );
    expect(screen.getByRole("list", { name: "Grupo" })).toHaveClass("g", "flex");
    for (const [texto, classe] of [
      ["mídia", "m"],
      ["conteúdo", "c"],
      ["título", "t"],
      ["descrição", "d"],
      ["ações", "a"],
      ["cabeçalho", "h"],
      ["rodapé", "f"],
    ] as const) {
      expect(screen.getByText(texto)).toHaveClass(classe);
    }
  });

  it("ItemSeparator é uma linha horizontal decorativa que aceita className", () => {
    const { container } = render(<ItemSeparator className="meu-separador" />);
    const separador = container.querySelector("[data-slot=item-separator]") as HTMLElement;
    expect(separador).toHaveAttribute("data-orientation", "horizontal");
    expect(separador).toHaveClass("meu-separador");
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("ItemSeparator pode ser exposto como separador de verdade", () => {
    render(<ItemSeparator decorative={false} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("ItemGroup com Item e ItemSeparator direto dentro não tem violações de acessibilidade", async () => {
    const { container } = render(
      <ItemGroup aria-label="Componentes">
        <Item>
          <ItemContent>
            <ItemTitle>Button</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Input</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("uma lista de itens montada com todas as peças não tem violações de acessibilidade", async () => {
    const { container } = render(
      <ItemGroup aria-label="Componentes">
        <Item variant="outline">
          <ItemMedia variant="icon">i</ItemMedia>
          <ItemContent>
            <ItemTitle>Button</ItemTitle>
            <ItemDescription>Botão de ação</ItemDescription>
          </ItemContent>
          <ItemActions>
            <a href="/button">Abrir</a>
          </ItemActions>
        </Item>
        <Item size="sm">
          <ItemContent>
            <ItemTitle>Input</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    );
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
