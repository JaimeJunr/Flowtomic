import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { LiquidGauge, type LiquidGaugeProps } from "./liquid-gauge";

const ROOT = '[data-slot="liquid-gauge"]';

class FakeChangeListener {
  values: number[] = [];
  handle = (value: number) => {
    this.values.push(value);
  };
}

function setup(props: LiquidGaugeProps = {}, reduced: "always" | "never" = "always") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <LiquidGauge {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const q = (slot: string) => root.querySelectorAll(`[data-slot="liquid-gauge-${slot}"]`);
  return { ...view, root, q };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("LiquidGauge", () => {
  it("sem interativo expõe role meter com aria-value*", () => {
    setup({ defaultValue: 60 });
    const meter = screen.getByRole("meter", { name: "Nível" });
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuenow", "60");
    expect(meter).toHaveAttribute("aria-valuetext", "60%");
    expect(meter).not.toHaveAttribute("tabindex");
  });

  it("interativo expõe role slider focável", () => {
    setup({ interactive: true, defaultValue: 30 });
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("tabindex", "0");
    expect(slider).toHaveAttribute("aria-valuenow", "30");
  });

  it("setas, PageUp/Down, Home e End chamam onValueChange", () => {
    const listener = new FakeChangeListener();
    setup({ interactive: true, defaultValue: 50, onValueChange: listener.handle });
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    fireEvent.keyDown(slider, { key: "PageUp" });
    fireEvent.keyDown(slider, { key: "Home" });
    fireEvent.keyDown(slider, { key: "End" });
    expect(listener.values).toEqual([51, 50, 60, 0, 100]);
    expect(slider).toHaveAttribute("aria-valuenow", "100");
  });

  it("tecla irrelevante e fim de curso não disparam", () => {
    const listener = new FakeChangeListener();
    setup({ interactive: true, defaultValue: 100, onValueChange: listener.handle });
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "a" });
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(listener.values).toEqual([]);
  });

  it("clique define o nível pela posição vertical", () => {
    const listener = new FakeChangeListener();
    const { root } = setup({ interactive: true, onValueChange: listener.handle });
    const spy = vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      top: 0,
      left: 0,
      right: 88,
      bottom: 180,
      width: 88,
      height: 180,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(root, { clientY: 45, pointerId: 1, button: 0 });
    fireEvent.pointerUp(root, { clientY: 45, pointerId: 1 });
    expect(listener.values).toEqual([75]);
    spy.mockRestore();
  });

  it("arrastar atualiza o nível e soltar encerra", () => {
    const listener = new FakeChangeListener();
    const { root } = setup({ interactive: true, onValueChange: listener.handle });
    const spy = vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      top: 0,
      left: 0,
      right: 88,
      bottom: 200,
      width: 88,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(root, { clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(root, { clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(root, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(root, { clientY: 200, pointerId: 1 });
    expect(listener.values).toEqual([50, 100]);
    spy.mockRestore();
  });

  it("disabled ignora teclado e ponteiro e fica opaco", () => {
    const listener = new FakeChangeListener();
    const { root } = setup({ interactive: true, disabled: true, onValueChange: listener.handle });
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowUp" });
    fireEvent.pointerDown(root, { clientY: 10, pointerId: 1, button: 0 });
    expect(listener.values).toEqual([]);
    expect(root).toHaveClass("opacity-50");
    expect(root).toHaveAttribute("aria-disabled", "true");
  });

  it("valor controlado vindo de fora atualiza mesmo disabled", () => {
    const view = render(
      <MotionConfig reducedMotion="always">
        <LiquidGauge value={20} disabled />
      </MotionConfig>
    );
    view.rerender(
      <MotionConfig reducedMotion="always">
        <LiquidGauge value={80} disabled />
      </MotionConfig>
    );
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "80");
  });

  it("ticks=0 não renderiza riscos; padrão são 3", () => {
    expect(setup({ ticks: 0 }).q("tick")).toHaveLength(0);
    expect(setup().q("tick")).toHaveLength(3);
  });

  it("showValue=false remove o número; unit troca o sufixo", () => {
    expect(setup({ showValue: false }).q("value")).toHaveLength(0);
    const view = setup({ defaultValue: 42, unit: " L" });
    expect(view.q("value")[0]).toHaveTextContent("42 L");
  });

  it("marcador só aparece no modo interativo", () => {
    expect(setup().q("marker")).toHaveLength(0);
    expect(setup({ interactive: true }).q("marker")).toHaveLength(1);
  });

  it("movimento reduzido pinta a superfície reta no nível", () => {
    const { q } = setup({ defaultValue: 50, size: "default" });
    const liquid = q("liquid")[0] as HTMLElement;
    expect(liquid.style.clipPath).toBe(
      "polygon(0% 90px, 50% 90px, 100% 90px, 100% 180px, 0% 180px)"
    );
  });

  it("com movimento, mudança de valor liga a física sem quebrar", () => {
    const view = render(
      <MotionConfig reducedMotion="never">
        <LiquidGauge value={10} />
      </MotionConfig>
    );
    view.rerender(
      <MotionConfig reducedMotion="never">
        <LiquidGauge value={90} />
      </MotionConfig>
    );
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "90");
  });

  it("repassa ref, className e tamanho", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <MotionConfig reducedMotion="always">
        <LiquidGauge ref={ref} className="custom" size="lg" aria-label="Uso da cota" />
      </MotionConfig>
    );
    expect(ref.current).toHaveClass("custom");
    expect(ref.current?.style.width).toBe("112px");
    expect(ref.current?.style.height).toBe("228px");
    expect(screen.getByRole("meter", { name: "Uso da cota" })).toBe(ref.current);
  });
});
