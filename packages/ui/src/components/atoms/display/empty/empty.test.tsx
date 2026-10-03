import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

describe("Empty", () => {
  it("mostra título, descrição e ação juntos", () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nenhum projeto</EmptyTitle>
          <EmptyDescription>
            Crie o primeiro em <a href="/novo">Novo projeto</a>.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button type="button">Criar projeto</button>
        </EmptyContent>
      </Empty>
    );
    expect(screen.getByText("Nenhum projeto")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Novo projeto" })).toHaveAttribute("href", "/novo");
    expect(screen.getByRole("button", { name: "Criar projeto" })).toBeInTheDocument();
  });

  it("a mídia padrão é transparente e a variante icon ganha fundo", () => {
    const { rerender } = render(<EmptyMedia>m</EmptyMedia>);
    expect(screen.getByText("m")).toHaveAttribute("data-variant", "default");
    expect(screen.getByText("m")).toHaveClass("bg-transparent");
    rerender(<EmptyMedia variant="icon">m</EmptyMedia>);
    expect(screen.getByText("m")).toHaveAttribute("data-variant", "icon");
    expect(screen.getByText("m")).toHaveClass("bg-muted");
  });

  it("className extra é somada às classes base e props repassadas chegam ao elemento", () => {
    render(
      <Empty className="minha-classe" id="vazio">
        x
      </Empty>
    );
    const el = screen.getByText("x");
    expect(el).toHaveClass("minha-classe", "flex");
    expect(el).toHaveAttribute("id", "vazio");
  });
});
