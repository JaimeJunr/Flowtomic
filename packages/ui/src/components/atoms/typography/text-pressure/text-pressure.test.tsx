import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPressureSettings,
  fitFontSizePx,
  lerp,
  pressureOpacity,
  pressureT,
  scaleYToHeight,
  TextPressure,
} from "./text-pressure";

const CHAR = '[data-slot="text-pressure-char"]';
const charsOf = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(CHAR)];
const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="text-pressure"]') as HTMLElement;

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
const originalObserver = global.IntersectionObserver;

// Fila de quadros controlada pelo teste: nada roda até `flush`.
class FakeFrameQueue {
  private spy: ReturnType<typeof vi.spyOn> | null = null;
  private pending = new Map<number, FrameRequestCallback>();
  private nextId = 1;
  install() {
    this.pending.clear();
    this.spy = vi.spyOn(globalThis, "requestAnimationFrame");
    this.spy.mockImplementation((callback: FrameRequestCallback) => {
      this.pending.set(this.nextId, callback);
      return this.nextId++;
    });
  }
  get scheduled() {
    return this.spy?.mock.calls.length ?? 0;
  }
  flush(frames: number) {
    for (let i = 0; i < frames; i++) {
      const callbacks = [...this.pending.values()];
      this.pending.clear();
      act(() => {
        for (const callback of callbacks) callback(i * 16);
      });
    }
  }
  restore() {
    this.spy?.mockRestore();
  }
}

// Letras de 10px lado a lado; a raiz tem 100px de largura e começa em x=0.
function stubLayout() {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    if (this.matches(CHAR)) {
      const index = Number(this.dataset.index ?? 0);
      return { left: index * 10, top: 0, width: 10, height: 20 } as DOMRect;
    }
    return { left: 0, top: 0, width: 100, height: 20 } as DOMRect;
  });
}

const frames = new FakeFrameQueue();
beforeEach(() => {
  frames.install();
  global.IntersectionObserver = vi.fn().mockImplementation((callback: ObserverCallback) => ({
    observe: (target: Element) =>
      callback([{ target, isIntersecting: true, intersectionRatio: 1 }]),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  })) as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  frames.restore();
  global.IntersectionObserver = originalObserver;
});

describe("funções puras", () => {
  it("pressureT: centro vale 1, metade da largura vale 0 e o resto é limitado", () => {
    expect(pressureT(0, 200)).toBe(1);
    expect(pressureT(50, 200)).toBeCloseTo(0.5, 5);
    expect(pressureT(100, 200)).toBe(0);
    expect(pressureT(900, 200)).toBe(0);
  });

  it("buildPressureSettings usa só os eixos ativos", () => {
    expect(buildPressureSettings({ weightRange: [200, 900] }, 0.5)).toBe('"wght" 550');
    expect(buildPressureSettings({ weightRange: [200, 900], widthRange: [100, 150] }, 1)).toBe(
      '"wght" 900, "wdth" 150'
    );
    expect(buildPressureSettings({ weightRange: [200, 900], italic: true }, 1)).toBe(
      '"wght" 900, "ital" 1, "slnt" -10'
    );
  });

  it("lerp persegue o alvo pelo fator", () => {
    expect(lerp(0, 100, 0.15)).toBeCloseTo(15, 5);
    expect(lerp(100, 100, 0.15)).toBe(100);
  });

  it("pressureOpacity: 1 sem alpha, 0.3 + 0.7t com alpha", () => {
    expect(pressureOpacity(0.2, false)).toBe(1);
    expect(pressureOpacity(0, true)).toBeCloseTo(0.3, 5);
    expect(pressureOpacity(1, true)).toBeCloseTo(1, 5);
  });

  it("fitFontSizePx preenche a largura e respeita o piso", () => {
    expect(
      fitFontSizePx({ containerWidth: 400, naturalWidth: 200, fontSizePx: 20, minPx: 24 })
    ).toBe(40);
    expect(
      fitFontSizePx({ containerWidth: 100, naturalWidth: 200, fontSizePx: 20, minPx: 24 })
    ).toBe(24);
    expect(fitFontSizePx({ containerWidth: 100, naturalWidth: 0, fontSizePx: 20, minPx: 24 })).toBe(
      20
    );
  });
});

describe("scaleYToHeight", () => {
  it("escala a altura do conteúdo até a do container e ignora medidas zeradas", () => {
    expect(scaleYToHeight(200, 100)).toBe(2);
    expect(scaleYToHeight(0, 100)).toBe(1);
    expect(scaleYToHeight(200, 0)).toBe(1);
  });
});

describe("TextPressure", () => {
  it("renderiza N letras aria-hidden e o texto completo em sr-only", () => {
    const { container } = render(<TextPressure text="Caixa" />);
    expect(charsOf(container)).toHaveLength(5);
    expect(charsOf(container)[0].closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByText("Caixa")).toHaveClass("sr-only");
  });

  it("as letras perto do ponteiro engordam e as longe ficam finas", () => {
    const layout = stubLayout();
    const { container } = render(<TextPressure text="Saldo final" weightRange={[200, 900]} />);
    const chars = charsOf(container);
    fireEvent.pointerMove(window, { clientX: 5, clientY: 10 });
    frames.flush(80);
    const weightOf = (el: HTMLElement) =>
      Number(/"wght" ([\d.]+)/.exec(el.style.fontVariationSettings)?.[1]);
    expect(weightOf(chars[0])).toBeGreaterThan(weightOf(chars[chars.length - 1]));
    layout.mockRestore();
  });

  it("sem ponteiro o alvo vai para o centro do container", () => {
    const layout = stubLayout();
    const { container } = render(<TextPressure text="Saldo final" weightRange={[200, 900]} />);
    frames.flush(80);
    const chars = charsOf(container);
    const weightOf = (el: HTMLElement) =>
      Number(/"wght" ([\d.]+)/.exec(el.style.fontVariationSettings)?.[1]);
    const middle = weightOf(chars[5]);
    expect(middle).toBeGreaterThan(weightOf(chars[0]));
    expect(middle).toBeGreaterThan(weightOf(chars[chars.length - 1]));
    layout.mockRestore();
  });

  it("alpha reduz a opacidade das letras longe", () => {
    const layout = stubLayout();
    const { container } = render(<TextPressure text="Saldo final" alpha />);
    fireEvent.pointerMove(window, { clientX: 5, clientY: 10 });
    frames.flush(80);
    const chars = charsOf(container);
    expect(Number(chars[0].style.opacity)).toBeGreaterThan(
      Number(chars[chars.length - 1].style.opacity)
    );
    layout.mockRestore();
  });

  it("stroke marca como contornadas as letras com t < 0.5", () => {
    const layout = stubLayout();
    const { container } = render(<TextPressure text="Saldo final" stroke />);
    fireEvent.pointerMove(window, { clientX: 5, clientY: 10 });
    frames.flush(80);
    const chars = charsOf(container);
    expect(chars[0]).not.toHaveAttribute("data-outlined", "true");
    expect(chars[chars.length - 1]).toHaveAttribute("data-outlined", "true");
    layout.mockRestore();
  });

  it("com movimento reduzido fica no meio da faixa e não agenda quadros", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <TextPressure text="Caixa" weightRange={[200, 900]} />
      </MotionConfig>
    );
    for (const char of charsOf(container))
      expect(char.style.fontVariationSettings).toBe('"wght" 550');
    fireEvent.pointerMove(window, { clientX: 5, clientY: 10 });
    expect(frames.scheduled).toBe(0);
  });

  it("texto vazio lança erro com valor recebido e formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<TextPressure text="" />)).toThrow(
      /received "".*expected text: string não vazio/
    );
    spy.mockRestore();
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<TextPressure text="Caixa" ref={ref} className="h-40" />);
    expect(ref.current).toBe(rootOf(container));
    expect(ref.current).toHaveClass("h-40");
  });
});
