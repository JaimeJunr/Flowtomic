import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CardCycle, type CardCycleHandle, type CardCycleProps } from "./card-cycle";

const ITEMS = ["Conciliação", "Relatórios", "Cotas", "Alertas"].map((title, index) => ({
  id: `item-${index}`,
  title,
  content: <p>{`Corpo de ${title}`}</p>,
}));

const OriginalPointerEvent = window.PointerEvent;
// O PointerEvent do setup não carrega pointerType nem pointerId.
class TestPointerEvent extends MouseEvent {
  pointerType: string;
  pointerId: number;
  constructor(
    type: string,
    init: MouseEventInit & { pointerType?: string; pointerId?: number } = {}
  ) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
    this.pointerId = init.pointerId ?? 1;
  }
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = TestPointerEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
});

function setup(props: Partial<CardCycleProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <CardCycle items={ITEMS} autoplay={false} {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector('[data-slot="card-cycle"]') as HTMLDivElement;
  const cards = () =>
    Array.from(view.container.querySelectorAll<HTMLElement>('[data-slot="card-cycle-card"]'));
  const frontTitle = () =>
    view.container.querySelector('[data-slot-position="0"] [data-slot="card-cycle-header"]')
      ?.textContent;
  return { ...view, root, cards, frontTitle };
}

// O timeStamp do jsdom é o relógio real; fixá-lo deixa a velocidade do arrasto determinística.
function pointer(el: Element, type: string, x: number, y: number, t = 0, pointerType = "mouse") {
  const event = new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerType });
  Object.defineProperty(event, "timeStamp", { value: t });
  act(() => {
    fireEvent(el, event);
  });
}

describe("CardCycle", () => {
  it("expõe região acessível com data-slot e partes", () => {
    const { root, cards } = setup({ "aria-label": "Recursos do produto" });
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-roledescription", "carrossel");
    expect(root).toHaveAttribute("aria-label", "Recursos do produto");
    expect(root.querySelector('[data-slot="card-cycle-stage"]')).toBeInTheDocument();
    expect(cards()).toHaveLength(4);
  });

  it("esconde os cartões de trás da árvore acessível", () => {
    const { cards } = setup();
    const [front, ...rest] = cards();
    expect(front).not.toHaveAttribute("aria-hidden");
    for (const card of rest) {
      expect(card).toHaveAttribute("aria-hidden", "true");
      expect(card).toHaveAttribute("inert");
    }
  });

  it("lança erro com menos de 2 itens, citando o valor", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<CardCycle items={ITEMS.slice(0, 1)} />)).toThrow(/1/);
    spy.mockRestore();
  });

  it("lança erro com visibleCards fora da faixa", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<CardCycle items={ITEMS} visibleCards={12} />)).toThrow(/12/);
    spy.mockRestore();
  });

  it("controlRef.next e prev trocam o cartão da frente", async () => {
    const controlRef = createRef<CardCycleHandle>();
    const onChange = vi.fn();
    const { frontTitle } = setup({ controlRef, onChange });
    expect(frontTitle()).toContain("Conciliação");
    act(() => controlRef.current?.next());
    await waitFor(() => expect(frontTitle()).toContain("Relatórios"));
    expect(onChange).toHaveBeenLastCalledWith(1);
    await waitFor(() => expect(controlRef.current).not.toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 50));
    act(() => controlRef.current?.prev());
    await waitFor(() => expect(frontTitle()).toContain("Conciliação"));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("troca pelas setas do teclado com foco na raiz", async () => {
    const { root, frontTitle } = setup();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    await waitFor(() => expect(frontTitle()).toContain("Relatórios"));
  });

  it("traz um cartão de trás para a frente ao clicar e avisa onCardClick", async () => {
    const onCardClick = vi.fn();
    const { cards, frontTitle } = setup({ onCardClick });
    fireEvent.click(cards()[2]);
    await waitFor(() => expect(frontTitle()).toContain("Cotas"));
    expect(onCardClick).toHaveBeenCalledWith(2);
  });

  it("clique no cartão da frente só chama onCardClick", async () => {
    const onCardClick = vi.fn();
    const onChange = vi.fn();
    const { cards, frontTitle } = setup({ onCardClick, onChange });
    fireEvent.click(cards()[0]);
    expect(onCardClick).toHaveBeenCalledWith(0);
    expect(onChange).not.toHaveBeenCalled();
    expect(frontTitle()).toContain("Conciliação");
  });

  it("autoplay troca sozinho depois do interval", async () => {
    const onChange = vi.fn();
    setup({ autoplay: true, interval: 50, onChange });
    await waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 1500 });
  });

  it("o hover do mouse pausa o autoplay", async () => {
    const onChange = vi.fn();
    const { root } = setup({ autoplay: true, interval: 50, onChange });
    pointer(root, "pointerover", 10, 10);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("não pausa com pauseOnHover desligado", async () => {
    const onChange = vi.fn();
    const { root } = setup({ autoplay: true, interval: 50, pauseOnHover: false, onChange });
    pointer(root, "pointerover", 10, 10);
    await waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 1500 });
  });

  it("movimento reduzido não troca sozinho, mas troca na hora pelo teclado", async () => {
    const onChange = vi.fn();
    const { root, frontTitle } = setup({ autoplay: true, interval: 50, onChange }, "always");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(frontTitle()).toContain("Relatórios");
  });

  it("anuncia a posição e silencia o live region enquanto o autoplay roda", () => {
    const manual = setup();
    const live = manual.root.querySelector("[aria-live]");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent("Conciliação, 1 de 4");
    manual.unmount();
    const auto = setup({ autoplay: true });
    expect(auto.root.querySelector("[aria-live]")).toHaveAttribute("aria-live", "off");
  });

  it("arrastar o cartão da frente além do limite manda ao fundo", async () => {
    const { cards, frontTitle } = setup();
    const front = cards()[0];
    pointer(front, "pointerdown", 100, 100, 0);
    pointer(front, "pointermove", 160, 140, 200);
    pointer(front, "pointermove", 240, 180, 400);
    pointer(front, "pointerup", 240, 180, 400);
    await waitFor(() => expect(frontTitle()).toContain("Relatórios"));
  });

  it("arrasto curto volta sem trocar e não conta como clique", async () => {
    const onCardClick = vi.fn();
    const { cards, frontTitle } = setup({ onCardClick });
    const front = cards()[0];
    pointer(front, "pointerdown", 100, 100, 0);
    pointer(front, "pointermove", 110, 105, 300);
    pointer(front, "pointerup", 110, 105, 300);
    fireEvent.click(front);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(frontTitle()).toContain("Conciliação");
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("não arrasta com draggable desligado", async () => {
    const { cards, frontTitle } = setup({ draggable: false });
    const front = cards()[0];
    pointer(front, "pointerdown", 100, 100, 0);
    pointer(front, "pointermove", 300, 100, 100);
    pointer(front, "pointerup", 300, 100, 100);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(frontTitle()).toContain("Conciliação");
  });
});
