import { act, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BlurText, buildVariants, resolveStaggerMs } from "./blur-text";

const PHRASE = "Seu painel atualiza sozinho";
const SEGMENT = '[data-slot="blur-text-segment"]';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
type FakeObserver = { callback: ObserverCallback; targets: Element[] };

const originalObserver = global.IntersectionObserver;
let observers: FakeObserver[] = [];

// O mock global do setup nunca dispara; aqui capturamos o callback para simular a entrada na tela.
function setIntersecting(isIntersecting: boolean) {
  act(() => {
    for (const observer of observers) {
      observer.callback(
        observer.targets.map((target) => ({ target, isIntersecting, intersectionRatio: 1 }))
      );
    }
  });
}

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
      observe: (target: Element) => observer.targets.push(target),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    };
  }) as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  global.IntersectionObserver = originalObserver;
});

describe("BlurText", () => {
  it("lê a frase uma vez só para leitores de tela e esconde os pedaços", () => {
    const { container } = render(<BlurText text={PHRASE} />);
    expect(screen.getByText(PHRASE)).toHaveClass("sr-only");
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(container.querySelectorAll(SEGMENT)).toHaveLength(4);
  });

  it("quebra por palavra por padrão", () => {
    const { container } = render(<BlurText text={PHRASE} splitBy="word" />);
    expect(container.querySelectorAll(SEGMENT)).toHaveLength(4);
  });

  it("quebra por letra e mantém cada palavra inteira numa linha", () => {
    const { container } = render(<BlurText text={PHRASE} splitBy="letter" />);
    expect(container.querySelectorAll(SEGMENT)).toHaveLength(PHRASE.replace(/\s/g, "").length);
    const wordWrappers = container.querySelectorAll('[data-slot="blur-text-word"]');
    expect(wordWrappers).toHaveLength(4);
    expect(wordWrappers[0]).toHaveStyle({ whiteSpace: "nowrap", display: "inline-block" });
  });

  it("colapsa espaços múltiplos em um só", () => {
    const { container } = render(<BlurText text="  Seu    painel  " />);
    expect(container.querySelectorAll(SEGMENT)).toHaveLength(2);
    expect(screen.getByText("Seu painel")).toHaveClass("sr-only");
  });

  it("renderiza o elemento escolhido em as e expõe o ref na raiz", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<BlurText text={PHRASE} as="h2" ref={ref} />);
    expect(ref.current?.tagName).toBe("H2");
    expect(ref.current).toHaveAttribute("data-slot", "blur-text");
    expect(screen.getByRole("heading", { level: 2 })).toBe(ref.current);
  });

  it("mescla className na raiz e repassa props nativas", () => {
    render(<BlurText text={PHRASE} className="text-3xl" id="titulo" />);
    const root = document.querySelector('[data-slot="blur-text"]');
    expect(root).toHaveClass("text-3xl");
    expect(root).toHaveAttribute("id", "titulo");
  });

  it("expõe a direção de entrada em data-from", () => {
    const { rerender } = render(<BlurText text={PHRASE} />);
    const root = () => document.querySelector('[data-slot="blur-text"]');
    expect(root()).toHaveAttribute("data-from", "above");
    rerender(<BlurText text={PHRASE} from="below" />);
    expect(root()).toHaveAttribute("data-from", "below");
  });

  it("não chama onComplete enquanto a raiz está fora da tela", () => {
    const onComplete = vi.fn();
    render(<BlurText text={PHRASE} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("chama onComplete uma vez depois da animação", async () => {
    const onComplete = vi.fn();
    render(<BlurText text={PHRASE} onComplete={onComplete} />);
    setIntersecting(true);
    await vi.waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("com once=false recomeça ao sair e voltar para a tela", async () => {
    const onComplete = vi.fn();
    render(<BlurText text="Oi" once={false} onComplete={onComplete} />);
    setIntersecting(true);
    await vi.waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    setIntersecting(false);
    setIntersecting(true);
    await vi.waitFor(() => expect(onComplete).toHaveBeenCalledTimes(2));
  });

  it("com movimento reduzido mostra texto simples e chama onComplete no mount", () => {
    const onComplete = vi.fn();
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <BlurText text={PHRASE} onComplete={onComplete} />
      </MotionConfig>
    );
    expect(screen.getByText(PHRASE)).not.toHaveClass("sr-only");
    expect(container.querySelector(SEGMENT)).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("com movimento reduzido funciona sem onComplete", () => {
    render(
      <MotionConfig reducedMotion="always">
        <BlurText text="Oi" />
      </MotionConfig>
    );
    expect(screen.getByText("Oi")).toBeInTheDocument();
  });

  it("as=h1 expõe heading nível 1 com a frase inteira como nome", () => {
    render(<BlurText text={PHRASE} as="h1" />);
    expect(screen.getByRole("heading", { level: 1, name: PHRASE })).toBeInTheDocument();
  });

  it("os pedaços visíveis não são selecionáveis e não têm will-change", () => {
    const { container } = render(<BlurText text={PHRASE} />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass("select-none");
    expect(container.querySelector(SEGMENT)).not.toHaveStyle({ willChange: "transform" });
    expect(container.querySelector(SEGMENT)?.getAttribute("style")).not.toContain("will-change");
  });

  it("trocar o text reanima: os pedaços remontam", () => {
    const { container, rerender } = render(<BlurText text="Um dois" />);
    const before = container.querySelector(SEGMENT);
    rerender(<BlurText text="Um dois três" />);
    expect(container.querySelectorAll(SEGMENT)).toHaveLength(3);
    expect(container.querySelector(SEGMENT)).not.toBe(before);
  });

  it("o stagger padrão é 80 por palavra e 30 por letra, e o valor explícito vence", () => {
    expect(resolveStaggerMs("word", undefined)).toBe(80);
    expect(resolveStaggerMs("letter", undefined)).toBe(30);
    expect(resolveStaggerMs("letter", 50)).toBe(50);
  });

  it("o atraso de cada pedaço tem teto de 1000 ms", () => {
    const variants = buildVariants({ from: "above", durationMs: 500, staggerMs: 80 });
    const visible = variants.visible as unknown as (index: number) => {
      transition: { delay: number };
    };
    expect(visible(2).transition.delay).toBeCloseTo(0.16);
    expect(visible(100).transition.delay).toBe(1);
  });

  it("o desfoque é proporcional à fonte e o ease é o de saída forte", () => {
    const variants = buildVariants({ from: "below", durationMs: 500, staggerMs: 80 });
    expect(variants.hidden).toMatchObject({ filter: "blur(0.25em)", y: "0.5em" });
    const visible = variants.visible as unknown as (index: number) => {
      transition: { ease: number[] };
    };
    expect(visible(0).transition.ease).toEqual([0.23, 1, 0.32, 1]);
  });
});
