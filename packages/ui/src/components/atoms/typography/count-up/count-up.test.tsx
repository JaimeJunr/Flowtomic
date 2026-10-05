import { act, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CountUp, countDecimals, formatCountUp } from "./count-up";

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

const visible = (container: HTMLElement) =>
  container.querySelector('[aria-hidden="true"]')?.textContent;
const screenReader = (container: HTMLElement) => container.querySelector(".sr-only")?.textContent;

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

describe("CountUp", () => {
  it("o sr-only traz o valor final formatado em pt-BR", () => {
    const { container } = render(<CountUp to={1234567} />);
    expect(screenReader(container)).toBe("1.234.567");
  });

  it("antes de entrar na tela mostra o valor inicial e não dispara callbacks", () => {
    const onStart = vi.fn();
    const { container } = render(<CountUp to={100} onStart={onStart} />);
    expect(visible(container)).toBe("0");
    expect(onStart).not.toHaveBeenCalled();
  });

  it("termina exatamente em to e chama onStart e onEnd uma vez cada", async () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const { container } = render(<CountUp to={1234567} onStart={onStart} onEnd={onEnd} />);
    setIntersecting(true);
    await vi.waitFor(() => expect(onEnd).toHaveBeenCalled());
    expect(visible(container)).toBe("1.234.567");
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("conta para baixo quando from > to", async () => {
    const onEnd = vi.fn();
    const { container } = render(<CountUp from={500} to={20} onEnd={onEnd} />);
    expect(visible(container)).toBe("500");
    setIntersecting(true);
    await vi.waitFor(() => expect(onEnd).toHaveBeenCalled());
    expect(visible(container)).toBe("20");
  });

  it("decimalPlaces padrão vem do maior número de casas entre from e to", () => {
    const { container } = render(<CountUp to={12.5} />);
    expect(screenReader(container)).toBe("12,5");
  });

  it("decimalPlaces explícito vence o padrão", () => {
    const { container } = render(<CountUp to={12.5} decimalPlaces={2} />);
    expect(screenReader(container)).toBe("12,50");
  });

  it("formatOptions style percent formata como porcentagem", () => {
    const { container } = render(
      <CountUp to={0.42} decimalPlaces={0} formatOptions={{ style: "percent" }} />
    );
    expect(screenReader(container)).toBe("42%");
  });

  it("start=false não começa; trocar para true começa", async () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const { container, rerender } = render(
      <CountUp to={80} start={false} onStart={onStart} onEnd={onEnd} />
    );
    setIntersecting(true);
    expect(onStart).not.toHaveBeenCalled();
    expect(visible(container)).toBe("0");
    rerender(<CountUp to={80} start onStart={onStart} onEnd={onEnd} />);
    await vi.waitFor(() => expect(onEnd).toHaveBeenCalled());
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(visible(container)).toBe("80");
  });

  it("mudar to com o componente montado conta do valor atual até o novo", async () => {
    const onEnd = vi.fn();
    const { container, rerender } = render(<CountUp to={10} onEnd={onEnd} />);
    setIntersecting(true);
    await vi.waitFor(() => expect(onEnd).toHaveBeenCalledTimes(1));
    rerender(<CountUp to={30} onEnd={onEnd} />);
    await vi.waitFor(() => expect(onEnd).toHaveBeenCalledTimes(2));
    expect(visible(container)).toBe("30");
  });

  it("com movimento reduzido mostra o valor final direto e chama onEnd", () => {
    const onEnd = vi.fn();
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <CountUp to={1500} onEnd={onEnd} />
      </MotionConfig>
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(container.querySelector('[data-slot="count-up"]')?.textContent).toBe("1.500");
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("expõe ref, className, data-slot e tabular-nums na raiz", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CountUp to={5} ref={ref} className="text-3xl" id="kpi" />);
    expect(ref.current).toHaveAttribute("data-slot", "count-up");
    expect(ref.current).toHaveClass("text-3xl", "tabular-nums");
    expect(ref.current).toHaveAttribute("id", "kpi");
  });

  it("countDecimals conta as casas e formatCountUp respeita locale", () => {
    expect(countDecimals(12.5)).toBe(1);
    expect(countDecimals(7)).toBe(0);
    expect(countDecimals(1e-7)).toBe(7);
    expect(formatCountUp(1234.5, "en-US", 1)).toBe("1,234.5");
  });
});
