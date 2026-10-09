import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { splitSentence, TrueFocus } from "./true-focus";

const SENTENCE = "Fluxo de caixa";
const WORD = '[data-slot="true-focus-word"]';
const FRAME = '[data-slot="true-focus-frame"]';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
type FakeObserver = { callback: ObserverCallback; targets: Element[] };

const originalObserver = global.IntersectionObserver;
let observers: FakeObserver[] = [];

function setIntersecting(isIntersecting: boolean) {
  act(() => {
    for (const observer of observers) {
      observer.callback(
        observer.targets.map((target) => ({ target, isIntersecting, intersectionRatio: 1 }))
      );
    }
  });
}

const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="true-focus"]') as HTMLElement;
const wordsOf = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(WORD)];
// Cada troca agenda o próximo timer num efeito, então o tempo avança em passos curtos.
const tick = (ms: number) => {
  for (let left = ms; left > 0; left -= 500) act(() => vi.advanceTimersByTime(Math.min(left, 500)));
};

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  observers = [];
  global.IntersectionObserver = vi.fn().mockImplementation((callback: ObserverCallback) => {
    const observer: FakeObserver = { callback, targets: [] };
    observers.push(observer);
    return {
      observe: (target: Element) => {
        observer.targets.push(target);
        callback([{ target, isIntersecting: true, intersectionRatio: 1 }]);
      },
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    };
  }) as unknown as typeof IntersectionObserver;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  vi.useRealTimers();
  global.IntersectionObserver = originalObserver;
});

describe("TrueFocus", () => {
  it("renderiza N palavras e a primeira é a ativa", () => {
    const { container } = render(<TrueFocus sentence={SENTENCE} />);
    const words = wordsOf(container);
    expect(words.map((w) => w.textContent)).toEqual(["Fluxo", "de", "caixa"]);
    expect(rootOf(container)).toHaveAttribute("data-active-index", "0");
    expect(words[0].style.filter).toBe("blur(0px)");
    expect(words[1].style.filter).toBe("blur(4px)");
  });

  it("blurPx define o borrão das palavras inativas", () => {
    const { container } = render(<TrueFocus sentence={SENTENCE} blurPx={8} />);
    expect(wordsOf(container)[2].style.filter).toBe("blur(8px)");
  });

  it("no modo auto a ativa avança a cada holdMs + transitionMs e volta ao início", () => {
    const { container } = render(
      <TrueFocus sentence={SENTENCE} holdMs={1000} transitionMs={500} />
    );
    const root = rootOf(container);
    tick(1499);
    expect(root).toHaveAttribute("data-active-index", "0");
    tick(1);
    expect(root).toHaveAttribute("data-active-index", "1");
    tick(1500);
    expect(root).toHaveAttribute("data-active-index", "2");
    tick(1500);
    expect(root).toHaveAttribute("data-active-index", "0");
  });

  it("hover na raiz pausa o modo auto e sair retoma", () => {
    const { container } = render(<TrueFocus sentence={SENTENCE} />);
    const root = rootOf(container);
    fireEvent.pointerEnter(root);
    tick(10000);
    expect(root).toHaveAttribute("data-active-index", "0");
    fireEvent.pointerLeave(root);
    tick(1650);
    expect(root).toHaveAttribute("data-active-index", "1");
  });

  it("foco dentro da raiz pausa o modo auto", () => {
    const { container } = render(<TrueFocus sentence={SENTENCE} />);
    const root = rootOf(container);
    fireEvent.focus(root);
    tick(10000);
    expect(root).toHaveAttribute("data-active-index", "0");
  });

  it("fora da tela não avança", () => {
    const { container } = render(<TrueFocus sentence={SENTENCE} />);
    setIntersecting(false);
    tick(10000);
    expect(rootOf(container)).toHaveAttribute("data-active-index", "0");
  });

  it("modo hover: pointerenter e focus numa palavra a ativam, sem avançar sozinho", () => {
    const { container } = render(<TrueFocus sentence={SENTENCE} mode="hover" />);
    const root = rootOf(container);
    const words = wordsOf(container);
    tick(10000);
    expect(root).toHaveAttribute("data-active-index", "0");
    for (const word of words) expect(word).toHaveAttribute("tabindex", "0");
    fireEvent.pointerEnter(words[1]);
    expect(root).toHaveAttribute("data-active-index", "1");
    fireEvent.pointerLeave(words[1]);
    expect(root).toHaveAttribute("data-active-index", "1");
    fireEvent.focus(words[2]);
    expect(root).toHaveAttribute("data-active-index", "2");
  });

  it("no modo auto as palavras não são focáveis", () => {
    const { container } = render(<TrueFocus sentence={SENTENCE} />);
    for (const word of wordsOf(container)) expect(word).not.toHaveAttribute("tabindex");
  });

  it("separator divide a frase", () => {
    const { container } = render(
      <TrueFocus sentence="Caixa,Contas a pagar,Impostos" separator="," />
    );
    expect(wordsOf(container).map((w) => w.textContent)).toEqual([
      "Caixa",
      "Contas a pagar",
      "Impostos",
    ]);
  });

  it("frase vazia lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<TrueFocus sentence="" />)).toThrow(
      /received "".*expected sentence: string com ao menos 1 palavra/
    );
    spy.mockRestore();
  });

  it("há uma moldura aria-hidden posicionada pela caixa medida da palavra ativa", () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        return this.matches(WORD)
          ? ({ left: 40, top: 5, width: 60, height: 20 } as DOMRect)
          : ({ left: 10, top: 0, width: 300, height: 30 } as DOMRect);
      });
    const { container } = render(<TrueFocus sentence={SENTENCE} />);
    const frame = container.querySelector(FRAME) as HTMLElement;
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(frame.style.width).toBe("68px");
    expect(frame.style.height).toBe("28px");
    spy.mockRestore();
  });

  it("o texto é lido palavra por palavra, na ordem", () => {
    render(<TrueFocus sentence={SENTENCE} />);
    for (const word of ["Fluxo", "de", "caixa"]) expect(screen.getByText(word)).toBeVisible();
  });

  it("com movimento reduzido não há blur nem moldura", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <TrueFocus sentence={SENTENCE} />
      </MotionConfig>
    );
    expect(container.querySelector(FRAME)).toBeNull();
    for (const word of wordsOf(container)) expect(word.style.filter).toBe("");
  });

  it("splitSentence respeita o separador e descarta vazios", () => {
    expect(splitSentence("a  b", " ")).toEqual(["a", "b"]);
    expect(splitSentence("a, b ,,c", ",")).toEqual(["a", "b", "c"]);
    expect(splitSentence("   ", " ")).toEqual([]);
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<TrueFocus sentence={SENTENCE} ref={ref} className="text-primary" id="alvo" />);
    expect(ref.current).toHaveAttribute("data-slot", "true-focus");
    expect(ref.current).toHaveClass("text-primary");
    expect(ref.current).toHaveAttribute("id", "alvo");
  });
});
