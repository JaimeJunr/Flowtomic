import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd, KbdGroup } from "./kbd";

describe("Kbd", () => {
  it("mostra o texto da tecla dentro de um elemento kbd", () => {
    render(<Kbd>Ctrl</Kbd>);
    const tecla = screen.getByText("Ctrl");
    expect(tecla.tagName).toBe("KBD");
    expect(tecla).toHaveAttribute("data-slot", "kbd");
  });

  it("repassa className e props para o elemento", () => {
    render(
      <Kbd className="minha-classe" title="Atalho" data-testid="tecla">
        K
      </Kbd>
    );
    const tecla = screen.getByTestId("tecla");
    expect(tecla).toHaveClass("minha-classe");
    expect(tecla).toHaveAttribute("title", "Atalho");
  });
});

describe("KbdGroup", () => {
  it("agrupa várias teclas", () => {
    render(
      <KbdGroup data-testid="grupo">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    );
    const grupo = screen.getByTestId("grupo");
    expect(grupo).toHaveAttribute("data-slot", "kbd-group");
    expect(grupo).toContainElement(screen.getByText("Ctrl"));
    expect(grupo).toContainElement(screen.getByText("K"));
  });

  it("repassa className ao grupo", () => {
    render(
      <KbdGroup className="espaco-extra" data-testid="grupo">
        <Kbd>Esc</Kbd>
      </KbdGroup>
    );
    expect(screen.getByTestId("grupo")).toHaveClass("espaco-extra");
  });
});
