import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { OptionWheel, type OptionWheelProps } from "./option-wheel";

const OPTIONS = ["Diário", "Semanal", "Mensal", "Trimestral"];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "Date",
      "performance",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: Partial<OptionWheelProps> = {}, reducedMotion: "never" | "always" = "never") {
  return render(
    <MotionConfig reducedMotion={reducedMotion}>
      <OptionWheel aria-label="Periodicidade" options={OPTIONS} {...props} />
    </MotionConfig>
  );
}

const root = () => screen.getByRole("listbox");
const option = (name: string) => screen.getByRole("option", { name });
const press = (key: string) => fireEvent.keyDown(root(), { key });

describe("OptionWheel", () => {
  it("marca a raiz e a opção ativa", () => {
    setup({ side: "right", defaultValue: 1 });
    expect(root()).toHaveAttribute("data-slot", "option-wheel");
    expect(root()).toHaveAttribute("data-side", "right");
    expect(root()).toHaveAttribute("aria-label", "Periodicidade");
    expect(option("Semanal")).toHaveAttribute("aria-selected", "true");
    expect(option("Semanal")).toHaveAttribute("data-slot", "option-wheel-option");
    expect(option("Semanal")).toHaveAttribute("data-active", "true");
    expect(root().getAttribute("aria-activedescendant")).toBe(option("Semanal").id);
  });

  it("seta para baixo seleciona a próxima e avisa", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    press("ArrowDown");
    expect(onValueChange).toHaveBeenCalledWith(1, "Semanal");
    expect(option("Semanal")).toHaveAttribute("aria-selected", "true");
    press("ArrowUp");
    expect(onValueChange).toHaveBeenLastCalledWith(0, "Diário");
  });

  it("no último sem loop não avança nem avisa", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange, defaultValue: 3 });
    press("ArrowDown");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(option("Trimestral")).toHaveAttribute("aria-selected", "true");
  });

  it("com loop volta ao primeiro", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange, defaultValue: 3, loop: true });
    press("ArrowDown");
    expect(onValueChange).toHaveBeenCalledWith(0, "Diário");
  });

  it("Home e End vão aos extremos", () => {
    setup({ defaultValue: 1 });
    press("End");
    expect(option("Trimestral")).toHaveAttribute("aria-selected", "true");
    press("Home");
    expect(option("Diário")).toHaveAttribute("aria-selected", "true");
  });

  it("clique numa opção a seleciona", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    fireEvent.click(option("Mensal"));
    expect(onValueChange).toHaveBeenCalledWith(2, "Mensal");
  });

  it("modo controlado manda no valor", () => {
    const onValueChange = vi.fn();
    const view = setup({ value: 0, onValueChange });
    press("ArrowDown");
    expect(onValueChange).toHaveBeenCalledWith(1, "Semanal");
    expect(option("Diário")).toHaveAttribute("aria-selected", "true");
    view.rerender(
      <MotionConfig reducedMotion="never">
        <OptionWheel aria-label="Periodicidade" options={OPTIONS} value={2} />
      </MotionConfig>
    );
    expect(option("Mensal")).toHaveAttribute("aria-selected", "true");
  });

  it("roda do mouse: 120 px de deltaY andam 2 opções", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    fireEvent.wheel(root(), { deltaY: 120 });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(2, "Mensal");
  });

  it("roda acumula deltas menores que 60 px", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    fireEvent.wheel(root(), { deltaY: 40 });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.wheel(root(), { deltaY: 40 });
    expect(onValueChange).toHaveBeenCalledWith(1, "Semanal");
  });

  it("roda no extremo sem loop não segura a página", () => {
    setup({ defaultValue: 3 });
    const event = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    root().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("roda fora do extremo segura a página", () => {
    setup();
    const event = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
    act(() => {
      root().dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it("arrastar para cima avança pela altura da opção", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    // 3rem * 1.4 = 67,2 px com 16 px por rem: 140 px de arrasto = 2 opções.
    fireEvent.pointerDown(root(), { clientY: 300, button: 0 });
    fireEvent.pointerMove(root(), { clientY: 160 });
    fireEvent.pointerUp(root(), { clientY: 160 });
    expect(onValueChange).toHaveBeenLastCalledWith(2, "Mensal");
  });

  it("draggable=false ignora o arrasto", () => {
    const onValueChange = vi.fn();
    setup({ onValueChange, draggable: false });
    fireEvent.pointerDown(root(), { clientY: 300, button: 0 });
    fireEvent.pointerMove(root(), { clientY: 100 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("anima a posição até o alvo", () => {
    setup();
    press("ArrowDown");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(option("Semanal").style.opacity).toBe("1");
    expect(option("Diário").style.opacity).toBe("0.75");
  });

  it("movimento reduzido: posição já no alvo e sem blur", () => {
    setup({}, "always");
    press("ArrowDown");
    expect(option("Semanal").style.opacity).toBe("1");
    expect(option("Semanal").style.filter).toBe("");
    expect(option("Diário").style.filter).toBe("");
  });

  it("passa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, className: "h-96" });
    expect(ref.current).toBe(root());
    expect(root()).toHaveClass("h-96");
  });

  it("lança erro com options vazio", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => setup({ options: [] })).toThrow(/received.*\[\].*at least 1/);
    spy.mockRestore();
  });
});
