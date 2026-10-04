import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "./input-group";

describe("InputGroup", () => {
  it("vira coluna quando tem addon de bloco, com o rodapé ocupando a linha toda embaixo", () => {
    render(
      <InputGroup data-testid="grupo">
        <InputGroupTextarea aria-label="Mensagem" />
        <InputGroupAddon align="block-end" data-testid="rodape">
          <button type="submit">Enviar</button>
        </InputGroupAddon>
      </InputGroup>
    );
    expect(screen.getByTestId("grupo")).toHaveClass(
      "has-[>[data-align=block-end]]:flex-col",
      "has-[>[data-align=block-start]]:flex-col"
    );
    const rodape = screen.getByTestId("rodape");
    expect(rodape).toHaveAttribute("data-align", "block-end");
    expect(rodape).toHaveClass("w-full", "order-last");
  });

  it("mantém addon de linha no começo ou no fim, sem esticar", () => {
    render(
      <InputGroup>
        <InputGroupAddon data-testid="prefixo">R$</InputGroupAddon>
        <InputGroupAddon align="inline-end" data-testid="sufixo">
          ,00
        </InputGroupAddon>
      </InputGroup>
    );
    expect(screen.getByTestId("prefixo")).toHaveAttribute("data-align", "inline-start");
    expect(screen.getByTestId("prefixo")).toHaveClass("order-first");
    expect(screen.getByTestId("prefixo")).not.toHaveClass("w-full");
    expect(screen.getByTestId("sufixo")).toHaveClass("order-last");
  });

  it("põe o cabeçalho de bloco em cima", () => {
    render(
      <InputGroup>
        <InputGroupAddon align="block-start" data-testid="topo">
          anexo.png
        </InputGroupAddon>
      </InputGroup>
    );
    expect(screen.getByTestId("topo")).toHaveClass("w-full", "order-first");
  });
});
