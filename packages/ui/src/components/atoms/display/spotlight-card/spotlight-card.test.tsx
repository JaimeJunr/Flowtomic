import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SpotlightCard, type SpotlightCardProps } from "./spotlight-card";

const ROOT = '[data-slot="spotlight-card"]';
const RECT = { left: 100, top: 100, right: 300, bottom: 200, width: 200, height: 100 };

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function mockRect(el: Element, rect = RECT) {
  el.getBoundingClientRect = () => ({ ...rect, x: rect.left, y: rect.top, toJSON: () => ({}) });
}

function setup(props: SpotlightCardProps = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <SpotlightCard {...props}>Fundo Alfa</SpotlightCard>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  mockRect(root);
  return { ...view, root };
}

const point = (clientX: number, clientY: number) =>
  act(() => void window.dispatchEvent(new MouseEvent("pointermove", { clientX, clientY })));

describe("SpotlightCard", () => {
  it("expõe ref, className, data-slot e props nativas na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "fundo", title: "Alfa" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "bg-card", "rounded-lg");
    expect(root).toHaveAttribute("id", "fundo");
    expect(root).toHaveAttribute("title", "Alfa");
    expect(root).toHaveTextContent("Fundo Alfa");
  });

  it("as camadas de luz são decorativas", () => {
    const { container } = setup();
    const light = container.querySelector('[data-slot="spotlight-card-light"]');
    const border = container.querySelector('[data-slot="spotlight-card-border"]');
    expect(light).toHaveAttribute("aria-hidden", "true");
    expect(border).toHaveAttribute("aria-hidden", "true");
  });

  it("acende com o ponteiro dentro e apaga longe", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-lit", "false");
    point(150, 150);
    expect(root).toHaveAttribute("data-lit", "true");
    point(900, 900);
    expect(root).toHaveAttribute("data-lit", "false");
  });

  it("a 40 px com proximity 80 já está aceso; a 120 px não", () => {
    const { root } = setup({ proximity: 80 });
    point(340, 150);
    expect(root).toHaveAttribute("data-lit", "true");
    point(420, 150);
    expect(root).toHaveAttribute("data-lit", "false");
  });

  it("proximity 0 só acende com hover", () => {
    const { root } = setup({ proximity: 0 });
    point(340, 150);
    expect(root).toHaveAttribute("data-lit", "false");
    point(150, 150);
    expect(root).toHaveAttribute("data-lit", "true");
  });

  it("grava posição e opacidade por quadro nas variáveis, sem re-render", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { root } = setup({ smoothing: 0 });
    point(150, 130);
    act(() => void vi.advanceTimersByTime(100));
    expect(root.style.getPropertyValue("--sx")).toBe("50px");
    expect(root.style.getPropertyValue("--sy")).toBe("30px");
    expect(root.style.getPropertyValue("--so")).toBe("1");
    point(900, 900);
    act(() => void vi.advanceTimersByTime(100));
    expect(root.style.getPropertyValue("--so")).toBe("0");
    vi.useRealTimers();
  });

  it("dois cartões compartilham um único listener no window", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const view = render(
      <>
        <SpotlightCard>A</SpotlightCard>
        <SpotlightCard>B</SpotlightCard>
      </>
    );
    expect(add.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(1);
    view.unmount();
    expect(remove.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(1);
    add.mockRestore();
    remove.mockRestore();
  });

  it("pressionar liga o flare e soltar desliga; flare={false} ignora", () => {
    const { root, unmount } = setup();
    expect(root).toHaveAttribute("data-flare", "false");
    fireEvent.pointerDown(root);
    expect(root).toHaveAttribute("data-flare", "true");
    fireEvent.pointerUp(root);
    unmount();
    const off = setup({ flare: false });
    fireEvent.pointerDown(off.root);
    expect(off.root).toHaveAttribute("data-flare", "false");
  });

  it("o flare volta 300 ms depois de soltar", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { root } = setup();
    fireEvent.pointerDown(root);
    fireEvent.pointerUp(root);
    expect(root).toHaveAttribute("data-flare", "true");
    act(() => void vi.advanceTimersByTime(300));
    expect(root).toHaveAttribute("data-flare", "false");
    vi.useRealTimers();
  });

  it("shape beam grava as variáveis do feixe", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { root } = setup({ shape: "beam", smoothing: 0 });
    point(150, 130);
    act(() => void vi.advanceTimersByTime(100));
    expect(root.style.getPropertyValue("--bx")).not.toBe("");
    expect(Number.parseFloat(root.style.getPropertyValue("--bry"))).toBeCloseTo(110);
    vi.useRealTimers();
  });

  it("movimento reduzido: luz fixa no centro-topo, sem seguir nem flare", () => {
    const { root } = setup({}, "always");
    point(120, 190);
    expect(root).toHaveAttribute("data-lit", "true");
    expect(root.style.getPropertyValue("--sx")).toBe("100px");
    point(280, 110);
    expect(root.style.getPropertyValue("--sx")).toBe("100px");
    fireEvent.pointerDown(root);
    expect(root).toHaveAttribute("data-flare", "false");
    point(900, 900);
    expect(root).toHaveAttribute("data-lit", "false");
    expect(root.style.getPropertyValue("--so")).toBe("0");
  });

  it("ambient acende sozinho, e sem ambient nada acende", () => {
    const quiet = setup();
    expect(quiet.root).toHaveAttribute("data-lit", "false");
    quiet.unmount();
    const { root } = setup({ ambient: true });
    expect(root).toHaveAttribute("data-lit", "true");
  });
});
