import { render, screen } from "@testing-library/react";
import { Globe } from "lucide-react";
import { describe, expect, it } from "vitest";
import { ToolStatusLine } from "./tool-status-line";

describe("ToolStatusLine", () => {
  it("diz o que a ferramenta fez numa linha só, com o valor em mono", () => {
    render(
      <ToolStatusLine
        state="done"
        icon={<Globe data-testid="icone" />}
        label="Buscou na web por"
        detail="aria-sort table header"
        data-testid="linha"
      />
    );
    const linha = screen.getByTestId("linha");
    expect(linha).toHaveAttribute("data-state", "done");
    expect(linha).not.toHaveAttribute("aria-busy");
    expect(linha).toHaveClass("text-muted-foreground");
    expect(linha).toHaveTextContent("Buscou na web por aria-sort table header");
    expect(screen.getByTestId("icone")).toBeInTheDocument();
    expect(screen.getByText("aria-sort table header")).toHaveClass("font-mono", "text-foreground");
    expect(linha.querySelector(".animate-spin")).toBeNull();
  });

  it("mostra um spinner no lugar do ícone e marca a linha como ocupada enquanto roda", () => {
    render(
      <ToolStatusLine
        state="running"
        icon={<Globe data-testid="icone" />}
        label="Buscando na web por"
        detail="aria-sort table header"
        data-testid="linha"
      />
    );
    const linha = screen.getByTestId("linha");
    expect(linha).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByTestId("icone")).toBeNull();
    const spinner = linha.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Buscando na web por")).toBeInTheDocument();
  });

  it("pinta o erro com o tom destrutivo, troca o ícone e mostra o código", () => {
    render(
      <ToolStatusLine
        state="error"
        icon={<Globe data-testid="icone" />}
        label="Não conseguiu ler"
        detail="github.com/acme/privado"
        meta="403"
        data-testid="linha"
      />
    );
    const linha = screen.getByTestId("linha");
    expect(linha).toHaveClass("text-destructive");
    expect(linha).not.toHaveClass("text-muted-foreground");
    expect(screen.queryByTestId("icone")).toBeNull();
    expect(linha.querySelector("[data-slot=tool-status-line-error-icon]")).not.toBeNull();
    expect(screen.getByText("403")).toHaveClass("font-mono", "text-xs");
  });

  it("aceita link no detalhe e não desenha meta nem ícone quando não vêm", () => {
    render(
      <ToolStatusLine
        state="done"
        label="Abriu"
        detail={<a href="https://github.com/radix-ui/primitives">radix-ui/primitives</a>}
        data-testid="linha"
      />
    );
    expect(screen.getByRole("link", { name: "radix-ui/primitives" })).toHaveAttribute(
      "href",
      "https://github.com/radix-ui/primitives"
    );
    const linha = screen.getByTestId("linha");
    expect(linha.querySelector("[data-slot=tool-status-line-meta]")).toBeNull();
    expect(linha.querySelector("svg")).toBeNull();
  });
});
