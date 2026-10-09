import { fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCurvePath,
  CurvedLoop,
  estimateTextLength,
  quadraticLength,
  repeatCount,
  wrapOffset,
} from "./curved-loop";

const TEXT = "Conciliação automática de extratos";
const FAKE_FONT_UNITS_PER_CHAR = 10;
const originalObserver = global.IntersectionObserver;

// jsdom não implementa medição de texto SVG; este fake dá 10 unidades por caractere.
function fakeComputedTextLength(this: SVGElement): number {
  return (this.textContent ?? "").length * FAKE_FONT_UNITS_PER_CHAR;
}

const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="curved-loop"]') as HTMLElement;
const textPathOf = (container: HTMLElement) => container.querySelector("textPath") as SVGElement;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  // O mock global do setup nunca dispara; aqui a raiz já nasce visível.
  global.IntersectionObserver = vi
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback) => ({
      observe: (target: Element) =>
        callback(
          [{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
          {} as IntersectionObserver
        ),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    })) as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  global.IntersectionObserver = originalObserver;
});

describe("CurvedLoop", () => {
  it("buildCurvePath põe o ponto de controle no meio, deslocado curve para baixo", () => {
    const flat = buildCurvePath(0);
    const arc = buildCurvePath(120);
    const up = buildCurvePath(-120);
    expect(flat.d).toBe(`M0,${flat.baseY} Q720,${flat.baseY} 1440,${flat.baseY}`);
    expect(arc.d).toBe(`M0,${arc.baseY} Q720,${arc.baseY + 120} 1440,${arc.baseY}`);
    expect(up.d).toBe(`M0,${up.baseY} Q720,${up.baseY - 120} 1440,${up.baseY}`);
    // O arco para cima precisa de mais espaço acima da linha de base.
    expect(up.baseY).toBeGreaterThan(arc.baseY);
    expect(arc.height).toBeGreaterThan(arc.baseY);
  });

  it("wrapOffset mantém o valor em [0, período)", () => {
    expect(wrapOffset(0, 100)).toBe(0);
    expect(wrapOffset(250, 100)).toBe(50);
    expect(wrapOffset(-30, 100)).toBe(70);
    expect(wrapOffset(100, 100)).toBe(0);
    expect(() => wrapOffset(5, 0)).toThrow(/received 0.*expected period > 0/);
  });

  it("estimateTextLength, quadraticLength e repeatCount", () => {
    expect(estimateTextLength("abcd", 10)).toBeGreaterThan(0);
    expect(estimateTextLength("abcdabcd", 10)).toBe(2 * estimateTextLength("abcd", 10));
    expect(quadraticLength(1440, 0)).toBeCloseTo(1440, 5);
    expect(quadraticLength(1440, 120)).toBeGreaterThan(1440);
    expect(repeatCount(1440, 500)).toBeGreaterThanOrEqual(Math.ceil((2 * 1440) / 500));
    expect(repeatCount(1440, 0)).toBe(1);
  });

  it("o sr-only tem o texto uma vez e o SVG fica aria-hidden", () => {
    const { container } = render(<CurvedLoop text={TEXT} />);
    const srOnly = container.querySelectorAll(".sr-only");
    expect(srOnly).toHaveLength(1);
    expect(srOnly[0]?.textContent).toBe(TEXT);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("repete o texto na textPath para cobrir a curva", () => {
    Object.defineProperty(SVGElement.prototype, "getComputedTextLength", {
      configurable: true,
      value: fakeComputedTextLength,
    });
    try {
      const { container } = render(<CurvedLoop text={TEXT} />);
      const content = textPathOf(container).textContent ?? "";
      const copies = content.split(TEXT).length - 1;
      expect(copies).toBeGreaterThanOrEqual(2);
      expect(copies * (TEXT.length + 2) * FAKE_FONT_UNITS_PER_CHAR).toBeGreaterThanOrEqual(
        2 * 1440
      );
    } finally {
      // biome-ignore lint/suspicious/noExplicitAny: remoção do stub instalado no protótipo
      delete (SVGElement.prototype as any).getComputedTextLength;
    }
  });

  it("raiz com draggable tem role group, descrição em português e tabIndex 0", () => {
    const { container } = render(<CurvedLoop text={TEXT} />);
    const root = rootOf(container);
    expect(root).toHaveAttribute("role", "group");
    expect(root).toHaveAttribute("aria-roledescription", "faixa de texto arrastável");
    expect(root).toHaveAttribute("tabindex", "0");
    expect(root).toHaveAttribute("data-direction", "left");
  });

  it("draggable=false não é grupo nem focável", () => {
    const { container } = render(<CurvedLoop text={TEXT} draggable={false} />);
    const root = rootOf(container);
    expect(root).not.toHaveAttribute("role");
    expect(root).not.toHaveAttribute("tabindex");
  });

  it("arrasto para a direita muda a direção para right, e para a esquerda volta", () => {
    const { container } = render(<CurvedLoop text={TEXT} />);
    const root = rootOf(container);
    fireEvent.pointerDown(root, { clientX: 100, pointerId: 1 });
    expect(root).toHaveAttribute("data-dragging", "true");
    fireEvent.pointerMove(root, { clientX: 160, pointerId: 1 });
    fireEvent.pointerUp(root, { clientX: 160, pointerId: 1 });
    expect(root).toHaveAttribute("data-direction", "right");
    expect(root).toHaveAttribute("data-dragging", "false");
    fireEvent.pointerDown(root, { clientX: 160, pointerId: 1 });
    fireEvent.pointerMove(root, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(root, { clientX: 100, pointerId: 1 });
    expect(root).toHaveAttribute("data-direction", "left");
  });

  it("o arrasto move o startOffset junto com o ponteiro", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <CurvedLoop text={TEXT} />
      </MotionConfig>
    );
    const root = rootOf(container);
    const before = Number.parseFloat(textPathOf(container).getAttribute("startOffset") ?? "0");
    fireEvent.pointerDown(root, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(root, { clientX: 130, pointerId: 1 });
    fireEvent.pointerUp(root, { clientX: 130, pointerId: 1 });
    const after = Number.parseFloat(textPathOf(container).getAttribute("startOffset") ?? "0");
    expect(after).toBeGreaterThan(before);
  });

  it("movimento do ponteiro sem pressionar não arrasta", () => {
    const { container } = render(<CurvedLoop text={TEXT} />);
    const root = rootOf(container);
    fireEvent.pointerMove(root, { clientX: 300, pointerId: 1 });
    expect(root).toHaveAttribute("data-direction", "left");
  });

  it("a tecla seta para a direita move o offset e a esquerda volta", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <CurvedLoop text={TEXT} />
      </MotionConfig>
    );
    const root = rootOf(container);
    const read = () => Number.parseFloat(textPathOf(container).getAttribute("startOffset") ?? "0");
    const start = read();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    const right = read();
    expect(right).toBeGreaterThan(start);
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(read()).toBeLessThan(right);
  });

  it("com movimento reduzido não há loop automático", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <CurvedLoop text={TEXT} />
      </MotionConfig>
    );
    expect(rootOf(container)).toHaveAttribute("data-moving", "false");
  });

  it("com movimento normal e visível o loop está ativo; arrastando, pausa", () => {
    const { container } = render(<CurvedLoop text={TEXT} />);
    const root = rootOf(container);
    expect(root).toHaveAttribute("data-moving", "true");
    fireEvent.pointerDown(root, { clientX: 10, pointerId: 1 });
    expect(root).toHaveAttribute("data-moving", "false");
  });

  it("texto vazio lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<CurvedLoop text="  " />)).toThrow(
      /received " {2}".*expected text: string não vazio/
    );
    spy.mockRestore();
  });

  it("expõe ref, className, data-slot e repassa props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CurvedLoop text={TEXT} ref={ref} className="text-primary" id="faixa" />);
    expect(ref.current).toHaveAttribute("data-slot", "curved-loop");
    expect(ref.current).toHaveClass("text-primary");
    expect(ref.current).toHaveAttribute("id", "faixa");
  });
});
