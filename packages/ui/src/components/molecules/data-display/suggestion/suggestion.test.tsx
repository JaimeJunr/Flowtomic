import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Suggestion, Suggestions } from "./suggestion";

describe("Suggestion", () => {
  it("oferece ação outline de 36px sem pílula e envia a sugestão ao clicar", async () => {
    const onClick = vi.fn();
    render(
      <Suggestions>
        <Suggestion suggestion="Mostrar o código do cabeçalho" onClick={onClick} />
      </Suggestions>
    );
    const button = screen.getByRole("button", { name: "Mostrar o código do cabeçalho" });
    expect(button).toHaveClass("border", "bg-background", "rounded-md", "h-9");
    expect(button).not.toHaveClass("rounded-full");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("Mostrar o código do cabeçalho");
  });

  it("preserva conteúdo customizado e não dispara a sugestão desabilitada", async () => {
    const onClick = vi.fn();
    render(
      <Suggestion suggestion="Rodar os testes do DataTable" disabled onClick={onClick}>
        Testes em execução
      </Suggestion>
    );
    const button = screen.getByRole("button", { name: "Testes em execução" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("mostra um rótulo curto e envia o pedido completo", async () => {
    const onClick = vi.fn();
    render(
      <Suggestion suggestion="Como faço o DataTable ordenar pelo teclado?" onClick={onClick}>
        Ordenar tabela pelo teclado
      </Suggestion>
    );
    await userEvent.click(screen.getByRole("button", { name: "Ordenar tabela pelo teclado" }));
    expect(onClick).toHaveBeenCalledWith("Como faço o DataTable ordenar pelo teclado?");
  });
});

describe("Suggestions", () => {
  it("no estado vazio quebra linha e centraliza, sem rolagem escondida", () => {
    const { container } = render(
      <Suggestions layout="wrap" data-testid="lista">
        <Suggestion suggestion="Trocar a cor da marca" />
        <Suggestion suggestion="Montar um block de login" />
      </Suggestions>
    );
    const lista = screen.getByTestId("lista");
    expect(lista).toHaveClass("flex-wrap", "justify-center");
    expect(lista).not.toHaveClass("flex-nowrap");
    expect(container.querySelector("[data-slot=scroll-area]")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("por padrão continua sendo uma faixa que rola de lado", () => {
    const { container } = render(
      <Suggestions>
        <Suggestion suggestion="Trocar a cor da marca" />
      </Suggestions>
    );
    expect(container.querySelector("[data-slot=scroll-area]")).not.toBeNull();
    expect(container.querySelector(".flex-nowrap")).not.toBeNull();
  });
});
