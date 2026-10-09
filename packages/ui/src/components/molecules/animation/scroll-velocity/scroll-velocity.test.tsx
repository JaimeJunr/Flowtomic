import { act, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  boostFactor,
  copiesNeeded,
  rowDirection,
  ScrollVelocity,
  scrollDirection,
  wrap,
} from "./scroll-velocity";

const ITEMS = ["Contas a pagar", "Contas a receber", "Fluxo de caixa"];
const ROW = '[data-slot="scroll-velocity-row"]';
const COPY = '[data-slot="scroll-velocity-copy"]';
const originalObserver = global.IntersectionObserver;

const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="scroll-velocity"]') as HTMLElement;

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

describe("ScrollVelocity", () => {
  it("N itens geram N faixas, cada uma com ao menos 4 cópias aria-hidden e o item em sr-only uma vez", () => {
    const { container } = render(<ScrollVelocity items={ITEMS} />);
    const rows = container.querySelectorAll(ROW);
    expect(rows).toHaveLength(ITEMS.length);
    rows.forEach((row, index) => {
      const copies = row.querySelectorAll(COPY);
      expect(copies.length).toBeGreaterThanOrEqual(4);
      for (const copy of copies) expect(copy.closest('[aria-hidden="true"]')).not.toBeNull();
      const srOnly = row.querySelectorAll(".sr-only");
      expect(srOnly).toHaveLength(1);
      expect(srOnly[0]?.textContent).toBe(ITEMS[index]);
      expect(srOnly[0]?.closest('[aria-hidden="true"]')).toBeNull();
    });
  });

  it("aceita qualquer nó como item", () => {
    const { container } = render(
      <ScrollVelocity
        items={[
          <span key="a" data-testid="icone">
            ícone
          </span>,
        ]}
      />
    );
    expect(container.querySelectorAll('[data-testid="icone"]').length).toBeGreaterThanOrEqual(5);
  });

  it("itemClassName é aplicado a todas as cópias", () => {
    const { container } = render(<ScrollVelocity items={ITEMS} itemClassName="text-primary" />);
    const copies = container.querySelectorAll(COPY);
    expect(copies.length).toBeGreaterThan(0);
    for (const copy of copies) expect(copy).toHaveClass("text-primary");
  });

  it("wrap leva o valor para o intervalo [min, max)", () => {
    expect(wrap(-100, 0, -50)).toBe(-50);
    expect(wrap(-100, 0, 20)).toBe(-80);
    expect(wrap(-100, 0, -130)).toBe(-30);
    expect(wrap(-100, 0, 0)).toBe(-100);
    expect(wrap(-100, 0, -100)).toBe(-100);
    expect(() => wrap(0, 0, 1)).toThrow(/received min 0, max 0.*expected max > min/);
  });

  it("boostFactor: 0 -> 0, boostAt -> maxBoost, acima satura", () => {
    expect(boostFactor(0, 1000, 5)).toBe(0);
    expect(boostFactor(500, 1000, 5)).toBe(2.5);
    expect(boostFactor(1000, 1000, 5)).toBe(5);
    expect(boostFactor(9000, 1000, 5)).toBe(5);
    expect(boostFactor(-1000, 1000, 5)).toBe(5);
    expect(() => boostFactor(1, 0, 5)).toThrow(/received 0.*expected boostAtScrollSpeed > 0/);
  });

  it("rowDirection alterna o sentido por índice e scrollDirection inverte ao subir", () => {
    expect(rowDirection(0)).toBe(-1);
    expect(rowDirection(1)).toBe(1);
    expect(rowDirection(2)).toBe(-1);
    expect(scrollDirection(300, 1)).toBe(1);
    expect(scrollDirection(-300, 1)).toBe(-1);
    expect(scrollDirection(0, -1)).toBe(-1);
  });

  it("copiesNeeded cobre 2x a largura visível com mínimo de 4", () => {
    expect(copiesNeeded(0, 0)).toBe(4);
    expect(copiesNeeded(1000, 0)).toBe(4);
    expect(copiesNeeded(1000, 400)).toBe(6);
    expect(copiesNeeded(1000, 5000)).toBe(4);
    for (const [root, copy] of [
      [1000, 190],
      [1440, 123],
      [320, 77],
    ] as const) {
      expect(copiesNeeded(root, copy) * copy).toBeGreaterThanOrEqual(2 * root);
    }
  });

  it("a faixa tem cópias de sobra para a largura medida e nunca termina antes da borda direita", () => {
    const widths = { root: 1000, copy: 190 };
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const slot = this.dataset.slot;
        const width = slot === "scroll-velocity-copy" ? widths.copy : widths.root;
        return { width } as DOMRect;
      });
    const { container } = render(<ScrollVelocity items={ITEMS} />);
    for (const row of container.querySelectorAll(ROW)) {
      const copies = row.querySelectorAll(COPY).length;
      expect(copies).toBeGreaterThanOrEqual(11);
      expect(copies * widths.copy).toBeGreaterThanOrEqual(2 * widths.root);
    }
    spy.mockRestore();
  });

  it("remede ao redimensionar a raiz ou a cópia (ResizeObserver)", () => {
    const widths = { root: 400, copy: 200 };
    const callbacks: ResizeObserverCallback[] = [];
    const observed: Element[] = [];
    const originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = vi.fn().mockImplementation((callback: ResizeObserverCallback) => {
      callbacks.push(callback);
      return {
        observe: (target: Element) => observed.push(target),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    }) as unknown as typeof ResizeObserver;
    const spy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const width = this.dataset.slot === "scroll-velocity-copy" ? widths.copy : widths.root;
        return { width } as DOMRect;
      });
    const { container } = render(<ScrollVelocity items={["Fluxo de caixa"]} />);
    const copiesNow = () => container.querySelectorAll(COPY).length;
    expect(copiesNow()).toBe(copiesNeeded(400, 200));
    expect(
      observed.some((el) => el.matches(ROW) || el.matches('[data-slot="scroll-velocity"]'))
    ).toBe(true);
    expect(observed.some((el) => el.matches(COPY))).toBe(true);
    widths.root = 1000;
    act(() => {
      for (const callback of callbacks) callback([], {} as ResizeObserver);
    });
    expect(copiesNow()).toBe(copiesNeeded(1000, 200));
    widths.copy = 100;
    act(() => {
      for (const callback of callbacks) callback([], {} as ResizeObserver);
    });
    expect(copiesNow()).toBe(copiesNeeded(1000, 100));
    spy.mockRestore();
    global.ResizeObserver = originalResizeObserver;
  });

  it("com movimento normal e visível as faixas se movem", () => {
    const { container } = render(<ScrollVelocity items={ITEMS} />);
    expect(rootOf(container)).toHaveAttribute("data-moving", "true");
  });

  it("com movimento reduzido as faixas ficam paradas", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <ScrollVelocity items={ITEMS} />
      </MotionConfig>
    );
    expect(rootOf(container)).toHaveAttribute("data-moving", "false");
  });

  it("com a aba escondida as faixas param e voltam ao reaparecer", () => {
    const { container } = render(<ScrollVelocity items={ITEMS} />);
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(rootOf(container)).toHaveAttribute("data-moving", "false");
    visibility.mockReturnValue("visible");
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(rootOf(container)).toHaveAttribute("data-moving", "true");
    visibility.mockRestore();
  });

  it("fora da tela as faixas param", () => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    })) as unknown as typeof IntersectionObserver;
    const { container } = render(<ScrollVelocity items={ITEMS} />);
    expect(rootOf(container)).toHaveAttribute("data-moving", "false");
  });

  it("raiz tem overflow-hidden, ref, className e repassa props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ScrollVelocity items={ITEMS} ref={ref} className="py-8" id="faixas" />);
    expect(ref.current).toHaveAttribute("data-slot", "scroll-velocity");
    expect(ref.current).toHaveClass("overflow-hidden", "py-8");
    expect(ref.current).toHaveAttribute("id", "faixas");
  });

  it("items vazio lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<ScrollVelocity items={[]} />)).toThrow(
      /received \[\].*expected items: ReactNode\[\] com ao menos 1 item/
    );
    spy.mockRestore();
  });
});
