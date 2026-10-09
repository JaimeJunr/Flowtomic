import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  changedTiles,
  charsetOf,
  flipSequence,
  padPhrase,
  SplitFlapText,
  tileCountOf,
} from "./split-flap-text";

const TILE = '[data-slot="split-flap-tile"]';

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
  container.querySelector('[data-slot="split-flap-text"]') as HTMLElement;
const tilesOf = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(TILE)];
const shownOf = (container: HTMLElement) =>
  tilesOf(container)
    .map((tile) => tile.textContent || " ")
    .join("");
const srOf = (container: HTMLElement) => container.querySelector(".sr-only")?.textContent;
const tick = (ms: number) => {
  for (let left = ms; left > 0; left -= 200) act(() => vi.advanceTimersByTime(Math.min(left, 200)));
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

describe("SplitFlapText", () => {
  it("o maior tamanho define o número de plaquinhas e minúsculas viram maiúsculas", () => {
    const { container } = render(<SplitFlapText words={["voo 12", "atrasado"]} holdMs={60000} />);
    expect(tilesOf(container)).toHaveLength(8);
    tick(6000);
    expect(shownOf(container)).toBe("VOO 12  ");
  });

  it("padTo fixa a quantidade de plaquinhas", () => {
    const { container } = render(<SplitFlapText text="ok" padTo={6} />);
    expect(tilesOf(container)).toHaveLength(6);
  });

  it("text tem prioridade sobre words e anima a entrada uma vez", () => {
    const { container } = render(<SplitFlapText text="caixa" words={["outro"]} />);
    expect(shownOf(container).trim()).toBe("");
    tick(6000);
    expect(shownOf(container)).toBe("CAIXA");
    tick(20000);
    expect(shownOf(container)).toBe("CAIXA");
  });

  it("troca de frase depois de holdMs e volta ao início com loop", () => {
    const { container } = render(
      <SplitFlapText words={["aberto", "fechado"]} holdMs={3000} staggerMs={10} flipMs={20} />
    );
    expect(srOf(container)).toBe("aberto");
    tick(2999);
    expect(srOf(container)).toBe("aberto");
    tick(1);
    expect(srOf(container)).toBe("fechado");
    tick(500);
    expect(shownOf(container)).toBe("FECHADO");
    tick(3000);
    expect(srOf(container)).toBe("aberto");
  });

  it("loop=false para na última frase", () => {
    const { container } = render(
      <SplitFlapText words={["a", "b"]} loop={false} holdMs={1000} staggerMs={10} flipMs={20} />
    );
    tick(20000);
    expect(srOf(container)).toBe("b");
  });

  it("o sr-only mostra a frase atual, sem aria-live, e as plaquinhas são aria-hidden", () => {
    const { container } = render(<SplitFlapText text="Pago" />);
    expect(srOf(container)).toBe("Pago");
    expect(container.querySelector("[aria-live]")).toBeNull();
    for (const tile of tilesOf(container)) expect(tile).toHaveAttribute("aria-hidden", "true");
  });

  it("hover e foco pausam a troca, e fora da tela também", () => {
    const { container } = render(
      <SplitFlapText words={["a", "b"]} holdMs={1000} staggerMs={10} flipMs={20} />
    );
    const root = rootOf(container);
    fireEvent.pointerEnter(root);
    tick(10000);
    expect(srOf(container)).toBe("a");
    fireEvent.pointerLeave(root);
    fireEvent.focus(root);
    tick(10000);
    expect(srOf(container)).toBe("a");
    fireEvent.blur(root);
    setIntersecting(false);
    tick(10000);
    expect(srOf(container)).toBe("a");
    setIntersecting(true);
    tick(1000);
    expect(srOf(container)).toBe("b");
  });

  it("sem frase lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<SplitFlapText />)).toThrow(
      /received text=undefined, words=undefined.*expected text: string ou words: string\[\] com ao menos 1 item/
    );
    expect(() => render(<SplitFlapText words={[]} />)).toThrow(
      /received text=undefined, words=\[\]/
    );
    spy.mockRestore();
  });

  it("com movimento reduzido a troca é direta, sem viradas", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <SplitFlapText words={["aberto", "fechado"]} holdMs={1000} />
      </MotionConfig>
    );
    expect(shownOf(container)).toBe("ABERTO ");
    tick(1000);
    expect(shownOf(container)).toBe("FECHADO");
    expect(container.querySelector('[data-flipping="true"]')).toBeNull();
  });

  it("a raiz tem a classe dark e expõe ref, className e data-slot", () => {
    const ref = createRef<HTMLDivElement>();
    render(<SplitFlapText text="ok" ref={ref} className="text-3xl" id="alvo" />);
    expect(ref.current).toHaveAttribute("data-slot", "split-flap-text");
    expect(ref.current).toHaveClass("dark", "text-3xl");
    expect(ref.current).toHaveAttribute("id", "alvo");
  });

  it("flipSequence tem flipsPerChar + 1 itens, termina no alvo e usa o charset", () => {
    const charset = charsetOf("alpha");
    const sequence = flipSequence("K", charset, 6, 3);
    expect(sequence).toHaveLength(7);
    expect(sequence[6]).toBe("K");
    for (const letter of sequence.slice(0, 6)) expect(charset).toContain(letter);
    expect(flipSequence("K", charset, 6, 3)).toEqual(sequence);
    expect(flipSequence("K", charset, 6, 4)).not.toEqual(sequence);
  });

  it("charsetOf, padPhrase, tileCountOf e changedTiles", () => {
    expect(charsetOf("numeric")).toBe("0123456789");
    expect(charsetOf("alphanumeric")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
    expect(charsetOf("XYZ")).toBe("XYZ");
    expect(padPhrase("oi", 4)).toBe("OI  ");
    expect(padPhrase("abcdef", 4)).toBe("ABCD");
    expect(tileCountOf(["ab", "abcd"], undefined)).toBe(4);
    expect(tileCountOf(["ab"], 9)).toBe(9);
    expect(changedTiles("ABC ", "ABD ")).toEqual([2]);
    expect(changedTiles("AB", "AB")).toEqual([]);
  });
});
