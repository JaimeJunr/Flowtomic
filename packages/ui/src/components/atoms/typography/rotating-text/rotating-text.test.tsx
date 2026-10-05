import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { formatWordList, RotatingText, splitWord, staggerOrder } from "./rotating-text";

const WORDS = ["análises", "relatórios", "alertas"];
const SEGMENT = '[data-slot="rotating-text-segment"]';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
type FakeObserver = { callback: ObserverCallback; targets: Element[] };

const originalObserver = global.IntersectionObserver;
let observers: FakeObserver[] = [];

// O mock global do setup nunca dispara; aqui a raiz já nasce visível e o teste pode tirá-la da tela.
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
  container.querySelector('[data-slot="rotating-text"]') as HTMLElement;
// Cada troca agenda o próximo timer num efeito, então o tempo avança em passos de 1 s.
const tick = (ms: number) => {
  for (let left = ms; left > 0; left -= 1000)
    act(() => vi.advanceTimersByTime(Math.min(left, 1000)));
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

describe("RotatingText", () => {
  it("mostra a primeira palavra", () => {
    const { container } = render(<RotatingText words={WORDS} />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe("análises");
    expect(rootOf(container)).toHaveAttribute("data-index", "0");
  });

  it("depois de intervalMs mostra a segunda palavra e chama onIndexChange", () => {
    const onIndexChange = vi.fn();
    const { container } = render(
      <RotatingText words={WORDS} intervalMs={2000} onIndexChange={onIndexChange} />
    );
    tick(1999);
    expect(onIndexChange).not.toHaveBeenCalled();
    tick(1);
    expect(rootOf(container)).toHaveAttribute("data-index", "1");
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("a palavra visível troca de fato depois da animação de saída", async () => {
    vi.useRealTimers();
    const { container } = render(<RotatingText words={WORDS} intervalMs={30} />);
    await vi.waitFor(() =>
      expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe("relatórios")
    );
  });

  it("com loop=false para na última palavra", () => {
    const onIndexChange = vi.fn();
    const { container } = render(
      <RotatingText words={WORDS} loop={false} onIndexChange={onIndexChange} />
    );
    tick(10000);
    expect(rootOf(container)).toHaveAttribute("data-index", "2");
    expect(onIndexChange).toHaveBeenCalledTimes(2);
  });

  it("com loop=true volta à primeira", () => {
    const { container } = render(<RotatingText words={WORDS} />);
    tick(2000 * 3);
    expect(rootOf(container)).toHaveAttribute("data-index", "0");
  });

  it("auto=false não troca sozinho", () => {
    const onIndexChange = vi.fn();
    const { container } = render(
      <RotatingText words={WORDS} auto={false} onIndexChange={onIndexChange} />
    );
    tick(10000);
    expect(rootOf(container)).toHaveAttribute("data-index", "0");
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it("activeIndex controlado define a palavra e só pede a troca", () => {
    const onIndexChange = vi.fn();
    const { container, rerender } = render(
      <RotatingText words={WORDS} activeIndex={1} onIndexChange={onIndexChange} />
    );
    expect(rootOf(container)).toHaveAttribute("data-index", "1");
    tick(2000);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(rootOf(container)).toHaveAttribute("data-index", "1");
    rerender(<RotatingText words={WORDS} activeIndex={2} onIndexChange={onIndexChange} />);
    expect(rootOf(container)).toHaveAttribute("data-index", "2");
  });

  it("o sr-only traz a lista completa formatada, e não há aria-live", () => {
    const { container } = render(<RotatingText words={WORDS} />);
    expect(container.querySelector(".sr-only")?.textContent).toBe(
      "análises, relatórios ou alertas"
    );
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("splitBy define a quantidade de pedaços", () => {
    const words = ["relatórios fiscais"];
    const count = (splitBy: "character" | "word" | "none") => {
      const { container, unmount } = render(<RotatingText words={words} splitBy={splitBy} />);
      const total = container.querySelectorAll(SEGMENT).length;
      unmount();
      return total;
    };
    expect(count("character")).toBe("relatórios fiscais".length);
    expect(count("word")).toBe(2);
    expect(count("none")).toBe(1);
  });

  it("com splitBy word mantém o espaço entre as palavras", () => {
    const { container } = render(<RotatingText words={["contas a pagar"]} splitBy="word" />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe("contas a pagar");
    // Espaço solto entre itens de um flex é descartado pelo CSS: precisa morar dentro do pedaço.
    const pieces = [...container.querySelectorAll(SEGMENT)].map((node) => node.textContent);
    expect(pieces).toEqual(["contas ", "a ", "pagar"]);
  });

  it("a raiz recebe a largura medida da palavra e a atualiza na troca", async () => {
    const widths: Record<string, number> = { análises: 80, relatórios: 120 };
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const width = widths[this.textContent ?? ""] ?? 0;
        return { width } as DOMRect;
      });
    const { container } = render(<RotatingText words={WORDS} />);
    expect(rootOf(container).style.width).toBe("80px");
    tick(2000);
    await vi.waitFor(() => expect(rootOf(container).style.width).toBe("120px"));
    spy.mockRestore();
  });

  it("com movimento reduzido não fixa largura na raiz", () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ width: 80 } as DOMRect);
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <RotatingText words={WORDS} />
      </MotionConfig>
    );
    expect(rootOf(container).style.width).toBe("");
    spy.mockRestore();
  });

  it("words vazio lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<RotatingText words={[]} />)).toThrow(
      /received \[\].*expected words: string\[\] com ao menos 1 item/
    );
    spy.mockRestore();
  });

  it("hover pausa a troca e sair retoma", () => {
    const { container } = render(<RotatingText words={WORDS} />);
    const root = rootOf(container);
    fireEvent.pointerEnter(root);
    tick(10000);
    expect(root).toHaveAttribute("data-index", "0");
    fireEvent.pointerLeave(root);
    tick(2000);
    expect(root).toHaveAttribute("data-index", "1");
  });

  it("foco dentro pausa a troca", () => {
    const { container } = render(<RotatingText words={WORDS} />);
    const root = rootOf(container);
    fireEvent.focus(root);
    tick(10000);
    expect(root).toHaveAttribute("data-index", "0");
    fireEvent.blur(root);
    tick(2000);
    expect(root).toHaveAttribute("data-index", "1");
  });

  it("fora da tela não troca", () => {
    const { container } = render(<RotatingText words={WORDS} />);
    setIntersecting(false);
    tick(10000);
    expect(rootOf(container)).toHaveAttribute("data-index", "0");
  });

  it("com a aba escondida não troca e retoma ao voltar", () => {
    const { container } = render(<RotatingText words={WORDS} />);
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    tick(10000);
    expect(rootOf(container)).toHaveAttribute("data-index", "0");
    visibility.mockReturnValue("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    tick(2000);
    expect(rootOf(container)).toHaveAttribute("data-index", "1");
    visibility.mockRestore();
  });

  it("com movimento reduzido troca a palavra sem pedaços animados", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <RotatingText words={WORDS} />
      </MotionConfig>
    );
    expect(container.querySelector(SEGMENT)).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe("análises");
    tick(2000);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe("relatórios");
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<RotatingText words={WORDS} ref={ref} className="text-primary" id="alvo" />);
    expect(ref.current).toHaveAttribute("data-slot", "rotating-text");
    expect(ref.current).toHaveClass("text-primary");
    expect(ref.current).toHaveAttribute("id", "alvo");
  });

  it("formatWordList, splitWord e staggerOrder", () => {
    expect(formatWordList(["a"])).toBe("a");
    expect(formatWordList(["a", "b"])).toBe("a ou b");
    expect(formatWordList(["a", "b", "c"])).toBe("a, b ou c");
    expect(splitWord("oi ab", "character")).toEqual(["o", "i", " ", "a", "b"]);
    expect(splitWord("oi ab", "word")).toEqual(["oi", "ab"]);
    expect(splitWord("oi ab", "none")).toEqual(["oi ab"]);
    expect(staggerOrder(0, 5, "first")).toBe(0);
    expect(staggerOrder(0, 5, "last")).toBe(4);
    expect(staggerOrder(2, 5, "center")).toBe(0);
    expect(staggerOrder(0, 5, "center")).toBe(2);
  });
});
