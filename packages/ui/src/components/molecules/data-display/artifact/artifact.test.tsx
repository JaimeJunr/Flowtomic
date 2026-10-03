import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Artifact,
  ArtifactClose,
  ArtifactContent,
  ArtifactHeader,
  ArtifactTitle,
} from "./artifact";

describe("Artifact", () => {
  it("usa contêiner com régua e cantos de 10px sem sombra em repouso", () => {
    const { container } = render(
      <Artifact>
        <ArtifactContent>6 testes, todos passando</ArtifactContent>
      </Artifact>
    );
    expect(screen.getByText("6 testes, todos passando")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("border-border", "rounded-[10px]");
    expect(container.firstElementChild?.className).not.toMatch(/\bshadow(?:-\S+)?\b/);
  });

  it("separa o cabeçalho com borda e fundo de superfície", () => {
    render(
      <ArtifactHeader>
        <ArtifactTitle>data-table.test.tsx</ArtifactTitle>
      </ArtifactHeader>
    );
    expect(screen.getByText("data-table.test.tsx").parentElement).toHaveClass(
      "bg-surface",
      "border-b",
      "border-border"
    );
  });

  it("nomeia a ação Fechar em pt-BR e preserva o callback", async () => {
    const onClick = vi.fn();
    render(<ArtifactClose onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Fechar" });
    expect(button).toHaveAttribute("aria-label", "Fechar");
    expect(screen.getByText("Fechar")).toHaveClass("sr-only");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
