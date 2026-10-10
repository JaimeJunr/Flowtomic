import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { GooTabs, type GooTabsItem } from "./goo-tabs";

const ITEMS: GooTabsItem[] = [
  { value: "inicio", label: "Início" },
  { value: "carteiras", label: "Carteiras" },
  { value: "relatorios", label: "Relatórios" },
];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const particles = (c: HTMLElement) => c.querySelectorAll('[data-slot="goo-tabs-particle"]');

function renderTabs(props: Partial<React.ComponentProps<typeof GooTabs>> = {}, reduced = false) {
  return render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <GooTabs items={ITEMS} duration={50} {...props} />
    </MotionConfig>
  );
}

describe("GooTabs", () => {
  it("renderiza os itens e marca o primeiro como ativo por padrão", () => {
    renderTabs();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Início" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Navegação principal");
  });

  it("respeita defaultValue", () => {
    renderTabs({ defaultValue: "carteiras" });
    expect(screen.getByRole("button", { name: "Carteiras" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("clique troca o ativo, avisa e cria as bolinhas que depois somem", async () => {
    const onValueChange = vi.fn();
    const { container } = renderTabs({ onValueChange, particleCount: 7 });
    await userEvent.click(screen.getByRole("button", { name: "Relatórios" }));
    expect(onValueChange).toHaveBeenCalledWith("relatorios");
    expect(screen.getByRole("button", { name: "Relatórios" })).toHaveAttribute(
      "data-active",
      "true"
    );
    expect(particles(container)).toHaveLength(7);
    await waitFor(() => expect(particles(container)).toHaveLength(0));
  });

  it("troca a cor do texto no meio do pulo", async () => {
    renderTabs();
    const target = screen.getByRole("button", { name: "Carteiras" });
    await userEvent.click(target);
    await waitFor(() => expect(target.className).toContain("text-primary-foreground"));
  });

  it("o item que perde a pílula sai da cor de destaque na hora", async () => {
    render(<GooTabs items={ITEMS} duration={5000} />);
    const previous = screen.getByRole("button", { name: ITEMS[0].label });
    await userEvent.click(screen.getByRole("button", { name: "Carteiras" }));
    expect(previous.className).not.toContain("text-primary-foreground");
  });

  it("modo controlado manda no ativo", async () => {
    const onValueChange = vi.fn();
    renderTabs({ value: "inicio", onValueChange });
    await userEvent.click(screen.getByRole("button", { name: "Carteiras" }));
    expect(onValueChange).toHaveBeenCalledWith("carteiras");
    expect(screen.getByRole("button", { name: "Início" })).toHaveAttribute("aria-current", "page");
  });

  it("clique no item ativo não chama nem cria bolinhas", async () => {
    const onValueChange = vi.fn();
    const { container } = renderTabs({ onValueChange });
    await userEvent.click(screen.getByRole("button", { name: "Início" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(particles(container)).toHaveLength(0);
  });

  it("item com href vira link", () => {
    renderTabs({ items: [{ value: "a", label: "Painel", href: "/painel" }, ...ITEMS] });
    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("href", "/painel");
  });

  it("setas movem o foco sem ativar", () => {
    const onValueChange = vi.fn();
    renderTabs({ onValueChange });
    const [first, second, third] = screen.getAllByRole("button");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: "ArrowRight" });
    expect(third).toHaveFocus();
    fireEvent.keyDown(third, { key: "ArrowLeft" });
    expect(second).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("o filtro tem id sem dois pontos e a camada de efeito o referencia", () => {
    const { container } = renderTabs();
    const filter = container.querySelector('[data-slot="goo-tabs-filter"]') as Element;
    expect(filter.id).not.toContain(":");
    expect(container.querySelector(`[style*="url(#${filter.id})"]`)).not.toBeNull();
  });

  it("movimento reduzido: sem bolinhas nem filtro, mas troca o ativo", async () => {
    const { container } = renderTabs({}, true);
    await userEvent.click(screen.getByRole("button", { name: "Carteiras" }));
    expect(screen.getByRole("button", { name: "Carteiras" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(particles(container)).toHaveLength(0);
    expect(container.querySelector('[data-slot="goo-tabs-filter"]')).toBeNull();
  });

  it("lança erro com items vazio citando o valor recebido", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<GooTabs items={[]} />)).toThrow(/received items=\[\]/);
    spy.mockRestore();
  });

  it("repassa ref, className e data-slot", () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderTabs({ ref, className: "minha-classe" });
    const root = container.querySelector('[data-slot="goo-tabs"]');
    expect(root).toBe(ref.current);
    expect(root).toHaveClass("minha-classe");
    expect(container.querySelector('[data-slot="goo-tabs-pill"]')).not.toBeNull();
  });
});
