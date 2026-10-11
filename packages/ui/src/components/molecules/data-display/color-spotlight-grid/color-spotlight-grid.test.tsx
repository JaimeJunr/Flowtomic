import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  ColorSpotlightGrid,
  type ColorSpotlightGridProps,
  type SpotlightGridItem,
} from "./color-spotlight-grid";

const ROOT = '[data-slot="color-spotlight-grid"]';
const CARD = '[data-slot="color-spotlight-grid-card"]';

const ITEMS: SpotlightGridItem[] = [
  { id: "a", title: "Carteiras", subtitle: "Gestão consolidada", content: <span>Bloco A</span> },
  {
    id: "b",
    title: "Risco",
    subtitle: "Limites e VaR",
    content: <span>Bloco B</span>,
    href: "/risco",
  },
];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => vi.useRealTimers());

const RECTS = [
  { left: 0, top: 0, right: 200, bottom: 100 },
  { left: 212, top: 0, right: 412, bottom: 100 },
];

function mockRects(root: HTMLElement) {
  root.querySelectorAll(CARD).forEach((card, i) => {
    const r = RECTS[i];
    card.getBoundingClientRect = () =>
      ({ ...r, x: r.left, y: r.top, width: 200, height: 100, toJSON: () => ({}) }) as DOMRect;
  });
}

function setup(
  props: Partial<ColorSpotlightGridProps> = {},
  reduced: "never" | "always" = "never"
) {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <ColorSpotlightGrid items={ITEMS} damping={0} {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  mockRects(root);
  const cards = Array.from(root.querySelectorAll<HTMLElement>(CARD));
  return { ...view, root, cards };
}

describe("ColorSpotlightGrid", () => {
  it("expõe ref, className, data-slot e papéis de lista", () => {
    const ref = createRef<HTMLDivElement>();
    const { root, cards } = setup({ ref, className: "minha" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha");
    expect(root).toHaveAttribute("role", "list");
    expect(cards).toHaveLength(2);
    for (const card of cards) expect(card).toHaveAttribute("role", "listitem");
  });

  it("mostra título e subtítulo, e esconde com showInfo false", () => {
    const view = setup();
    expect(screen.getByText("Carteiras")).toBeInTheDocument();
    expect(screen.getByText("Limites e VaR")).toBeInTheDocument();
    view.unmount();
    setup({ showInfo: false });
    expect(screen.queryByText("Carteiras")).not.toBeInTheDocument();
  });

  it("renderiza a mídia em duas camadas, a colorida aria-hidden", () => {
    const { cards } = setup();
    const base = cards[0].querySelector('[data-slot="color-spotlight-grid-base"]');
    const color = cards[0].querySelector('[data-slot="color-spotlight-grid-color"]');
    expect(base).not.toHaveAttribute("aria-hidden");
    expect(color).toHaveAttribute("aria-hidden", "true");
    expect(base).toHaveStyle({ filter: "grayscale(1) brightness(0.88)" });
  });

  it("com href o cartão ganha um link nomeado pelo título", () => {
    setup();
    expect(screen.getByRole("link", { name: "Risco" })).toHaveAttribute("href", "/risco");
  });

  it("define as colunas pelo CSS grid", () => {
    const { root } = setup({ columns: 2, gap: 8, minCardWidth: 150 });
    expect(root.style.gridTemplateColumns).toContain("minmax(max(150px");
    expect(root.style.gap).toBe("8px");
  });

  it("lança erro com valor recebido para props inválidas", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => setup({ columns: 9 })).toThrow(/columns received 9/);
    expect(() => setup({ damping: 1 })).toThrow(/damping received 1/);
    spy.mockRestore();
  });

  it("pointermove escreve --x/--y relativos ao cartão (movimento reduzido: direto)", () => {
    const { root, cards } = setup({}, "always");
    fireEvent.pointerMove(root, { clientX: 250, clientY: 40 });
    expect(cards[1].style.getPropertyValue("--x")).toBe("38px");
    expect(cards[1].style.getPropertyValue("--y")).toBe("40px");
    expect(cards[0].style.getPropertyValue("--x")).toBe("250px");
    expect(cards[1].style.getPropertyValue("--r")).toBe("260px");
  });

  it("pointermove com amortecimento escreve por quadro; sair apaga o raio", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { root, cards } = setup({ radius: 100, fadeOut: 0.5 });
    fireEvent.pointerMove(root, { clientX: 50, clientY: 50 });
    act(() => void vi.advanceTimersByTime(400));
    expect(cards[0].style.getPropertyValue("--x")).toBe("50px");
    expect(cards[0].style.getPropertyValue("--r")).toBe("100px");
    fireEvent.pointerLeave(root);
    act(() => void vi.advanceTimersByTime(1000));
    expect(cards[0].style.getPropertyValue("--r")).toBe("0px");
  });

  it("movimento reduzido apaga na hora ao sair", () => {
    const { root, cards } = setup({}, "always");
    fireEvent.pointerMove(root, { clientX: 50, clientY: 50 });
    fireEvent.pointerLeave(root);
    expect(cards[0].style.getPropertyValue("--r")).toBe("0px");
  });

  it("a proximidade do ponteiro acende o brilho do cartão", () => {
    const { root, cards } = setup({ radius: 100 }, "always");
    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    expect(cards[0].style.getPropertyValue("--p")).toBe("1");
    expect(Number(cards[1].style.getPropertyValue("--p"))).toBeCloseTo(0.0, 5);
  });

  it("modo card: o cartão sob o ponteiro ganha data-revealed", () => {
    const { cards } = setup({ reveal: "card" });
    expect(cards[0]).not.toHaveAttribute("data-revealed");
    fireEvent.pointerEnter(cards[0]);
    expect(cards[0]).toHaveAttribute("data-revealed", "true");
    expect(cards[1]).not.toHaveAttribute("data-revealed");
    fireEvent.pointerLeave(cards[0]);
    expect(cards[0]).not.toHaveAttribute("data-revealed");
  });

  it("foco por teclado revela o cartão inteiro", () => {
    const { cards } = setup();
    const link = screen.getByRole("link", { name: "Risco" });
    act(() => link.focus());
    expect(cards[1]).toHaveAttribute("data-revealed", "true");
    act(() => link.blur());
    expect(cards[1]).not.toHaveAttribute("data-revealed");
  });

  it("cartão sem link é focável por teclado", () => {
    const { cards } = setup();
    expect(cards[0]).toHaveAttribute("tabindex", "0");
    act(() => cards[0].focus());
    expect(cards[0]).toHaveAttribute("data-revealed", "true");
  });
});
