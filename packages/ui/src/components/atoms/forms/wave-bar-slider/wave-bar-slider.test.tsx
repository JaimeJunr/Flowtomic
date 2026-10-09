import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { WaveBarSlider } from "./wave-bar-slider";

const ROOT = '[data-slot="wave-bar-slider"]';
const BAR = '[data-slot="wave-bar-slider-bar"]';

class FakeChangeListener {
  values: number[] = [];
  handle = (value: number) => {
    this.values.push(value);
  };
}

function setup(props: Partial<React.ComponentProps<typeof WaveBarSlider>> = {}) {
  const view = render(
    <MotionConfig reducedMotion="never">
      <WaveBarSlider {...props} />
    </MotionConfig>
  );
  const bars = Array.from(view.container.querySelectorAll<HTMLElement>(BAR));
  return { ...view, bars, root: view.container.querySelector(ROOT) as HTMLElement };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  vi.useRealTimers();
});

describe("WaveBarSlider", () => {
  it("renderiza 32 barras por padrão e respeita `bars`", () => {
    expect(setup().bars).toHaveLength(32);
    expect(setup({ bars: 16 }).bars).toHaveLength(16);
  });

  it("marca data-lit conforme o valor", () => {
    const { bars } = setup({ defaultValue: 50 });
    expect(bars.filter((b) => b.dataset.lit === "true")).toHaveLength(16);
    expect(bars[15].dataset.lit).toBe("true");
    expect(bars[16].dataset.lit).toBe("false");
  });

  it("expõe role slider com valor e aria-label padrão", () => {
    setup({ defaultValue: 30 });
    const slider = screen.getByRole("slider", { name: "Valor" });
    expect(slider).toHaveAttribute("aria-valuenow", "30");
  });

  it("seta direita sobe um step e chama onValueChange com número", () => {
    const listener = new FakeChangeListener();
    setup({ defaultValue: 50, step: 5, onValueChange: listener.handle });
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(listener.values).toEqual([55]);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "55");
  });

  it("modo controlado segue a prop value", () => {
    const { rerender, bars } = setup({ value: 25 });
    expect(bars.filter((b) => b.dataset.lit === "true")).toHaveLength(8);
    rerender(
      <MotionConfig reducedMotion="never">
        <WaveBarSlider value={75} />
      </MotionConfig>
    );
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "75");
  });

  it("usa formatValue em aria-valuetext e no texto de showValue", () => {
    setup({ defaultValue: 62, showValue: true, formatValue: (v) => `${v}%` });
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "62%");
    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("showValue sem formatValue mostra o número; padrão não mostra", () => {
    const { unmount } = setup({ defaultValue: 40, showValue: true });
    expect(screen.getByText("40")).toBeInTheDocument();
    unmount();
    setup({ defaultValue: 40 });
    expect(screen.queryByText("40")).not.toBeInTheDocument();
  });

  it("disabled aplica opacidade e bloqueia o teclado", () => {
    const listener = new FakeChangeListener();
    const { root } = setup({ disabled: true, onValueChange: listener.handle });
    expect(root).toHaveClass("data-disabled:opacity-50");
    expect(root).toHaveAttribute("data-disabled");
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(listener.values).toEqual([]);
  });

  it("repassa className e ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const { root } = setup({ className: "w-72", ref });
    expect(root).toHaveClass("w-72");
    expect(ref.current).toBe(root);
  });

  describe("onda", () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"],
      });
    });

    it("levanta a barra da alça ao mover e volta ao repouso depois", () => {
      const { bars } = setup({ defaultValue: 50, sensitivity: 20 });
      const rest = bars[15].style.transform;
      expect(rest).toMatch(/scaleY\(/);
      fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
      act(() => void vi.advanceTimersByTime(50));
      expect(bars[16].style.transform).not.toBe(rest);
      act(() => void vi.advanceTimersByTime(4000));
      expect(bars[16].style.transform).toBe(rest);
    });
  });

  describe("movimento reduzido", () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame"],
      });
    });

    it("não anima a altura, só acende e apaga", () => {
      const view = render(
        <MotionConfig reducedMotion="always">
          <WaveBarSlider defaultValue={50} sensitivity={20} />
        </MotionConfig>
      );
      const bars = Array.from(view.container.querySelectorAll<HTMLElement>(BAR));
      const rest = bars[16].style.transform;
      fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
      act(() => void vi.advanceTimersByTime(100));
      expect(bars[16].style.transform).toBe(rest);
      expect(bars[16].dataset.lit).toBe("true");
    });
  });
});
