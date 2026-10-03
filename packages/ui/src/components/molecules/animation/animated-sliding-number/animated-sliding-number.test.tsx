import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnimatedSlidingNumber } from "./animated-sliding-number";

// jsdom não implementa IntersectionObserver; o fake entrega só as entradas usadas pelo Motion.
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  private targets = new Set<Element>();

  constructor(private callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  emit(isIntersecting: boolean) {
    this.callback(
      Array.from(
        this.targets,
        (target) => ({ target, isIntersecting }) as IntersectionObserverEntry
      ),
      this as unknown as IntersectionObserver
    );
  }
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function enterViewport(visible: boolean) {
  expect(FakeIntersectionObserver.instances.length).toBeGreaterThan(0);
  act(() => {
    for (const observer of FakeIntersectionObserver.instances) observer.emit(visible);
  });
}

describe("AnimatedSlidingNumber", () => {
  it.each([
    [42, 0, ".", "42"],
    [0, 0, ".", "0"],
    [-12.5, 2, ",", "-12,50"],
    ["0042", 0, ".", "42"],
    [1.25, 2, ".", "1.25"],
    [99.99, 0, ".", "100"],
  ] as const)("value=%s, precisão=%i e separador=%s são lidos como %s, sem os dígitos do rolo", (value, decimalPlaces, decimalSeparator, expected) => {
    render(
      <button type="button">
        Valor{" "}
        <AnimatedSlidingNumber
          value={value}
          decimalPlaces={decimalPlaces}
          decimalSeparator={decimalSeparator}
        />
      </button>
    );
    expect(screen.getByRole("button", { name: `Valor ${expected}` })).toBeInTheDocument();
    expect(
      screen.getAllByText(expected).filter((element) => !element.closest('[aria-hidden="true"]'))
    ).toHaveLength(1);
  });

  it.each([
    [9, 10],
    [100, 0],
    [-1, 1],
  ])("atualizar value de %i para %i substitui a leitura anterior", (previous, next) => {
    const { rerender } = render(
      <button type="button">
        Valor <AnimatedSlidingNumber value={previous} />
      </button>
    );
    expect(screen.getByRole("button", { name: `Valor ${previous}` })).toBeInTheDocument();
    rerender(
      <button type="button">
        Valor <AnimatedSlidingNumber value={next} />
      </button>
    );
    expect(screen.getByRole("button", { name: `Valor ${next}` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: `Valor ${previous}` })).not.toBeInTheDocument();
  });

  it.each([
    [0, "00"],
    [7, "07"],
    [12, "12"],
    [-3, "-03"],
  ])("padStart em %i conserva sinal e lê %s", (value, expected) => {
    render(
      <button type="button">
        Valor <AnimatedSlidingNumber value={value} padStart />
      </button>
    );
    expect(screen.getByRole("button", { name: `Valor ${expected}` })).toBeInTheDocument();
  });

  it("slidingNumberProps configura precisão, separador e padding do valor", () => {
    render(
      <button type="button">
        Valor{" "}
        <AnimatedSlidingNumber
          value={3.5}
          slidingNumberProps={{ decimalPlaces: 2, decimalSeparator: ",", padStart: true }}
        />
      </button>
    );
    expect(screen.getByRole("button", { name: "Valor 03,50" })).toBeInTheDocument();
  });

  it("props diretas têm prioridade sobre a configuração aninhada", () => {
    render(
      <button type="button">
        Valor{" "}
        <AnimatedSlidingNumber
          value={3.5}
          decimalPlaces={1}
          decimalSeparator="."
          padStart={false}
          slidingNumberProps={{ decimalPlaces: 2, decimalSeparator: ",", padStart: true }}
        />
      </button>
    );
    expect(screen.getByRole("button", { name: "Valor 3.5" })).toBeInTheDocument();
  });

  it.each([
    true,
    false,
  ])("inViewOnce=%s inicia em zero e respeita entrada e saída da viewport", (inViewOnce) => {
    render(
      <button type="button">
        Valor <AnimatedSlidingNumber value={42} inView inViewOnce={inViewOnce} />
      </button>
    );
    expect(screen.getByRole("button", { name: "Valor 0" })).toBeInTheDocument();
    enterViewport(true);
    expect(screen.getByRole("button", { name: "Valor 42" })).toBeInTheDocument();
    enterViewport(false);
    expect(
      screen.getByRole("button", { name: `Valor ${inViewOnce ? 42 : 0}` })
    ).toBeInTheDocument();
    enterViewport(true);
    expect(screen.getByRole("button", { name: "Valor 42" })).toBeInTheDocument();
  });

  it.each([
    [42, "42"],
    [-1.25, "-1,25"],
  ])("movimento reduzido exibe %s como texto estático legível: %s", (value, expected) => {
    render(
      <MotionConfig reducedMotion="always">
        <button type="button">
          Valor{" "}
          <AnimatedSlidingNumber
            value={value}
            decimalPlaces={value < 0 ? 2 : 0}
            decimalSeparator=","
          />
        </button>
      </MotionConfig>
    );
    const button = screen.getByRole("button", { name: `Valor ${expected}` });
    expect(button).toHaveTextContent(`Valor ${expected}`);
    expect(screen.getByText(expected)).not.toHaveClass("sr-only");
    expect(button.textContent?.trim()).toBe(`Valor ${expected}`);
  });

  it.each([
    0, -5,
  ])("value=%i encaminha foco e clique do consumidor sem inventar argumentos", async (value) => {
    const onFocus = vi.fn();
    const onClick = vi.fn();
    render(
      <AnimatedSlidingNumber
        value={value}
        role="status"
        aria-label="Saldo"
        tabIndex={0}
        onFocus={onFocus}
        onClick={onClick}
      />
    );
    const number = screen.getByRole("status", { name: "Saldo" });
    const user = userEvent.setup();
    await user.tab();
    expect(number).toHaveFocus();
    expect(onFocus.mock.calls).toEqual([
      [expect.objectContaining({ type: "focus", target: number })],
    ]);
    await user.click(number);
    expect(onClick.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: number })],
    ]);
  });
});
