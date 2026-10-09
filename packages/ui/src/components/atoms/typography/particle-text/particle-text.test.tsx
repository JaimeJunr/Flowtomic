import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildParticles,
  colorToHex,
  createRng,
  ParticleText,
  pointerToTextSpace,
  positionAt,
  repelForce,
  sampleTargets,
  springStep,
} from "./particle-text";

const TEXT = "Receita";
const ROOT = '[data-slot="particle-text"]';
const CANVAS = '[data-slot="particle-text-canvas"]';

type PixelBuffer = { data: Uint8ClampedArray; width: number; height: number };

function opaqueImage(width: number, height: number): PixelBuffer {
  return { data: new Uint8ClampedArray(width * height * 4).fill(255), width, height };
}

class FakeCanvasContext {
  font = "";
  fillStyle = "";
  shadowBlur = 0;
  shadowColor = "";
  textBaseline = "";
  fillRectCalls = 0;
  shadowBlurAtFill = new Set<number>();
  measureText(text: string) {
    return { width: text.length * 10 } as TextMetrics;
  }
  getImageData(_x: number, _y: number, width: number, height: number) {
    return opaqueImage(width, height);
  }
  setTransform() {}
  clearRect() {}
  fillText() {}
  save() {}
  restore() {}
  fillRect() {
    this.fillRectCalls++;
    this.shadowBlurAtFill.add(this.shadowBlur);
  }
}

let context: FakeCanvasContext;
let getContextSpy: ReturnType<typeof vi.spyOn> | undefined;
const originalObserver = global.IntersectionObserver;

function installFakeCanvas() {
  context = new FakeCanvasContext();
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation((() => context) as unknown as HTMLCanvasElement["getContext"]);
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout"],
  });
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
  getContextSpy?.mockRestore();
  getContextSpy = undefined;
  global.IntersectionObserver = originalObserver;
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("createRng é reprodutível por semente e fica em [0, 1)", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = [a(), a(), a(), a()];
    expect(seqA).toEqual([b(), b(), b(), b()]);
    expect(seqA.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(createRng(43)()).not.toBe(seqA[0]);
  });

  it("sampleTargets respeita density e ignora pixels transparentes", () => {
    const targets = sampleTargets(opaqueImage(8, 8), 4, 100);
    expect(targets).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 4 },
      { x: 4, y: 4 },
    ]);
    const image = opaqueImage(8, 8);
    image.data.fill(0);
    image.data[3] = 255;
    expect(sampleTargets(image, 4, 100)).toEqual([{ x: 0, y: 0 }]);
  });

  it("sampleTargets aumenta o passo para respeitar o limite", () => {
    const targets = sampleTargets(opaqueImage(60, 60), 1, 100);
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.length).toBeLessThanOrEqual(100);
  });

  it("buildParticles usa a semente, limita o espalhamento e o atraso", () => {
    const targets = [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
    ];
    const options = { scatterPx: 50, staggerMs: 400, highlightRatio: 0.25 };
    const first = buildParticles(targets, options, createRng(7));
    const second = buildParticles(targets, options, createRng(7));
    expect(first).toEqual(second);
    expect(first.map((particle) => particle.tx).sort()).toEqual([10, 20]);
    for (const particle of first) {
      const distance = Math.hypot(particle.sx - particle.tx, particle.sy - particle.ty);
      expect(distance).toBeLessThanOrEqual(50);
      expect(particle.delay).toBeGreaterThanOrEqual(0);
      expect(particle.delay).toBeLessThanOrEqual(400);
    }
  });

  it("buildParticles põe ~25% dos pontos na cor de destaque, no fim da lista", () => {
    const targets = Array.from({ length: 400 }, (_, index) => ({ x: index, y: 0 }));
    const particles = buildParticles(
      targets,
      { scatterPx: 10, staggerMs: 0, highlightRatio: 0.25 },
      createRng(1)
    );
    const flags = particles.map((particle) => particle.highlight);
    const highlighted = flags.filter(Boolean).length;
    expect(highlighted).toBeGreaterThan(70);
    expect(highlighted).toBeLessThan(130);
    expect(flags.indexOf(true)).toBe(flags.length - highlighted);
  });

  it("positionAt: antes do atraso = início, depois de gatherMs = alvo", () => {
    const p = { sx: 0, sy: 100, tx: 50, ty: 20, delay: 200 };
    expect(positionAt(p, 0, 1000)).toEqual({ x: 0, y: 100 });
    expect(positionAt(p, 200, 1000)).toEqual({ x: 0, y: 100 });
    expect(positionAt(p, 1200, 1000)).toEqual({ x: 50, y: 20 });
    expect(positionAt(p, 99999, 1000)).toEqual({ x: 50, y: 20 });
    const mid = positionAt(p, 700, 1000);
    // ease-out: na metade do tempo já passou da metade do caminho
    expect(mid.x).toBeGreaterThan(25);
    expect(mid.x).toBeLessThan(50);
  });

  it("repelForce é zero fora do raio e cresce com a proximidade", () => {
    expect(repelForce(200, 0, 100, 40)).toEqual({ x: 0, y: 0 });
    expect(repelForce(100, 0, 100, 40)).toEqual({ x: 0, y: 0 });
    const perto = repelForce(25, 0, 100, 40);
    const longe = repelForce(75, 0, 100, 40);
    expect(perto.x).toBeCloseTo(30);
    expect(perto.y).toBeCloseTo(0);
    expect(longe.x).toBeCloseTo(10);
    expect(repelForce(0, -25, 100, 40).y).toBeCloseTo(-30);
  });

  it("pointerToTextSpace desconta a posição do canvas e a margem", () => {
    const rect = { left: 100, top: 50 };
    expect(pointerToTextSpace(300, 150, rect, 180)).toEqual({ x: 20, y: -80 });
    expect(pointerToTextSpace(280, 230, rect, 180)).toEqual({ x: 0, y: 0 });
  });

  it("springStep volta ao alvo depois que a repulsão cessa", () => {
    const particle = { ox: 0, oy: 0, vx: 0, vy: 0 };
    for (let i = 0; i < 30; i++) springStep(particle, 40, 0);
    // com a repulsão ativa o deslocamento fica limitado à força, não explode
    expect(particle.ox).toBeGreaterThan(10);
    expect(particle.ox).toBeLessThan(60);
    for (let i = 0; i < 120; i++) springStep(particle, 0, 0);
    expect(Math.abs(particle.ox)).toBeLessThan(0.1);
    expect(Math.abs(particle.vx)).toBeLessThan(0.1);
  });

  it("colorToHex serializa a cor sem usar rgb()", () => {
    expect(colorToHex({ r: 1, g: 0, b: 0, a: 1 })).toBe("#ff0000");
    expect(colorToHex({ r: 0, g: 0, b: 1, a: 0 })).toBe("#0000ff00");
  });
});

describe("ParticleText sem canvas 2D", () => {
  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  it("mostra o texto puro como fallback", () => {
    const { container } = render(<ParticleText text={TEXT} />);
    expect(screen.getByText(TEXT)).toBeVisible();
    expect(container.querySelector(CANVAS)).toBeNull();
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ParticleText text={TEXT} ref={ref} className="text-primary" id="alvo" />);
    expect(ref.current).toHaveAttribute("data-slot", "particle-text");
    expect(ref.current).toHaveClass("text-primary");
    expect(ref.current).toHaveAttribute("id", "alvo");
  });

  it("texto vazio lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<ParticleText text="" />)).toThrow(/received "".*expected/);
    spy.mockRestore();
  });
});

describe("ParticleText com contexto 2D", () => {
  beforeEach(installFakeCanvas);

  it("canvas fica aria-hidden e o texto vai num sr-only", () => {
    const { container } = render(<ParticleText text={TEXT} />);
    expect(container.querySelector(CANVAS)).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(TEXT)).toHaveClass("sr-only");
  });

  it("desenha um ponto por alvo amostrado (movimento reduzido: sem loop)", () => {
    const raf = vi.spyOn(globalThis, "requestAnimationFrame");
    render(
      <MotionConfig reducedMotion="always">
        <ParticleText text={TEXT} density={4} />
      </MotionConfig>
    );
    // Fake: texto de 70x21px, grade de 4px => 18 colunas x 6 linhas, todas opacas.
    expect(context.fillRectCalls).toBe(18 * 6);
    act(() => vi.advanceTimersByTime(300));
    expect(raf).not.toHaveBeenCalled();
    expect(context.fillRectCalls).toBe(18 * 6);
    raf.mockRestore();
  });

  it("no modo normal anima por quadros e o glow liga o shadowBlur", () => {
    render(<ParticleText text={TEXT} glow />);
    act(() => vi.advanceTimersByTime(100));
    expect(context.fillRectCalls).toBeGreaterThan(18 * 6);
    expect([...context.shadowBlurAtFill].some((blur) => blur > 0)).toBe(true);
  });

  it("glow={false} não usa shadowBlur", () => {
    render(<ParticleText text={TEXT} glow={false} />);
    act(() => vi.advanceTimersByTime(100));
    expect([...context.shadowBlurAtFill].every((blur) => blur === 0)).toBe(true);
  });

  it("trigger=mount não reinicia o ciclo com hover ou clique", () => {
    const { container } = render(<ParticleText text={TEXT} />);
    const root = container.querySelector(ROOT) as Element;
    fireEvent.pointerEnter(root);
    fireEvent.click(root);
    expect(root).toHaveAttribute("data-cycle", "0");
    expect(root).not.toHaveAttribute("tabindex");
  });

  it("trigger=hover reinicia o ciclo no pointerenter", () => {
    const { container } = render(<ParticleText text={TEXT} trigger="hover" />);
    const root = container.querySelector(ROOT) as Element;
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-cycle", "1");
    fireEvent.click(root);
    expect(root).toHaveAttribute("data-cycle", "1");
  });

  it("trigger=click reinicia no clique e com Enter/Espaço, e é focável", () => {
    const { container } = render(<ParticleText text={TEXT} trigger="click" />);
    const root = container.querySelector(ROOT) as Element;
    expect(root).toHaveAttribute("tabindex", "0");
    fireEvent.click(root);
    expect(root).toHaveAttribute("data-cycle", "1");
    fireEvent.keyDown(root, { key: "Enter" });
    expect(root).toHaveAttribute("data-cycle", "2");
    fireEvent.keyDown(root, { key: " " });
    expect(root).toHaveAttribute("data-cycle", "3");
    fireEvent.keyDown(root, { key: "a" });
    expect(root).toHaveAttribute("data-cycle", "3");
  });
});
