import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  chainStep,
  clampEchoes,
  EchoText,
  echoStyle,
  entranceProgress,
  initialVector,
  pointerTarget,
} from "./echo-text";

const ECHO = '[data-slot="echo-text-echo"]';
const echoesOf = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(ECHO)];
const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="echo-text"]') as HTMLElement;
const translateOf = (el: HTMLElement) => {
  const match = /translate3d\((-?[\d.e-]+)px,\s*(-?[\d.e-]+)px/.exec(el.style.transform);
  return { x: Number(match?.[1]), y: Number(match?.[2]) };
};

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
const originalObserver = global.IntersectionObserver;

// Fila de quadros controlada pelo teste: nada roda até `flush`.
class FakeFrameQueue {
  private spy: ReturnType<typeof vi.spyOn> | null = null;
  private pending = new Map<number, FrameRequestCallback>();
  private nextId = 1;
  private clock = 0;
  install() {
    this.pending.clear();
    this.clock = 0;
    this.spy = vi.spyOn(globalThis, "requestAnimationFrame");
    this.spy.mockImplementation((callback: FrameRequestCallback) => {
      this.pending.set(this.nextId, callback);
      return this.nextId++;
    });
  }
  get scheduled() {
    return this.spy?.mock.calls.length ?? 0;
  }
  get pendingCount() {
    return this.pending.size;
  }
  flush(frames: number) {
    for (let i = 0; i < frames; i++) {
      const callbacks = [...this.pending.values()];
      this.pending.clear();
      this.clock += 16;
      act(() => {
        for (const callback of callbacks) callback(this.clock);
      });
    }
  }
  restore() {
    this.spy?.mockRestore();
  }
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

function stubRootBox() {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(() => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect);
}

describe("funções puras", () => {
  it("echoStyle: opacidade fade^i, desfoque proporcional e cor do tint", () => {
    const style = echoStyle(2, 10, { fade: 0.5, blurPx: 4, tint: "var(--primary)" });
    expect(style.opacity).toBeCloseTo(0.25, 5);
    expect(style.filter).toBe("blur(0.8px)");
    expect(style.color).toBe("var(--primary)");
  });

  it("echoStyle com tint=false usa currentColor", () => {
    expect(echoStyle(1, 4, { fade: 0.72, blurPx: 3, tint: false }).color).toBe("currentColor");
  });

  it("initialVector aponta para o sentido de direction", () => {
    expect(initialVector("right", 10)).toEqual({ x: 10, y: 0 });
    expect(initialVector("left", 10)).toEqual({ x: -10, y: 0 });
    expect(initialVector("up", 10)).toEqual({ x: 0, y: -10 });
    expect(initialVector("down", 10)).toEqual({ x: 0, y: 10 });
    const diagonal = initialVector("diagonal", 10);
    expect(diagonal.x).toBeCloseTo(7.071, 2);
    expect(diagonal.y).toBeCloseTo(7.071, 2);
  });

  it("pointerTarget foge do ponteiro, satura no raio e zera em cima do centro", () => {
    expect(pointerTarget({ x: 160, y: 0 }, 320, 32)).toEqual({ x: -16, y: 0 });
    expect(pointerTarget({ x: 3200, y: 0 }, 320, 32)).toEqual({ x: -32, y: 0 });
    expect(pointerTarget({ x: 0, y: 0 }, 320, 32)).toEqual({ x: 0, y: 0 });
  });

  it("chainStep: cada eco persegue o anterior com fator 1 - lag, em cadeia", () => {
    const next = chainStep(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      { x: 100, y: 0 },
      0.5
    );
    expect(next[0].x).toBeCloseTo(50, 5);
    expect(next[1].x).toBeCloseTo(25, 5);
  });

  it("entranceProgress: ease-out de 0 a 1 e ecos fundos atrasam", () => {
    expect(
      entranceProgress({ elapsedMs: 0, index: 1, echoes: 10, lag: 0.24, durationMs: 900 })
    ).toBe(0);
    expect(
      entranceProgress({ elapsedMs: 5000, index: 10, echoes: 10, lag: 0.24, durationMs: 900 })
    ).toBe(1);
    const shallow = entranceProgress({
      elapsedMs: 450,
      index: 1,
      echoes: 10,
      lag: 0.24,
      durationMs: 900,
    });
    const deep = entranceProgress({
      elapsedMs: 450,
      index: 10,
      echoes: 10,
      lag: 0.24,
      durationMs: 900,
    });
    expect(shallow).toBeGreaterThan(deep);
    expect(shallow).toBeGreaterThan(0.5);
  });

  it("clampEchoes limita entre 0 e 24", () => {
    expect(clampEchoes(10)).toBe(10);
    expect(clampEchoes(99)).toBe(24);
    expect(clampEchoes(-3)).toBe(0);
  });
});

describe("EchoText", () => {
  it("renderiza N ecos aria-hidden e o texto da frente lido uma vez", () => {
    const { container } = render(<EchoText text="Receita do mês" echoes={6} />);
    const echoes = echoesOf(container);
    expect(echoes).toHaveLength(6);
    for (const echo of echoes) expect(echo).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByText("Receita do mês", { selector: '[data-slot="echo-text-front"]' })
    ).toBeVisible();
  });

  it("os ecos recebem opacidade e desfoque crescentes com a profundidade", () => {
    const { container } = render(<EchoText text="Receita" echoes={4} fade={0.5} blurPx={4} />);
    const echoes = echoesOf(container);
    expect(Number(echoes[0].style.opacity)).toBeCloseTo(0.5, 5);
    expect(Number(echoes[3].style.opacity)).toBeCloseTo(0.0625, 5);
    expect(echoes[0].style.filter).toBe("blur(1px)");
    expect(echoes[3].style.filter).toBe("blur(4px)");
  });

  it("tint=false usa currentColor nos ecos", () => {
    const { container } = render(<EchoText text="Receita" echoes={2} tint={false} />);
    for (const echo of echoesOf(container))
      expect(echo.style.color.toLowerCase()).toBe("currentcolor");
  });

  it("na entrada os ecos começam deslocados e convergem para 0, parando o loop", () => {
    const { container } = render(
      <EchoText
        text="Receita"
        echoes={4}
        mode="entrance"
        offsetPx={40}
        direction="right"
        durationMs={400}
      />
    );
    const echoes = echoesOf(container);
    expect(translateOf(echoes[3]).x).toBeCloseTo(40, 3);
    frames.flush(80);
    for (const echo of echoes) {
      expect(translateOf(echo).x).toBeCloseTo(0, 3);
      expect(translateOf(echo).y).toBeCloseTo(0, 3);
    }
    expect(frames.pendingCount).toBe(0);
  });

  it("modo pointer: os ecos fogem do ponteiro e os fundos demoram mais", () => {
    const box = stubRootBox();
    const { container } = render(
      <EchoText
        text="Receita"
        echoes={5}
        mode="pointer"
        offsetPx={32}
        lag={0.5}
        pointerRadiusPx={200}
      />
    );
    fireEvent.pointerMove(window, { clientX: 200, clientY: 50 });
    frames.flush(2);
    const echoes = echoesOf(container);
    expect(translateOf(echoes[0]).x).toBeLessThan(0);
    expect(Math.abs(translateOf(echoes[0]).x)).toBeGreaterThan(Math.abs(translateOf(echoes[4]).x));
    frames.flush(200);
    expect(translateOf(echoes[4]).x).toBeCloseTo(-16, 1);
    box.mockRestore();
  });

  it("modo pointer parado não mantém loop rodando", () => {
    render(<EchoText text="Receita" echoes={3} mode="pointer" />);
    frames.flush(5);
    expect(frames.pendingCount).toBe(0);
  });

  it("com movimento reduzido só existe a frente, sem ecos", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <EchoText text="Receita" />
      </MotionConfig>
    );
    expect(echoesOf(container)).toHaveLength(0);
    expect(screen.getByText("Receita")).toBeVisible();
    expect(frames.scheduled).toBe(0);
  });

  it("texto vazio lança erro com valor recebido e formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<EchoText text="" />)).toThrow(
      /received "".*expected text: string não vazio/
    );
    spy.mockRestore();
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<EchoText text="Receita" ref={ref} className="text-primary" />);
    expect(ref.current).toBe(rootOf(container));
    expect(ref.current).toHaveClass("text-primary");
  });
});
