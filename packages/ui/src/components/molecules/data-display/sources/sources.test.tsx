import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Source, Sources, SourcesContent, SourcesTrigger } from "./sources";

describe("Sources", () => {
  it.each([
    [1, "Usou 1 fonte"],
    [2, "Usou 2 fontes"],
    [0, "Usou 0 fontes"],
  ])("localiza a contagem %s e permite abrir as fontes", async (count, label) => {
    render(
      <Sources>
        <SourcesTrigger count={count as number} />
        <SourcesContent>
          <Source
            href="https://github.com/JaimeJunr/Flowtomic/blob/main/DESIGN.md"
            title="DESIGN.md"
          />
        </SourcesContent>
      </Sources>
    );
    const trigger = screen.getByRole("button", { name: label as string });
    expect(trigger).toHaveClass("text-muted-foreground", "text-[13px]");
    expect(trigger).not.toHaveClass("text-primary");
    expect(screen.queryByRole("link", { name: "DESIGN.md" })).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.getByRole("link", { name: "DESIGN.md" })).toBeVisible();
  });

  it("mostra o caminho da fonte em mono com ícone de link externo", () => {
    render(
      <Source
        href="https://github.com/JaimeJunr/Flowtomic/blob/main/docs/componentes/molecules.md"
        title="docs/componentes/molecules.md"
      />
    );
    const link = screen.getByRole("link", { name: "docs/componentes/molecules.md" });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/JaimeJunr/Flowtomic/blob/main/docs/componentes/molecules.md"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText("docs/componentes/molecules.md")).toHaveClass("font-mono");
    expect(link.querySelector("svg")).toHaveClass("lucide-external-link");
  });
});
