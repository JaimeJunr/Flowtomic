import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clampLayers,
  DepthText,
  layerStyle,
  orbitTarget,
  rotationTarget,
  stepRotation,
} from "./depth-text";

// Pose de repouso da spec (regra 2b): a lateral da extrusão fica sempre visível.
const REST_TRANSFORM = "rotateX(10deg) rotateY(-16deg)";
const LAYER = '[data-slot="depth-text-layer"]';
const STAGE = '[data-slot="depth-text-stage"]';
const layersOf = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(LAYER)];
const stageOf = (container: HTMLElement) => container.querySelector(STAGE) as HTMLElement;
const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="depth-text"]') as HTMLElement;

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
const originalObserver = global.IntersectionObserver;
const originalMatchMedia = window.matchMedia;

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

class FakeMediaQuery {
  constructor(private readonly finePointer: boolean) {}
  install() {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("pointer: fine") ? this.finePointer : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  }
}

const frames = new FakeFrameQueue();
beforeEach(() => {
  frames.install();
  new FakeMediaQuery(true).install();
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
  window.matchMedia = originalMatchMedia;
  global.IntersectionObserver = originalObserver;
});

function stubRootBox() {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(() => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect);
}

describe("funções puras", () => {
  it("clampLayers limita entre 1 e 60 e arredonda", () => {
    expect(clampLayers(24)).toBe(24);
    expect(clampLayers(500)).toBe(60);
    expect(clampLayers(0)).toBe(1);
    expect(clampLayers(-4)).toBe(1);
    expect(clampLayers(3.6)).toBe(4);
  });

  it("rotationTarget: centro é zero, canto é ±tilt e fora da caixa é limitado", () => {
    expect(rotationTarget({ x: 0, y: 0 }, { width: 200, height: 100 }, 8)).toEqual({
      rotateX: 0,
      rotateY: 0,
    });
    const corner = rotationTarget({ x: 100, y: 50 }, { width: 200, height: 100 }, 8);
    expect(corner.rotateY).toBe(8);
    expect(corner.rotateX).toBe(-8);
    const outside = rotationTarget({ x: 9999, y: -9999 }, { width: 200, height: 100 }, 8);
    expect(outside.rotateY).toBe(8);
    expect(outside.rotateX).toBe(8);
  });

  it("stepRotation avança uma fração do caminho até o alvo", () => {
    expect(stepRotation({ rotateX: 0, rotateY: 0 }, { rotateX: 10, rotateY: -10 }, 0.12)).toEqual({
      rotateX: 1.2,
      rotateY: -1.2,
    });
    expect(stepRotation({ rotateX: 5, rotateY: 5 }, { rotateX: 5, rotateY: 5 }, 0.5)).toEqual({
      rotateX: 5,
      rotateY: 5,
    });
  });

  it("orbitTarget é periódica e fica dentro de ±tilt/2", () => {
    const start = orbitTarget(0, 0.5, 8);
    const afterPeriod = orbitTarget(2, 0.5, 8);
    expect(afterPeriod.rotateX).toBeCloseTo(start.rotateX, 5);
    expect(afterPeriod.rotateY).toBeCloseTo(start.rotateY, 5);
    for (const t of [0, 0.3, 0.9, 1.7]) {
      const { rotateX, rotateY } = orbitTarget(t, 0.5, 8);
      expect(Math.abs(rotateX)).toBeLessThanOrEqual(4.0001);
      expect(Math.abs(rotateY)).toBeLessThanOrEqual(4.0001);
    }
  });

  it("layerStyle afunda a cópia em Z e escurece sem usar cor fixa", () => {
    const first = layerStyle(1, 10, 2, "var(--primary)");
    const last = layerStyle(10, 10, 2, "var(--primary)");
    expect(first.transform).toBe("translateZ(-2px)");
    expect(last.transform).toBe("translateZ(-20px)");
    expect(first.color).toContain("var(--primary)");
    expect(first.color).not.toBe(last.color);
    expect(`${first.color}${last.color}`).not.toMatch(/#|rgb/);
  });

  // Revisão de 05/10/2026: com a face quase preta do tema claro, escurecer a 45% fazia a
  // lateral sumir; a camada mais funda guarda 80% da cor da extrusão.
  it("a camada mais funda ainda guarda 80% da cor da extrusão", () => {
    expect(layerStyle(10, 10, 3, "var(--primary)").color).toBe(
      "color-mix(in oklab, var(--primary) 80%, black)"
    );
  });
});

describe("DepthText", () => {
  it("renderiza `layers` cópias aria-hidden e a face com o texto real", () => {
    const { container } = render(<DepthText text="Margem" layers={12} />);
    const layers = layersOf(container);
    expect(layers).toHaveLength(12);
    for (const layer of layers) expect(layer).toHaveAttribute("aria-hidden", "true");
    const face = screen.getByText("Margem", { selector: '[data-slot="depth-text-face"]' });
    expect(face).not.toHaveAttribute("aria-hidden");
  });

  it("layers acima de 60 vira 60 e abaixo de 1 vira 1, sem erro", () => {
    const { container, rerender } = render(<DepthText text="Margem" layers={500} />);
    expect(layersOf(container)).toHaveLength(60);
    rerender(<DepthText text="Margem" layers={0} />);
    expect(layersOf(container)).toHaveLength(1);
  });

  it("o ponteiro inclina a pilha na direção dele depois de alguns quadros", () => {
    const box = stubRootBox();
    const { container } = render(<DepthText text="Margem" tiltDeg={10} />);
    fireEvent.pointerMove(rootOf(container), { clientX: 200, clientY: 50 });
    frames.flush(60);
    const transform = stageOf(container).style.transform;
    const rotateY = Number(/rotateY\((-?[\d.]+)deg\)/.exec(transform)?.[1]);
    expect(rotateY).toBeGreaterThan(-16 + 5);
    box.mockRestore();
  });

  it("sem ponteiro e com autoOrbit a pilha se move sozinha; sem autoOrbit fica parada", () => {
    const { container, unmount } = render(<DepthText text="Margem" orbitSpeed={1} />);
    frames.flush(10);
    expect(stageOf(container).style.transform).not.toBe(REST_TRANSFORM);
    unmount();
    const parked = render(<DepthText text="Margem" autoOrbit={false} />);
    frames.flush(10);
    expect(stageOf(parked.container).style.transform).toBe(REST_TRANSFORM);
  });

  it("sem ponteiro fino o ponteiro não inclina", () => {
    new FakeMediaQuery(false).install();
    const box = stubRootBox();
    const { container } = render(<DepthText text="Margem" autoOrbit={false} />);
    fireEvent.pointerMove(rootOf(container), { clientX: 200, clientY: 50 });
    frames.flush(30);
    expect(stageOf(container).style.transform).toBe(REST_TRANSFORM);
    box.mockRestore();
  });

  it("em repouso o transform inicial já traz a pose base", () => {
    const { container } = render(<DepthText text="Margem" />);
    expect(stageOf(container).style.transform).toBe(REST_TRANSFORM);
  });

  // `filter` no mesmo elemento do preserve-3d achata o 3D: todas as camadas caíam no mesmo plano
  // (medido em 05/10/2026). A sombra fica na raiz, fora da cadeia 3D.
  it("shadow aplica drop-shadow na raiz, nunca no palco 3D", () => {
    const { container, rerender } = render(<DepthText text="Margem" shadow />);
    const root = container.querySelector<HTMLElement>('[data-slot="depth-text"]');
    expect(root?.style.filter).toContain("drop-shadow");
    expect(root?.style.filter).toContain("var(--primary)");
    expect(stageOf(container).style.filter).toBe("");
    rerender(<DepthText text="Margem" shadow={false} />);
    expect(root?.style.filter).toBe("");
  });

  it("com movimento reduzido fica estático na pose de repouso e sem loop", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <DepthText text="Margem" />
      </MotionConfig>
    );
    expect(layersOf(container).length).toBeGreaterThan(0);
    expect(stageOf(container).style.transform).toBe(REST_TRANSFORM);
    expect(frames.scheduled).toBe(0);
  });

  it("texto vazio lança erro com valor recebido e formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<DepthText text="" />)).toThrow(
      /received "".*expected text: string não vazio/
    );
    spy.mockRestore();
  });

  it("expõe ref, className, perspective e data-slot na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <DepthText text="Margem" ref={ref} className="text-primary" perspectivePx={700} />
    );
    expect(ref.current).toBe(rootOf(container));
    expect(ref.current).toHaveClass("text-primary");
    expect(ref.current?.style.perspective).toBe("700px");
  });
});
