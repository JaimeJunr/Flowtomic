import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SiteHeader, type SiteHeaderProps } from "./site-header";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  vi.restoreAllMocks();
});

const nav: NonNullable<SiteHeaderProps["nav"]> = [
  {
    label: "Componentes",
    items: [
      { label: "Atoms", href: "/atoms", description: "Peças pequenas" },
      { label: "Organisms", href: "/organisms", description: "Peças compostas" },
    ],
  },
  { label: "Blocks", href: "/blocks", active: true },
  { label: "Docs", href: "https://docs.exemplo.dev", external: true },
];

const actions: NonNullable<SiteHeaderProps["actions"]> = [
  { label: "GitHub", href: "https://github.com/x", variant: "outline" },
  { label: "Instalar", href: "/instalar", variant: "default" },
];

function setup(props: Partial<SiteHeaderProps> = {}) {
  return render(
    <SiteHeader logo={<span>flowtomic</span>} nav={nav} actions={actions} {...props} />
  );
}

describe("SiteHeader", () => {
  it("logo com link e item ativo com aria-current", () => {
    setup({ logoHref: "/inicio" });
    expect(screen.getByRole("link", { name: "flowtomic" })).toHaveAttribute("href", "/inicio");
    const principal = screen.getByRole("navigation", { name: "Principal" });
    expect(within(principal).getByRole("link", { name: "Blocks" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("banner")).toHaveAttribute("data-slot", "site-header");
  });

  it("item com filhos abre o painel com links e descrições", async () => {
    const user = userEvent.setup({ skipHover: true });
    setup();
    await user.click(screen.getByRole("button", { name: /Componentes/ }));
    expect(await screen.findByRole("link", { name: /Atoms/ })).toHaveAttribute("href", "/atoms");
    expect(screen.getByText("Peças compostas")).toBeInTheDocument();
  });

  it("link externo abre em nova aba, com ícone e texto para leitor de tela", () => {
    setup();
    const docs = screen.getByRole("link", { name: /Docs/ });
    expect(docs).toHaveAttribute("target", "_blank");
    expect(docs).toHaveAttribute("rel", "noreferrer");
    expect(within(docs).getByText("(abre em nova aba)")).toBeInTheDocument();
  });

  it("uma ação sólida e a outra contornada", () => {
    setup();
    const github = screen.getByRole("link", { name: "GitHub" });
    const instalar = screen.getByRole("link", { name: "Instalar" });
    expect(instalar.className).toContain("bg-primary");
    expect(github.className).toContain("border");
    expect(github.className).not.toContain("bg-primary");
  });

  it("duas ações sólidas disparam console.warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setup({
      actions: [
        { label: "A", href: "/a", variant: "default" },
        { label: "B", href: "/b", variant: "default" },
      ],
    });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("uma ação sólida não avisa", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setup();
    expect(warn).not.toHaveBeenCalled();
  });

  it("modo estreito: botão de menu abre o painel com navegação e ações", async () => {
    const user = userEvent.setup({ skipHover: true });
    setup({ layout: "mobile" });
    expect(screen.queryByRole("navigation", { name: "Principal" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "GitHub" })).not.toBeInTheDocument();
    const botao = screen.getByRole("button", { name: "Abrir menu" });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    await user.click(botao);
    const menu = await screen.findByRole("dialog");
    expect(menu).toHaveAttribute("data-slot", "site-header-mobile-menu");
    const navegacao = within(menu).getByRole("navigation", { name: "Menu" });
    expect(within(navegacao).getByText("Componentes")).toBeInTheDocument();
    expect(within(navegacao).getByRole("link", { name: /Atoms/ })).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: "GitHub" })).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: "Instalar" })).toBeInTheDocument();
  });

  it("modo estreito: busca vira ícone que abre o menu", async () => {
    const user = userEvent.setup({ skipHover: true });
    setup({ layout: "mobile", search: <input aria-label="Buscar no site" /> });
    await user.click(screen.getByRole("button", { name: "Abrir busca" }));
    const menu = await screen.findByRole("dialog");
    expect(within(menu).getByLabelText("Buscar no site")).toBeInTheDocument();
  });

  it("modo largo não traz o botão de menu", () => {
    setup({ layout: "desktop" });
    expect(screen.queryByRole("button", { name: "Abrir menu" })).not.toBeInTheDocument();
  });

  it("sub-navegação com título e aba ativa", () => {
    setup({
      subnav: {
        title: "Gateway",
        items: [
          { label: "Visão geral", href: "/g", active: true },
          { label: "Preços", href: "/g/precos" },
        ],
      },
    });
    const sub = screen.getByRole("navigation", { name: "Gateway" });
    expect(sub).toHaveAttribute("data-slot", "site-header-subnav");
    expect(within(sub).getByRole("link", { name: "Visão geral" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(sub).getByRole("link", { name: "Preços" })).not.toHaveAttribute("aria-current");
  });

  it("link de pular para o conteúdo aponta para o alvo", () => {
    const { rerender } = setup();
    expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
      "href",
      "#conteudo"
    );
    rerender(<SiteHeader logo="x" skipToContent="#main" />);
    expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
      "href",
      "#main"
    );
    rerender(<SiteHeader logo="x" skipToContent={false} />);
    expect(screen.queryByRole("link", { name: "Pular para o conteúdo" })).not.toBeInTheDocument();
  });

  it("sticky por padrão e opcional", () => {
    const { rerender } = setup();
    expect(screen.getByRole("banner").className).toContain("sticky");
    rerender(<SiteHeader logo="x" sticky={false} />);
    expect(screen.getByRole("banner").className).not.toContain("sticky");
  });
});
