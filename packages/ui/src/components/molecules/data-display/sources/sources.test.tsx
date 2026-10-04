import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import {
  isSafeSourceUrl,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  uniqueSources,
} from "./sources";

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

describe("Source: endereços ausentes e conteúdo próprio", () => {
  it("sem href mostra o nome da fonte, sem link", () => {
    render(<Source title="fonte sem endereço" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("fonte sem endereço")).toBeInTheDocument();
  });

  it("endereço malformado não vira link e não quebra", () => {
    render(<Source href="http://" title="fonte quebrada" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("fonte quebrada")).toBeInTheDocument();
  });

  it("usa o conteúdo passado em vez do título com ícone, com ou sem link", () => {
    const { rerender } = render(
      <Source href="https://a.dev">
        <b>Conteúdo próprio</b>
      </Source>
    );
    expect(screen.getByRole("link", { name: "Conteúdo próprio" })).toBeInTheDocument();
    rerender(
      <Source href="javascript:alert(1)">
        <b>Conteúdo próprio</b>
      </Source>
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Conteúdo próprio")).toBeInTheDocument();
  });

  it("deixa o chamador sobrescrever atributos do link, como target", () => {
    render(<Source href="https://a.dev" title="fonte" target="_self" />);
    expect(screen.getByRole("link", { name: /fonte/ })).toHaveAttribute("target", "_self");
  });

  it.each([
    [undefined, false],
    ["", false],
    ["https://a.dev", true],
    ["/relativo/ok", true],
    ["ftp://a.dev", false],
    ["http://", false],
  ])("isSafeSourceUrl(%j) é %s", (href, esperado) => {
    expect(isSafeSourceUrl(href)).toBe(esperado);
  });
});

describe("Sources: abrir e fechar", () => {
  it("o gatilho abre e fecha as fontes pelo teclado", async () => {
    const user = userEvent.setup();
    render(
      <Sources>
        <SourcesTrigger count={1} />
        <SourcesContent>
          <Source href="https://a.dev" title="A" />
        </SourcesContent>
      </Sources>
    );
    screen.getByRole("button", { name: "Usou 1 fonte" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("link", { name: "A" })).toBeVisible();
    await user.keyboard(" ");
    expect(screen.queryByRole("link", { name: "A" })).not.toBeInTheDocument();
  });

  it("o gatilho aceita conteúdo próprio no lugar da contagem padrão", () => {
    render(
      <Sources>
        <SourcesTrigger count={3}>Ver referências</SourcesTrigger>
        <SourcesContent>x</SourcesContent>
      </Sources>
    );
    expect(screen.getByRole("button", { name: "Ver referências" })).toBeInTheDocument();
    expect(screen.queryByText(/Usou 3/)).not.toBeInTheDocument();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <Sources>
        <SourcesTrigger count={2} />
        <SourcesContent>
          <Source href="https://a.dev" title="A" />
          <Source href="https://b.dev" title="B" />
        </SourcesContent>
      </Sources>
    );
    await userEvent.click(screen.getByRole("button", { name: "Usou 2 fontes" }));
    const resultado = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toEqual([]);
  });
});
