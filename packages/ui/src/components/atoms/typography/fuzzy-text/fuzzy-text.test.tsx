import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultRangePx,
  FuzzyText,
  frameIntervalMs,
  intensityTarget,
  isGlitching,
  nextIntensity,
  stripOffset,
  stripOffsets,
} from "./fuzzy-text";

const TEXT = "Fechamento do mês";
const ROOT = '[data-slot="fuzzy-text"]';
const CANVAS = '[data-slot="fuzzy-text-canvas"]';
// Altura do texto no fake: ceil(16px * 1.3) = 21 faixas de 1px por quadro.
const STRIPS = 21;

type DrawImageArgs = [unknown, number, number, number, number, number, number, number, number];

class FakeCanvasContext {
  font = "";
  fillStyle = "";
  textBaseline = "";
  drawImageCalls: DrawImageArgs[] = [];
  measureText(text: string) {
    return { width: text.length * 10 } as TextMetrics;
  }
  setTransform() {}
  scale() {}
  clearRect() {}
  fillText() {}
  drawImage(...args: DrawImageArgs) {
    this.drawImageCalls.push(args);
  }
}

let context: FakeCanvasContext;
let getContextSpy: ReturnType<typeof vi.spyOn>;
let randomSpy: ReturnType<typeof vi.spyOn> | undefined;

function installFakeCanvas() {
  context = new FakeCanvasContext();
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation((() => context) as unknown as HTMLCanvasElement["getContext"]);
}

const originalObserver = global.IntersectionObserver;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  // O jsdom não notifica visibilidade: o fake avisa que a raiz está na tela.
  global.IntersectionObserver = vi
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback) => ({
      observe: (target: Element) =>
        callback(
          [{ target, isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        ),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    })) as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  global.IntersectionObserver = originalObserver;
  getContextSpy?.mockRestore();
  randomSpy?.mockRestore();
  randomSpy = undefined;
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("stripOffset respeita o limite rangePx * intensidade", () => {
    expect(stripOffset(0, 1, 30)).toBe(-30);
    expect(stripOffset(1, 1, 30)).toBe(30);
    expect(stripOffset(0.5, 1, 30)).toBe(0);
    expect(stripOffset(1, 0.5, 30)).toBe(15);
    expect(stripOffset(1, 0, 30)).toBe(0);
  });

  it("stripOffsets aplica a direção", () => {
    expect(stripOffsets("horizontal", 1, 0, 1, 10)).toEqual({ dx: 10, dy: 0 });
    expect(stripOffsets("vertical", 1, 0, 1, 10)).toEqual({ dx: 0, dy: 10 });
    expect(stripOffsets("both", 1, 0, 1, 10)).toEqual({ dx: 10, dy: -10 });
  });

  it("nextIntensity caminha em easeFrames quadros e não ultrapassa o alvo", () => {
    expect(nextIntensity(0, 1, 0)).toBe(1);
    expect(nextIntensity(0, 1, 4)).toBeCloseTo(0.25);
    expect(nextIntensity(0.9, 1, 4)).toBe(1);
    expect(nextIntensity(1, 0.2, 4)).toBeCloseTo(0.75);
    expect(nextIntensity(0.3, 0.3, 4)).toBe(0.3);
  });

  it("intensityTarget escolhe base, hover, burst e glitch", () => {
    const base = { base: 0.2, hover: 0.5, hovered: false, burst: false, glitching: false };
    expect(intensityTarget(base)).toBe(0.2);
    expect(intensityTarget({ ...base, hovered: true })).toBe(0.5);
    expect(intensityTarget({ ...base, burst: true })).toBe(1);
    expect(intensityTarget({ ...base, glitching: true })).toBe(1);
  });

  it("isGlitching liga no fim de cada intervalo, por glitchDurationMs", () => {
    expect(isGlitching(0, 2000, 200)).toBe(false);
    expect(isGlitching(1799, 2000, 200)).toBe(false);
    expect(isGlitching(1800, 2000, 200)).toBe(true);
    expect(isGlitching(1999, 2000, 200)).toBe(true);
    expect(isGlitching(2000, 2000, 200)).toBe(false);
    expect(isGlitching(3850, 2000, 200)).toBe(true);
  });

  it("defaultRangePx é 15% do tamanho da fonte", () => {
    expect(defaultRangePx(100)).toBe(15);
    expect(defaultRangePx(16)).toBeCloseTo(2.4);
    expect(() => defaultRangePx(0)).toThrow(/received 0/);
  });

  it("frameIntervalMs vem do fps", () => {
    expect(frameIntervalMs(30)).toBeCloseTo(33.33, 1);
    expect(() => frameIntervalMs(-5)).toThrow(/received -5/);
  });
});

describe("FuzzyText sem canvas 2D", () => {
  beforeEach(() => {
    // Mesmo retorno do navegador sem suporte; evita o aviso "not implemented" do jsdom.
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  it("mostra o texto puro como fallback", () => {
    const { container } = render(<FuzzyText>{TEXT}</FuzzyText>);
    expect(screen.getByText(TEXT)).toBeVisible();
    expect(container.querySelector(CANVAS)).toBeNull();
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FuzzyText ref={ref} className="text-primary" id="alvo">
        {TEXT}
      </FuzzyText>
    );
    expect(ref.current).toHaveAttribute("data-slot", "fuzzy-text");
    expect(ref.current).toHaveClass("text-primary");
    expect(ref.current).toHaveAttribute("id", "alvo");
  });

  it("texto vazio lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<FuzzyText>{""}</FuzzyText>)).toThrow(/received "".*expected/);
    spy.mockRestore();
  });
});

describe("FuzzyText com contexto 2D", () => {
  beforeEach(installFakeCanvas);

  it("canvas fica aria-hidden e o texto vai num sr-only", () => {
    const { container } = render(<FuzzyText>{TEXT}</FuzzyText>);
    expect(container.querySelector(CANVAS)).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(TEXT)).toHaveClass("sr-only");
  });

  it("desenha uma faixa de 1px por linha do texto a cada quadro", () => {
    render(<FuzzyText fps={60}>{TEXT}</FuzzyText>);
    expect(context.drawImageCalls.length).toBe(STRIPS);
    for (const call of context.drawImageCalls.slice(0, STRIPS)) {
      expect(call[4]).toBe(1);
      expect(call[8]).toBe(1);
    }
    context.drawImageCalls.length = 0;
    act(() => vi.advanceTimersByTime(40));
    expect(context.drawImageCalls.length).toBeGreaterThanOrEqual(STRIPS);
    expect(context.drawImageCalls.length % STRIPS).toBe(0);
  });

  it("hover sobe a intensidade e sair volta à base", () => {
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(1);
    const { container } = render(
      <FuzzyText baseIntensity={0} hoverIntensity={1} rangePx={10} easeFrames={0}>
        {TEXT}
      </FuzzyText>
    );
    const lastX = () => context.drawImageCalls[context.drawImageCalls.length - 1][5];
    act(() => vi.advanceTimersByTime(40));
    expect(lastX()).toBe(10);
    fireEvent.pointerEnter(container.querySelector(ROOT) as Element);
    act(() => vi.advanceTimersByTime(40));
    expect(lastX()).toBe(20);
    fireEvent.pointerLeave(container.querySelector(ROOT) as Element);
    act(() => vi.advanceTimersByTime(40));
    expect(lastX()).toBe(10);
  });

  it("hover={false} ignora o ponteiro", () => {
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(1);
    const { container } = render(
      <FuzzyText hover={false} baseIntensity={0} hoverIntensity={1} rangePx={10} easeFrames={0}>
        {TEXT}
      </FuzzyText>
    );
    fireEvent.pointerEnter(container.querySelector(ROOT) as Element);
    act(() => vi.advanceTimersByTime(40));
    expect(context.drawImageCalls[context.drawImageCalls.length - 1][5]).toBe(10);
  });

  it("clickBurst leva a intensidade a 1 por ~150ms", () => {
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(1);
    const { container } = render(
      <FuzzyText clickBurst baseIntensity={0} hoverIntensity={0} rangePx={10} easeFrames={0}>
        {TEXT}
      </FuzzyText>
    );
    const lastX = () => context.drawImageCalls[context.drawImageCalls.length - 1][5];
    fireEvent.pointerDown(container.querySelector(ROOT) as Element);
    act(() => vi.advanceTimersByTime(40));
    expect(lastX()).toBe(20);
    act(() => vi.advanceTimersByTime(300));
    expect(lastX()).toBe(10);
  });

  it("movimento reduzido desenha estático, sem loop e com intensidade 0", () => {
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(1);
    const raf = vi.spyOn(globalThis, "requestAnimationFrame");
    render(
      <MotionConfig reducedMotion="always">
        <FuzzyText rangePx={10}>{TEXT}</FuzzyText>
      </MotionConfig>
    );
    expect(context.drawImageCalls.length).toBe(STRIPS);
    expect(context.drawImageCalls.every((call) => call[5] === 10)).toBe(true);
    act(() => vi.advanceTimersByTime(200));
    expect(raf).not.toHaveBeenCalled();
    expect(context.drawImageCalls.length).toBe(STRIPS);
    raf.mockRestore();
  });
});
