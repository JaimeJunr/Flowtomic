import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { BentoGlowGrid, type BentoGlowGridProps } from "./bento-glow-grid";

const ROOT = '[data-slot="bento-glow-grid"]';
const CARD = '[data-slot="bento-glow-grid-card"]';

const ITEMS = [
  { id: "painel", eyebrow: "Painel", title: "Visão consolidada", description: "Patrimônio" },
  { id: "relatorios", title: "Relatórios", description: "Lâminas mensais" },
  { id: "integracoes", title: "Integrações" },
  { id: "alertas", title: "Alertas" },
];

const RECT = {
  left: 100,
  top: 100,
  right: 300,
  bottom: 200,
  width: 200,
  height: 100,
  x: 100,
  y: 100,
  toJSON: () => ({}),
} as DOMRect;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: Partial<BentoGlowGridProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <BentoGlowGrid items={ITEMS} {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const cards = Array.from(view.container.querySelectorAll<HTMLElement>(CARD));
  for (const card of cards) card.getBoundingClientRect = () => RECT;
  root.getBoundingClientRect = () => ({ ...RECT, left: 0, top: 0, x: 0, y: 0 }) as DOMRect;
  return { ...view, root, cards };
}

function flush() {
  act(() => {
    vi.advanceTimersByTime(40);
  });
}

describe("BentoGlowGrid", () => {
  it("renderiza lista acessível com os itens", () => {
    const { root, cards, getByText } = setup();
    expect(root).toHaveAttribute("role", "list");
    expect(cards).toHaveLength(4);
    for (const card of cards) expect(card).toHaveAttribute("role", "listitem");
    expect(getByText("Visão consolidada")).toBeInTheDocument();
    expect(getByText("Painel")).toBeInTheDocument();
  });

  it("aplica o padrão bento nos índices 2 e 3 (2x2)", () => {
    const { cards } = setup();
    expect(cards[2].className).toContain("lg:col-span-2");
    expect(cards[2].className).toContain("lg:row-span-2");
    expect(cards[3].className).toContain("lg:col-span-2");
    expect(cards[3].className).toContain("lg:row-span-2");
    expect(cards[0].className).not.toContain("col-span-2");
  });

  it("dá altura mínima às linhas no lg para a linha só de itens 2x2 não colapsar", () => {
    const { container } = render(<BentoGlowGrid items={ITEMS} />);
    const root = container.querySelector('[data-slot="bento-glow-grid"]') as HTMLElement;
    expect(root.className).toContain("lg:auto-rows-[minmax(12rem,auto)]");
  });

  it("repassa ref, className e props", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = (() => {
      const view = render(<BentoGlowGrid ref={ref} items={ITEMS} className="extra" id="grade" />);
      return { root: view.container.querySelector(ROOT) as HTMLElement };
    })();
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("id", "grade");
  });

  it("renderiza o conteúdo extra do item", () => {
    const { getByText } = setup({ items: [{ id: "a", title: "A", content: <i>Gráfico</i> }] });
    expect(getByText("Gráfico")).toBeInTheDocument();
  });

  it("recusa itens vazios, acima de 12 e particleCount fora de 0..30", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const many = Array.from({ length: 13 }, (_, i) => ({ id: String(i), title: "x" }));
    expect(() => render(<BentoGlowGrid items={[]} />)).toThrow(/1\.\.12.*0/);
    expect(() => render(<BentoGlowGrid items={many} />)).toThrow(/1\.\.12.*13/);
    expect(() => render(<BentoGlowGrid items={ITEMS} particleCount={31} />)).toThrow(/0\.\.30.*31/);
    spy.mockRestore();
  });

  it("pointermove escreve --mx, --my e --glow nos cartões e --x/--y no holofote", () => {
    const { root, cards } = setup();
    fireEvent.pointerMove(root, { clientX: 150, clientY: 130 });
    flush();
    expect(cards[0].style.getPropertyValue("--mx")).toBe("50px");
    expect(cards[0].style.getPropertyValue("--my")).toBe("30px");
    expect(cards[0].style.getPropertyValue("--glow")).toBe("1");
    expect(root.style.getPropertyValue("--x")).toBe("150px");
    expect(root.style.getPropertyValue("--y")).toBe("130px");
  });

  it("o brilho cai com a distância e zera ao sair", () => {
    const { root, cards } = setup({ spotlightRadius: 300 });
    fireEvent.pointerMove(root, { clientX: 375, clientY: 150 });
    flush();
    expect(Number(cards[0].style.getPropertyValue("--glow"))).toBeCloseTo(0.5);
    fireEvent.pointerLeave(root);
    flush();
    expect(cards[0].style.getPropertyValue("--glow")).toBe("0");
  });

  it("omite holofote e borda quando desligados", () => {
    const { container } = setup({ spotlight: false, borderGlow: false });
    expect(container.querySelector('[data-slot="bento-glow-grid-spotlight"]')).toBeNull();
    expect(container.querySelector('[data-slot="bento-glow-grid-border"]')).toBeNull();
  });

  it("camadas de luz são aria-hidden", () => {
    const { container } = setup();
    const spotlight = container.querySelector('[data-slot="bento-glow-grid-spotlight"]');
    const border = container.querySelector('[data-slot="bento-glow-grid-border"]');
    expect(spotlight).toHaveAttribute("aria-hidden", "true");
    expect(border).toHaveAttribute("aria-hidden", "true");
  });

  it("mostra partículas só com o ponteiro dentro", () => {
    const { cards } = setup({ particleCount: 5 });
    expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-particle"]')).toHaveLength(0);
    fireEvent.pointerEnter(cards[0]);
    expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-particle"]')).toHaveLength(5);
    fireEvent.pointerLeave(cards[0]);
    return waitFor(() =>
      expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-particle"]')).toHaveLength(0)
    );
  });

  it("sem partículas quando particles é false", () => {
    const { cards } = setup({ particles: false });
    fireEvent.pointerEnter(cards[0]);
    expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-particle"]')).toHaveLength(0);
  });

  it("clique cria a onda e depois a remove", async () => {
    const { cards } = setup();
    fireEvent.click(cards[0], { clientX: 150, clientY: 130 });
    expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-ripple"]')).toHaveLength(1);
    await waitFor(() =>
      expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-ripple"]')).toHaveLength(0)
    );
  });

  it("não cria onda com ripple desligado", () => {
    const { cards } = setup({ ripple: false });
    fireEvent.click(cards[0], { clientX: 150, clientY: 130 });
    expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-ripple"]')).toHaveLength(0);
  });

  it("inclina e puxa o cartão com o ponteiro (tilt)", async () => {
    const { cards } = setup({ tilt: true });
    fireEvent.pointerEnter(cards[0]);
    fireEvent.pointerMove(cards[0], { clientX: 300, clientY: 150 });
    await waitFor(() => expect(cards[0].style.transform).toContain("rotateY(8deg)"));
    fireEvent.pointerLeave(cards[0]);
    await waitFor(() => expect(cards[0].style.transform).not.toContain("rotateY(8deg)"));
  });

  it("movimento reduzido: sem partículas, sem onda e sem inclinação, mas a luz segue", () => {
    const { root, cards } = setup({ tilt: true }, "always");
    fireEvent.pointerEnter(cards[0]);
    expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-particle"]')).toHaveLength(0);
    fireEvent.click(cards[0], { clientX: 150, clientY: 130 });
    expect(cards[0].querySelectorAll('[data-slot="bento-glow-grid-ripple"]')).toHaveLength(0);
    fireEvent.pointerMove(cards[0], { clientX: 300, clientY: 150 });
    expect(cards[0].style.transform).not.toContain("rotateY");
    fireEvent.pointerMove(root, { clientX: 150, clientY: 130 });
    flush();
    expect(cards[0].style.getPropertyValue("--glow")).toBe("1");
  });
});
