import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { type CardNavGroup, ExpandingCardNav } from "./expanding-card-nav";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const groups: CardNavGroup[] = [
  {
    label: "Produtos",
    tone: "primary",
    links: [
      { label: "Carteiras", href: "#carteiras" },
      { label: "Câmbio", href: "#cambio" },
    ],
  },
  { label: "Empresa", tone: "foreground", links: [{ label: "Sobre", href: "#sobre" }] },
  { label: "Contato", links: [{ label: "Ouvidoria", href: "#ouvidoria" }] },
];

function setup(
  props: Partial<React.ComponentProps<typeof ExpandingCardNav>> = {},
  reduced = false
) {
  return render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <ExpandingCardNav groups={groups} aria-label="Principal" {...props} />
    </MotionConfig>
  );
}

const content = (c: HTMLElement) => c.querySelector('[data-slot="expanding-card-nav-content"]');

describe("ExpandingCardNav", () => {
  it("marca a raiz e as partes", () => {
    const { container } = setup({
      logo: <span>Logo</span>,
      action: <button type="button">Abrir conta</button>,
    });
    expect(container.querySelector('[data-slot="expanding-card-nav"]')?.tagName).toBe("NAV");
    expect(container.querySelector('[data-slot="expanding-card-nav-bar"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="expanding-card-nav-card"]')).toHaveLength(3);
    expect(screen.getByText("Abrir conta")).toBeInTheDocument();
    expect(screen.getByText("Logo")).toBeInTheDocument();
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLElement>();
    setup({ ref, className: "extra" });
    expect(ref.current?.className).toContain("extra");
  });

  it("começa fechado: conteúdo inert e aria-hidden", () => {
    const { container } = setup();
    const c = content(container) as HTMLElement;
    expect(c).toHaveAttribute("aria-hidden", "true");
    expect(c.hasAttribute("inert")).toBe(true);
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("abre e fecha pelo botão", async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const toggle = screen.getByRole("button", { name: "Abrir menu" });
    expect(toggle.getAttribute("aria-controls")).toBe(content(container)?.id);
    await user.click(toggle);
    const c = content(container) as HTMLElement;
    expect(c.hasAttribute("inert")).toBe(false);
    expect(c).toHaveAttribute("aria-hidden", "false");
    await user.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(c.hasAttribute("inert")).toBe(true);
  });

  it("fecha com Esc", async () => {
    const user = userEvent.setup();
    setup({ defaultOpen: true });
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeInTheDocument();
  });

  it("fecha ao clicar num link", async () => {
    const user = userEvent.setup();
    setup({ defaultOpen: true });
    await user.click(screen.getByRole("link", { name: "Sobre" }));
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeInTheDocument();
  });

  it("modo controlado chama onOpenChange e não muda sozinho", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    setup({ open: false, onOpenChange });
    await user.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeInTheDocument();
  });

  it("cada grupo é uma section com lista", () => {
    setup({ defaultOpen: true });
    const section = screen.getByRole("region", { name: "Produtos" });
    expect(section.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
  });

  it("aplica as classes do tom", () => {
    const { container } = setup();
    const cards = container.querySelectorAll('[data-slot="expanding-card-nav-card"]');
    expect(cards[0].className).toContain("bg-primary");
    expect(cards[1].className).toContain("bg-foreground");
    expect(cards[2].className).toContain("bg-muted");
  });

  it("usa aria-label do link quando informado", () => {
    setup({
      defaultOpen: true,
      groups: [{ label: "A", links: [{ label: "X", href: "#x", ariaLabel: "Ir para X" }] }],
    });
    expect(screen.getByRole("link", { name: "Ir para X" })).toBeInTheDocument();
  });

  it("rejeita 0 e mais de 4 grupos", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ExpandingCardNav groups={[]} />)).toThrow(/0 groups/);
    expect(() => render(<ExpandingCardNav groups={[...groups, ...groups]} />)).toThrow(/6 groups/);
    spy.mockRestore();
  });

  it("funciona em movimento reduzido", async () => {
    const user = userEvent.setup();
    const { container } = setup({}, true);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(content(container)?.hasAttribute("inert")).toBe(false);
    await user.keyboard("{Escape}");
    expect(content(container)?.hasAttribute("inert")).toBe(true);
  });
});
