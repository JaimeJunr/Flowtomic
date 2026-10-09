import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activeLetterIndex,
  areaFillOpacity,
  dragLabel,
  fitFontSize,
  selectionLabel,
  speckPositions,
  TechText,
} from "./tech-text";

const TEXT = "Fluxo";
const ROOT = '[data-slot="tech-text"]';
const LETTER = '[data-slot="tech-text-letter"]';
const SELECTION = '[data-slot="tech-text-selection"]';

// Sem canvas 2D no jsdom, cada letra mede 0,6em; com -0,04em de espaçamento e fonte de
// 150px, a letra i começa em i * 84px e tem 90px de largura (centro em i * 84 + 45).
const centerX = (index: number) => index * 84 + 45;

class FakePointerEvent extends MouseEvent {
  pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}

const originalPointerEvent = window.PointerEvent;
const originalObserver = global.IntersectionObserver;
let getContextSpy: ReturnType<typeof vi.spyOn>;

const rootOf = (container: HTMLElement) => container.querySelector(ROOT) as HTMLElement;
const lettersOf = (container: HTMLElement) => [...container.querySelectorAll<SVGElement>(LETTER)];
const fillOf = (letter: Element) =>
  Number((letter as HTMLElement).style.fillOpacity || letter.getAttribute("fill-opacity"));
const selectionOf = (container: HTMLElement) =>
  container.querySelector(SELECTION) as HTMLElement | null;

function point(root: Element, x: number, y = 70) {
  fireEvent.pointerMove(root, { clientX: x, clientY: y });
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = FakePointerEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = originalPointerEvent;
});
beforeEach(() => {
  // Sem canvas 2D (como no jsdom) a medição cai na largura média; o spy só cala o aviso.
  getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
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
  getContextSpy.mockRestore();
  global.IntersectionObserver = originalObserver;
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("fitFontSize usa o menor entre o máximo e o que cabe na largura", () => {
    expect(fitFontSize(5, 400, 150)).toBe(80);
    expect(fitFontSize(5, 1000, 150)).toBe(150);
    expect(fitFontSize(5, 0, 150)).toBe(150);
  });

  it("areaFillOpacity: centro 0, fora do raio 1, softness 0 é degrau", () => {
    expect(areaFillOpacity(0, 200, 0.7)).toBe(0);
    expect(areaFillOpacity(200, 200, 0.7)).toBe(1);
    expect(areaFillOpacity(500, 200, 0.7)).toBe(1);
    const meio = areaFillOpacity(170, 200, 0.7);
    expect(meio).toBeGreaterThan(0);
    expect(meio).toBeLessThan(1);
    expect(areaFillOpacity(199, 200, 0)).toBe(0);
    expect(areaFillOpacity(200, 200, 0)).toBe(1);
  });

  it("areaFillOpacity cresce com a distância", () => {
    const valores = [0, 40, 80, 120, 160, 200].map((d) => areaFillOpacity(d, 200, 1));
    expect([...valores].sort((a, b) => a - b)).toEqual(valores);
  });

  it("activeLetterIndex escolhe a letra sob o x, ou a mais próxima", () => {
    const boxes = [
      { left: 0, width: 50 },
      { left: 60, width: 50 },
      { left: 120, width: 50 },
    ];
    expect(activeLetterIndex(70, boxes)).toBe(1);
    expect(activeLetterIndex(54, boxes)).toBe(0);
    expect(activeLetterIndex(57, boxes)).toBe(1);
    expect(activeLetterIndex(-300, boxes)).toBe(0);
    expect(activeLetterIndex(900, boxes)).toBe(2);
    expect(activeLetterIndex(10, [])).toBe(-1);
  });

  it("speckPositions é reprodutível por semente e cai dentro da caixa", () => {
    const box = { width: 90, height: 160 };
    const a = speckPositions(3, 8, box);
    expect(a).toEqual(speckPositions(3, 8, box));
    expect(a).not.toEqual(speckPositions(4, 8, box));
    expect(a).toHaveLength(8);
    for (const speck of a) {
      expect(speck.x).toBeGreaterThanOrEqual(-10);
      expect(speck.x).toBeLessThanOrEqual(100);
      expect(speck.y).toBeGreaterThanOrEqual(-10);
      expect(speck.y).toBeLessThanOrEqual(170);
    }
    expect(speckPositions(3, 0, box)).toEqual([]);
  });

  it("textos das etiquetas", () => {
    expect(selectionLabel("R", 149.6)).toBe("R · 150px");
    expect(dragLabel(12.4, -7.6)).toBe("12, -8");
  });
});

describe("TechText", () => {
  it("raiz é role=img com o texto como nome, e há uma letra por caractere", () => {
    const { container } = render(<TechText text={TEXT} />);
    expect(screen.getByRole("img", { name: TEXT })).toBe(rootOf(container));
    expect(lettersOf(container).map((letter) => letter.textContent)).toEqual([..."Fluxo"]);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("espaços ocupam lugar mas não viram letra", () => {
    const { container } = render(<TechText text="Meu Caixa" />);
    expect(lettersOf(container)).toHaveLength(8);
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TechText text={TEXT} ref={ref} className="text-foreground" id="alvo" />);
    expect(ref.current).toHaveAttribute("data-slot", "tech-text");
    expect(ref.current).toHaveClass("text-foreground");
    expect(ref.current).toHaveAttribute("id", "alvo");
  });

  it("texto vazio lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<TechText text="  " />)).toThrow(/received " {2}".*expected/);
    spy.mockRestore();
  });

  it("a fonte encolhe para caber no container", () => {
    const spy = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(213);
    const { container } = render(<TechText text={TEXT} />);
    const root = rootOf(container);
    point(root, 10);
    // 5 letras: 5 * 0,6em - 4 * 0,04em = 2,84em => 213 / 2,84 = 75px
    expect(selectionOf(container)).toHaveTextContent("F · 75px");
    spy.mockRestore();
  });

  it("reveal=letter deixa só a letra sob o ponteiro em contorno", () => {
    const { container } = render(<TechText text={TEXT} sweep={false} />);
    point(rootOf(container), centerX(1));
    const fills = lettersOf(container).map(fillOf);
    expect(fills).toEqual([1, 0, 1, 1, 1]);
    expect(selectionOf(container)).toHaveTextContent("l · 150px");
  });

  it("reveal=off mantém todas sólidas", () => {
    const { container } = render(<TechText text={TEXT} reveal="off" sweep={false} />);
    point(rootOf(container), centerX(1));
    expect(lettersOf(container).map(fillOf)).toEqual([1, 1, 1, 1, 1]);
  });

  it("reveal=area abre a letra no centro do ponteiro e mantém as distantes sólidas", () => {
    const { container } = render(
      <TechText text="Fluxo" reveal="area" reachPx={100} sweep={false} />
    );
    point(rootOf(container), centerX(0), 85);
    const fills = lettersOf(container).map(fillOf);
    expect(fills[0]).toBeLessThan(0.5);
    expect(fills[4]).toBe(1);
  });

  it("lineStyle controla o tracejado do contorno", () => {
    const { container, rerender } = render(<TechText text={TEXT} dashPx={6} gapPx={3} />);
    expect(lettersOf(container)[0]).toHaveAttribute("stroke-dasharray", "6 3");
    rerender(<TechText text={TEXT} lineStyle="solid" />);
    expect(lettersOf(container)[0]).not.toHaveAttribute("stroke-dasharray");
  });

  it("selection=false e labels=false escondem moldura e etiqueta", () => {
    const { container, rerender } = render(<TechText text={TEXT} selection={false} />);
    point(rootOf(container), centerX(1));
    expect(selectionOf(container)).toBeNull();
    rerender(<TechText text={TEXT} labels={false} specks={0} />);
    point(rootOf(container), centerX(1));
    expect(selectionOf(container)).not.toBeNull();
    expect(selectionOf(container)).toBeEmptyDOMElement();
  });

  it("specks aparecem em volta da letra ativa e specks=0 os desliga", () => {
    const { container, rerender } = render(<TechText text={TEXT} specks={5} />);
    point(rootOf(container), centerX(1));
    expect(container.querySelectorAll('[data-slot="tech-text-speck"]')).toHaveLength(5);
    rerender(<TechText text={TEXT} specks={0} />);
    expect(container.querySelectorAll('[data-slot="tech-text-speck"]')).toHaveLength(0);
  });

  it("arrasto troca a etiqueta para dx, dy e o pointerup reseta", () => {
    const { container } = render(<TechText text={TEXT} sweep={false} />);
    const root = rootOf(container);
    point(root, centerX(1), 70);
    fireEvent.pointerDown(root, { clientX: centerX(1), clientY: 70 });
    point(root, centerX(1) + 20, 100);
    expect(selectionOf(container)).toHaveTextContent("20, 30");
    fireEvent.pointerUp(root, { clientX: centerX(1) + 20, clientY: 100 });
    expect(selectionOf(container)).toHaveTextContent("l · 150px");
  });

  it("draggable=false ignora o arrasto", () => {
    const { container } = render(<TechText text={TEXT} draggable={false} sweep={false} />);
    const root = rootOf(container);
    point(root, centerX(1), 70);
    fireEvent.pointerDown(root, { clientX: centerX(1), clientY: 70 });
    point(root, centerX(1) + 20, 100);
    expect(selectionOf(container)).toHaveTextContent("l · 150px");
  });

  it("sem ponteiro, a varredura começa após ~1,5s e percorre a palavra em loop", () => {
    const { container } = render(<TechText text={TEXT} />);
    const root = rootOf(container);
    expect(root).toHaveAttribute("data-sweeping", "false");
    act(() => vi.advanceTimersByTime(1400));
    expect(root).toHaveAttribute("data-sweeping", "false");
    act(() => vi.advanceTimersByTime(200));
    expect(root).toHaveAttribute("data-sweeping", "true");
    const first = root.getAttribute("data-active-index");
    act(() => vi.advanceTimersByTime(600));
    expect(root.getAttribute("data-active-index")).not.toBe(first);
    const seen = new Set<string>();
    for (let step = 0; step < 12; step++) {
      act(() => vi.advanceTimersByTime(500));
      seen.add(root.getAttribute("data-active-index") as string);
    }
    expect(seen.size).toBe(5);
  });

  it("o ponteiro para a varredura e sair a retoma depois do atraso", () => {
    const { container } = render(<TechText text={TEXT} />);
    const root = rootOf(container);
    act(() => vi.advanceTimersByTime(2000));
    expect(root).toHaveAttribute("data-sweeping", "true");
    point(root, centerX(2));
    expect(root).toHaveAttribute("data-sweeping", "false");
    expect(root).toHaveAttribute("data-active-index", "2");
    fireEvent.pointerLeave(root);
    act(() => vi.advanceTimersByTime(1000));
    expect(root).toHaveAttribute("data-sweeping", "false");
    act(() => vi.advanceTimersByTime(700));
    expect(root).toHaveAttribute("data-sweeping", "true");
  });

  it("sweep=false nunca varre", () => {
    const { container } = render(<TechText text={TEXT} sweep={false} />);
    act(() => vi.advanceTimersByTime(10000));
    expect(rootOf(container)).toHaveAttribute("data-sweeping", "false");
  });

  it("movimento reduzido: sem varredura, mas o reveal por ponteiro continua", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <TechText text={TEXT} />
      </MotionConfig>
    );
    const root = rootOf(container);
    act(() => vi.advanceTimersByTime(10000));
    expect(root).toHaveAttribute("data-sweeping", "false");
    point(root, centerX(3));
    expect(lettersOf(container).map(fillOf)).toEqual([1, 1, 1, 0, 1]);
  });
});
