import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildVariationSettings, proximityFalloff, VariableProximity } from "./variable-proximity";

const CHAR = '[data-slot="variable-proximity-char"]';
const charsOf = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(CHAR)];

// rAF síncrono: cada quadro agendado roda na hora.
class FakeFrameScheduler {
  private spy: ReturnType<typeof vi.spyOn> | null = null;
  install() {
    this.spy = vi.spyOn(globalThis, "requestAnimationFrame");
    this.spy.mockImplementation((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  }
  restore() {
    this.spy?.mockRestore();
  }
}

// Cada letra ocupa 10px de largura, uma ao lado da outra, a partir de x=0.
function stubCharLayout() {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const index = Number(this.dataset.index ?? 0);
    return {
      left: index * 10,
      top: 0,
      width: 10,
      height: 20,
      right: index * 10 + 10,
      bottom: 20,
      x: index * 10,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  });
}

const scheduler = new FakeFrameScheduler();
beforeEach(() => scheduler.install());
afterEach(() => scheduler.restore());

describe("proximityFalloff", () => {
  it.each([
    "linear",
    "exponential",
    "gaussian",
  ] as const)("%s: 0 vira 1, 1 ou mais vira 0 e é monotônica", (curve) => {
    expect(proximityFalloff(curve, 0)).toBeCloseTo(1, 5);
    expect(proximityFalloff(curve, 1)).toBe(0);
    expect(proximityFalloff(curve, 3)).toBe(0);
    let previous = 1;
    for (const x of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      const value = proximityFalloff(curve, x);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });

  it("linear e exponential seguem as fórmulas da spec", () => {
    expect(proximityFalloff("linear", 0.25)).toBeCloseTo(0.75, 5);
    expect(proximityFalloff("exponential", 0.5)).toBeCloseTo(0.25, 5);
  });
});

describe("buildVariationSettings", () => {
  it("monta só wght sem eixos extras", () => {
    expect(buildVariationSettings(650, {}, 0)).toBe('"wght" 650');
  });

  it("interpola eixos extras com o mesmo t", () => {
    expect(buildVariationSettings(500, { opsz: [10, 30] }, 0.5)).toBe('"wght" 500, "opsz" 20');
  });
});

describe("VariableProximity", () => {
  it("expõe o texto completo em sr-only e esconde as letras", () => {
    const { container } = render(<VariableProximity text="Saldo em caixa" />);
    expect(screen.getByText("Saldo em caixa")).toHaveClass("sr-only");
    const chars = charsOf(container);
    expect(chars).toHaveLength("Saldoemcaixa".length);
    expect(chars[0].closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("preserva os espaços e mantém cada palavra em inline-block sem quebra", () => {
    const { container } = render(<VariableProximity text="Saldo em caixa" />);
    const hidden = container.querySelector("[aria-hidden='true']") as HTMLElement;
    expect(hidden.textContent).toBe("Saldo em caixa");
    const words = [...hidden.children] as HTMLElement[];
    expect(words.filter((n) => n.classList.contains("inline-block"))).toHaveLength(3);
    for (const word of words.filter((n) => n.classList.contains("inline-block")))
      expect(word).toHaveClass("whitespace-nowrap");
  });

  it("pointermove sobre uma letra engorda ela e não a que está longe", () => {
    const layout = stubCharLayout();
    const { container } = render(
      <VariableProximity text="Receita liquida" radiusPx={40} fromWeight={400} toWeight={800} />
    );
    const root = container.querySelector('[data-slot="variable-proximity"]') as HTMLElement;
    const chars = charsOf(container);
    // centro da letra 0 = x 5
    fireEvent.pointerMove(root, { clientX: 5, clientY: 10 });
    expect(chars[0].style.fontVariationSettings).toBe('"wght" 800');
    expect(chars[chars.length - 1].style.fontVariationSettings).toBe('"wght" 400');
    layout.mockRestore();
  });

  it("pointerleave volta tudo a fromWeight", () => {
    const layout = stubCharLayout();
    const { container } = render(<VariableProximity text="Receita" radiusPx={40} />);
    const root = container.querySelector('[data-slot="variable-proximity"]') as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 5, clientY: 10 });
    fireEvent.pointerLeave(root);
    for (const char of charsOf(container))
      expect(char.style.fontVariationSettings).toBe('"wght" 400');
    layout.mockRestore();
  });

  it("escuta o containerRef quando informado", () => {
    const layout = stubCharLayout();
    const area = document.createElement("div");
    document.body.appendChild(area);
    const containerRef = { current: area };
    const { container } = render(
      <VariableProximity text="Receita" radiusPx={40} containerRef={containerRef} />
    );
    fireEvent.pointerMove(area, { clientX: 5, clientY: 10 });
    expect(charsOf(container)[0].style.fontVariationSettings).toBe('"wght" 800');
    area.remove();
    layout.mockRestore();
  });

  it("texto vazio lança erro com valor recebido e formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<VariableProximity text="" />)).toThrow(
      /received "".*expected text: string não vazio/
    );
    spy.mockRestore();
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<VariableProximity text="Caixa" ref={ref} className="text-primary" />);
    expect(ref.current).toHaveAttribute("data-slot", "variable-proximity");
    expect(ref.current).toHaveClass("text-primary");
  });

  it("com movimento reduzido o efeito continua, mas sem transição", () => {
    const layout = stubCharLayout();
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <VariableProximity text="Receita" radiusPx={40} />
      </MotionConfig>
    );
    const root = container.querySelector('[data-slot="variable-proximity"]') as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 5, clientY: 10 });
    const first = charsOf(container)[0];
    expect(first.style.fontVariationSettings).toBe('"wght" 800');
    expect(first.className).not.toContain("transition");
    layout.mockRestore();
  });
});
