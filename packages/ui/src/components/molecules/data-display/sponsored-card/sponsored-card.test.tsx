import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { contrast, parseOklch, readBlock, readToken } from "../../../../test/brand-contrast";
import { SponsoredCard, type SponsoredCardProps } from "./sponsored-card";

const ad: SponsoredCardProps = {
  advertiser: "Constelação",
  title: "API compatível com OpenAI",
  body: "Crie uma chave e use vários modelos com seu saldo da Constelação.",
  href: "https://constelacaoai.com.br/?utm_source=chat",
  displayHost: "constelacaoai.com.br",
};

describe("SponsoredCard", () => {
  it("identifica o anúncio na hora, com o rótulo antes do conteúdo e quem paga primeiro", () => {
    render(<SponsoredCard {...ad} />);
    const card = screen.getByRole("complementary", { name: "Anúncio patrocinado" });
    const text = card.textContent ?? "";
    expect(text.indexOf("Patrocinado")).toBeLessThan(text.indexOf("Constelação"));
    expect(text.indexOf("Constelação")).toBeLessThan(text.indexOf("API compatível com OpenAI"));
    expect(card).toHaveAttribute("data-slot", "sponsored-card");
    expect(card).toHaveAttribute("data-variant", "tab");
  });

  it("leva ao anunciante em nova aba, marcado como patrocinado para buscadores", () => {
    render(<SponsoredCard {...ad} />);
    const link = screen.getByRole("link", { name: /constelacaoai\.com\.br/ });
    expect(link).toHaveAttribute("href", ad.href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["sponsored", "noopener", "noreferrer"])
    );
    expect(link).toHaveAccessibleName("constelacaoai.com.br (abre em nova aba)");
  });

  it("não vira link quando o endereço do anúncio é perigoso", () => {
    render(<SponsoredCard {...ad} href="javascript:alert(1)" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("constelacaoai.com.br")).toBeInTheDocument();
  });

  it("mostra o logo do anunciante, ou a inicial enquanto não houver logo", () => {
    const { rerender, container } = render(<SponsoredCard {...ad} />);
    expect(container.querySelector('[data-slot="sponsored-card-logo"]')).toHaveTextContent("C");
    rerender(<SponsoredCard {...ad} logoSrc="/logo.png" />);
    const logo = container.querySelector('[data-slot="sponsored-card-logo"] img');
    expect(logo).toHaveAttribute("src", "/logo.png");
    expect(logo).toHaveAttribute("alt", "");
  });

  it("recolhido mostra só quem paga e o título; abre pelo cabeçalho", async () => {
    render(<SponsoredCard {...ad} collapsible />);
    const toggle = screen.getByRole("button", { name: /API compatível com OpenAI/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(ad.body as string)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(ad.body as string)).toBeVisible();
    expect(screen.getByRole("link", { name: /constelacaoai/ })).toBeVisible();
  });

  it("deixa o app controlar o aberto (ex.: só o anúncio mais recente aberto)", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <SponsoredCard {...ad} collapsible open onOpenChange={onOpenChange} />
    );
    expect(screen.getByText(ad.body as string)).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /API compatível/ }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(<SponsoredCard {...ad} collapsible open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByText(ad.body as string)).not.toBeInTheDocument();
  });

  it("sem collapsible, o cabeçalho não é botão e o conteúdo fica sempre à vista", () => {
    render(<SponsoredCard {...ad} />);
    expect(screen.queryByRole("button", { name: /API compatível/ })).not.toBeInTheDocument();
    expect(screen.getByText(ad.body as string)).toBeVisible();
  });

  it("junta os controles do app num menu de opções", async () => {
    const onHide = vi.fn();
    const onReport = vi.fn();
    render(
      <SponsoredCard
        {...ad}
        actions={[
          { label: "Ocultar anúncio", onSelect: onHide },
          { label: "Denunciar anúncio", onSelect: onReport, separated: true },
        ]}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Opções do anúncio" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Denunciar anúncio" }));
    expect(onReport).toHaveBeenCalledOnce();
    expect(onHide).not.toHaveBeenCalled();
  });

  it("sem ações, não mostra o botão de opções", () => {
    render(<SponsoredCard {...ad} />);
    expect(screen.queryByRole("button", { name: "Opções do anúncio" })).not.toBeInTheDocument();
  });

  it("mostra dentro do card o que o app passar como filho (explicação, denúncia)", () => {
    render(
      <SponsoredCard {...ad}>
        <p>O anúncio não altera a resposta do modelo.</p>
      </SponsoredCard>
    );
    expect(
      screen.getByRole("complementary").contains(screen.getByText(/não altera a resposta/))
    ).toBe(true);
  });

  it.each([
    ["advertiser", ["Constelação", "Patrocinado", "API compatível"]],
    ["bar", ["Patrocinado", "API compatível"]],
    ["footnote", ["Patrocinado", "Constelação", "API compatível"]],
  ] as const)("o formato %s também identifica o anúncio e leva ao anunciante", (variant, order) => {
    render(<SponsoredCard {...ad} variant={variant} />);
    const card = screen.getByRole("complementary", { name: "Anúncio patrocinado" });
    expect(card).toHaveAttribute("data-variant", variant);
    const positions = order.map((text) => (card.textContent ?? "").indexOf(text));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(screen.getByRole("link", { name: /constelacaoai/ })).toHaveAttribute("href", ad.href);
  });

  it("o rodapé não recolhe: já é a forma mais curta", () => {
    render(<SponsoredCard {...ad} variant="footnote" collapsible />);
    expect(screen.queryByRole("button", { name: /API compatível/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Crie uma chave/)).toBeVisible();
  });

  it("aceita rótulos traduzidos", () => {
    render(
      <SponsoredCard
        {...ad}
        label="Sponsored"
        regionLabel="Sponsored ad"
        newTabLabel="opens in a new tab"
      />
    );
    expect(screen.getByRole("complementary", { name: "Sponsored ad" })).toHaveTextContent(
      "Sponsored"
    );
    expect(screen.getByRole("link")).toHaveAccessibleName(
      "constelacaoai.com.br (opens in a new tab)"
    );
  });

  it.each([
    "tab",
    "advertiser",
    "bar",
    "footnote",
  ] as const)("o formato %s passa no axe", async (variant) => {
    const { container } = render(
      <SponsoredCard
        {...ad}
        variant={variant}
        collapsible
        defaultOpen
        actions={[{ label: "Ocultar anúncio", onSelect: () => {} }]}
      />
    );
    const { violations } = await axe.run(container);
    expect(violations).toEqual([]);
  });
});

describe("tokens --sponsored-*", () => {
  const globalsCss = readFileSync(
    path.resolve(__dirname, "../../../../../../styles/globals.css"),
    "utf8"
  );
  const pairs: Array<[string, string, number]> = [
    ["--sponsored", "--sponsored-foreground", 4.5],
    ["--sponsored", "--sponsored-muted", 4.5],
    ["--sponsored-badge", "--sponsored-badge-foreground", 4.5],
  ];

  it.each([":root", ".dark"])("texto e selo legíveis sobre a areia em %s", (selector) => {
    const block = readBlock(globalsCss, selector);
    for (const [bg, fg, min] of pairs) {
      const ratio = contrast(parseOklch(readToken(block, bg)), parseOklch(readToken(block, fg)));
      expect(ratio, `${selector} ${fg} sobre ${bg}`).toBeGreaterThanOrEqual(min);
    }
  });

  it.each([":root", ".dark"])("o anúncio não usa a cor da marca em %s", (selector) => {
    const block = readBlock(globalsCss, selector);
    for (const name of ["--sponsored", "--sponsored-badge"]) {
      expect(readToken(block, name)).not.toBe(readToken(block, "--primary"));
    }
  });
});
