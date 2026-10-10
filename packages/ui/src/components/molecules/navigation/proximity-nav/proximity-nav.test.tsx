import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProximityNav } from "./proximity-nav";

const ITEMS = ["Visão geral", "Carteiras", "Risco"];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

// jsdom não faz layout: cada botão ganha um retângulo de 40 px a cada 100 px.
function fakeLayout(): HTMLElement[] {
  const buttons = screen.getAllByRole("button");
  buttons.forEach((button, i) => {
    button.getBoundingClientRect = () =>
      ({
        top: i * 100,
        height: 40,
        bottom: i * 100 + 40,
        left: 0,
        right: 100,
        width: 100,
      }) as DOMRect;
  });
  return buttons;
}

const influence = (el: HTMLElement) => el.style.getPropertyValue("--p");

describe("ProximityNav", () => {
  it("renderiza nav com um botão por item e o índice com dois dígitos", () => {
    render(<ProximityNav items={ITEMS} />);
    expect(screen.getByRole("navigation", { name: "Seções" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    // A cópia colorida (aria-hidden) repete o texto: o nome acessível vem só da cópia base.
    expect(screen.getByRole("button", { name: "01 Visão geral" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "03 Risco" })).toBeInTheDocument();
  });

  it("clique ativa o item e chama onItemSelect", () => {
    const onItemSelect = vi.fn();
    render(<ProximityNav items={ITEMS} onItemSelect={onItemSelect} />);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(screen.getAllByRole("button")[1]).toHaveAttribute("aria-current", "true");
    expect(onItemSelect).toHaveBeenCalledWith(1, "Carteiras");
  });

  it("no modo controlado quem manda é activeIndex", () => {
    render(<ProximityNav items={ITEMS} activeIndex={2} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getAllByRole("button")[2]).toHaveAttribute("aria-current", "true");
    expect(screen.getAllByRole("button")[0]).not.toHaveAttribute("aria-current");
  });

  it("pointermove define --p alto no item sob o ponteiro e 0 longe; pointerleave zera", () => {
    render(<ProximityNav items={ITEMS} radius={100} />);
    const buttons = fakeLayout();
    const nav = screen.getByRole("navigation");
    fireEvent.pointerMove(nav, { clientY: 20 });
    expect(Number(influence(buttons[0]))).toBe(1);
    expect(Number(influence(buttons[2]))).toBe(0);
    fireEvent.pointerLeave(nav);
    for (const b of buttons) expect(Number(influence(b))).toBe(0);
  });

  it("foco no botão define --p = 1", () => {
    render(<ProximityNav items={ITEMS} />);
    const buttons = fakeLayout();
    fireEvent.focus(buttons[1]);
    expect(Number(influence(buttons[1]))).toBe(1);
    expect(Number(influence(buttons[0]))).toBe(0);
    fireEvent.blur(buttons[1]);
    expect(Number(influence(buttons[1]))).toBe(0);
  });

  it("showMarker={false} remove marcadores e tracinhos", () => {
    const { container } = render(<ProximityNav items={ITEMS} showMarker={false} />);
    expect(container.querySelector('[data-slot="proximity-nav-marker"]')).toBeNull();
    expect(container.querySelector('[data-slot="proximity-nav-tick"]')).toBeNull();
  });

  it("showIndex={false} esconde o número", () => {
    render(<ProximityNav items={ITEMS} showIndex={false} />);
    expect(screen.queryAllByText("01")).toHaveLength(0);
  });

  it("tem tracinhos só entre itens", () => {
    const { container } = render(<ProximityNav items={ITEMS} />);
    expect(container.querySelectorAll('[data-slot="proximity-nav-tick"]')).toHaveLength(2);
  });

  it("com movimento reduzido não há translateX nem scaleX", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <ProximityNav items={ITEMS} />
      </MotionConfig>
    );
    const label = container.querySelector('[data-slot="proximity-nav-label"]') as HTMLElement;
    const marker = container.querySelector('[data-slot="proximity-nav-marker"]') as HTMLElement;
    expect(label.style.transform).toBe("");
    expect(marker.style.transform).toBe("");
  });

  it("sem movimento reduzido o rótulo desliza por translateX", () => {
    const { container } = render(<ProximityNav items={ITEMS} maxShift={30} />);
    const label = container.querySelector('[data-slot="proximity-nav-label"]') as HTMLElement;
    expect(label.style.transform).toContain("translateX");
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLElement>();
    render(<ProximityNav ref={ref} items={ITEMS} className="custom" />);
    expect(ref.current).toBe(screen.getByRole("navigation"));
    expect(ref.current).toHaveClass("custom");
    expect(ref.current).toHaveAttribute("data-slot", "proximity-nav");
  });
});
