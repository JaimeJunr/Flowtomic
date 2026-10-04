import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Source, Sources, SourcesContent, SourcesTrigger, uniqueSources } from "./sources";

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
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("docs/componentes/molecules.md")).toHaveClass("font-mono");
    expect(link.querySelector("svg")).toHaveClass("lucide-external-link");
  });

  it.each([
    "javascript:alert(1)",
    "  JavaScript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
  ])("não vira link quando o endereço é perigoso: %s", (href) => {
    render(<Source href={href} title="fonte suspeita" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("fonte suspeita")).toBeInTheDocument();
  });

  it.each([
    "https://www.w3.org/WAI/ARIA/apg/",
    "http://localhost:6006",
    "docs/INDEX.md",
  ])("vira link seguro em nova aba: %s", (href) => {
    render(<Source href={href} title="fonte" />);
    const link = screen.getByRole("link", { name: /fonte/ });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("uniqueSources", () => {
  it("tira fontes repetidas pela URL e mantém a ordem da primeira aparição", () => {
    const fontes = [
      { url: "https://a.dev", title: "A" },
      { url: "https://b.dev", title: "B" },
      { url: "https://a.dev", title: "A de novo" },
    ];
    expect(uniqueSources(fontes)).toEqual([
      { url: "https://a.dev", title: "A" },
      { url: "https://b.dev", title: "B" },
    ]);
  });
});
