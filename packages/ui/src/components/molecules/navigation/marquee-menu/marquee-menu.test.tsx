import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MarqueeMenu, type MarqueeMenuItem } from "./marquee-menu";

const ITEMS: MarqueeMenuItem[] = [
  { label: "Investimentos", href: "#investimentos" },
  { label: "Previdência", href: "#previdencia", thumbnail: <span data-testid="thumb" /> },
  { label: "Crédito", href: "#credito" },
];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(reduced: "never" | "always" = "never", speed?: number) {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <MarqueeMenu aria-label="Seções" items={ITEMS} speed={speed} />
    </MotionConfig>
  );
  const items = Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-slot="marquee-menu-item"]')
  );
  for (const item of items) {
    item.getBoundingClientRect = () =>
      ({ top: 0, bottom: 100, height: 100, left: 0, right: 600, width: 600 }) as DOMRect;
  }
  return { ...view, items };
}

describe("MarqueeMenu", () => {
  it("renderiza nav com lista e links nomeados pelo rótulo", () => {
    setup();
    expect(screen.getByRole("navigation", { name: "Seções" })).toHaveAttribute(
      "data-slot",
      "marquee-menu"
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Crédito" })).toHaveAttribute("href", "#credito");
  });

  it("repassa ref para a raiz", () => {
    const ref = createRef<HTMLElement>();
    render(<MarqueeMenu ref={ref} aria-label="Seções" items={ITEMS} />);
    expect(ref.current?.tagName).toBe("NAV");
  });

  it("marca a faixa e as cópias como aria-hidden", () => {
    const { container } = setup();
    for (const band of container.querySelectorAll('[data-slot="marquee-menu-band"]')) {
      expect(band).toHaveAttribute("aria-hidden", "true");
    }
    expect(container.querySelectorAll('[data-slot="marquee-menu-track"]')).toHaveLength(3);
  });

  it("pointerenter perto da base marca edge bottom e ativa; sair desativa", () => {
    const { items } = setup();
    expect(items[0]).not.toHaveAttribute("data-active");
    fireEvent.pointerEnter(items[0], { clientY: 95 });
    expect(items[0]).toHaveAttribute("data-edge", "bottom");
    expect(items[0]).toHaveAttribute("data-active");
    fireEvent.pointerLeave(items[0], { clientY: 2 });
    expect(items[0]).not.toHaveAttribute("data-active");
    expect(items[0]).toHaveAttribute("data-edge", "top");
  });

  it("pointerenter perto do topo marca edge top", () => {
    const { items } = setup();
    fireEvent.pointerEnter(items[1], { clientY: 5 });
    expect(items[1]).toHaveAttribute("data-edge", "top");
  });

  it("foco no link ativa o item por cima e blur desativa", () => {
    const { items } = setup();
    const link = screen.getByRole("link", { name: "Previdência" });
    fireEvent.focus(link);
    expect(items[1]).toHaveAttribute("data-active");
    expect(items[1]).toHaveAttribute("data-edge", "top");
    fireEvent.blur(link);
    expect(items[1]).not.toHaveAttribute("data-active");
  });

  it("lança erro com speed <= 0", () => {
    expect(() => render(<MarqueeMenu aria-label="x" items={ITEMS} speed={0} />)).toThrow(
      /speed recebido 0/
    );
  });

  it("lança erro sem itens", () => {
    expect(() => render(<MarqueeMenu aria-label="x" items={[]} />)).toThrow(/items/);
  });

  it("com movimento reduzido ativa sem deslizar", () => {
    const { items, container } = setup("always");
    fireEvent.pointerEnter(items[0], { clientY: 95 });
    expect(items[0]).toHaveAttribute("data-active");
    const band = container.querySelector('[data-slot="marquee-menu-band"]') as HTMLElement;
    expect(band.style.transform).not.toContain("101%");
  });

  it("aceita className e repassa props à nav", () => {
    render(<MarqueeMenu aria-label="Seções" items={ITEMS} className="h-40" data-x="1" />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("h-40");
    expect(nav).toHaveAttribute("data-x", "1");
  });
});
