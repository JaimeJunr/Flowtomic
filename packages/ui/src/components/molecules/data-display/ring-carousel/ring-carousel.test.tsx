import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { RingCarousel, type RingCarouselItem, type RingCarouselProps } from "./ring-carousel";

const ROOT = '[data-slot="ring-carousel"]';
const RING = '[data-slot="ring-carousel-ring"]';
const LIVE = '[data-slot="ring-carousel-live"]';

const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
});
afterEach(() => {
  vi.useRealTimers();
});

const ITEMS: RingCarouselItem[] = [
  "Fundo Atlas",
  "Fundo Boreal",
  "Fundo Cedro",
  "Fundo Delta",
  "Fundo Estrela",
  "Fundo Faro",
].map((label, i) => ({ id: `f${i}`, label, content: <span>{label}</span> }));

function setup(props: Partial<RingCarouselProps> = {}, reduced: "never" | "always" = "always") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <RingCarousel items={ITEMS} autoplay="off" {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const cards = () =>
    Array.from(view.container.querySelectorAll('[data-slot="ring-carousel-card"]'));
  const front = () => cards().findIndex((card) => card.getAttribute("data-front") === "true");
  return { ...view, root, cards, front };
}

describe("RingCarousel", () => {
  it("renderiza um cartão por item com aria-label", () => {
    const { cards } = setup();
    expect(cards()).toHaveLength(6);
    expect(screen.getByRole("group", { name: "Fundo Atlas" })).toBeInTheDocument();
  });

  it("lança erro com menos de 3 itens", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<RingCarousel items={ITEMS.slice(0, 2)} />)).toThrow(/received 2 items/);
    spy.mockRestore();
  });

  it("expõe a marcação da spec", () => {
    const { root, container } = setup({ layout: "orbit" });
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-roledescription", "carrossel");
    expect(root).toHaveAttribute("data-layout", "orbit");
    expect(root).toHaveAttribute("data-dragging", "false");
    expect(container.querySelector('[data-slot="ring-carousel-stage"]')).toBeInTheDocument();
    expect(container.querySelector(RING)).toBeInTheDocument();
  });

  it("deixa fora da leitura os cartões que não estão na metade da frente", () => {
    const { cards } = setup();
    expect(cards()[0]).not.toHaveAttribute("aria-hidden");
    expect(cards()[3]).toHaveAttribute("aria-hidden", "true");
    expect(cards()[3]).toHaveAttribute("inert");
  });

  it("troca a frente e anuncia com as setas, chamando onChange uma vez por mudança", () => {
    const onChange = vi.fn();
    const { root, front, container } = setup({ onChange });
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(front()).toBe(1);
    expect(container.querySelector(LIVE)).toHaveTextContent("Fundo Boreal, 2 de 6");
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(front()).toBe(5);
    expect(onChange.mock.calls).toEqual([[1], [0], [5]]);
  });

  it("ignora outras teclas", () => {
    const onChange = vi.fn();
    const { root } = setup({ onChange });
    fireEvent.keyDown(root, { key: "a" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("anima até a frente quando o movimento não é reduzido", async () => {
    const { root, front } = setup({}, "never");
    fireEvent.keyDown(root, { key: "ArrowRight" });
    await vi.waitFor(() => expect(front()).toBe(1));
  });

  it("leva o cartão clicado à frente", () => {
    const { cards, front, container } = setup();
    fireEvent.click(cards()[2]);
    expect(front()).toBe(2);
    expect(container.querySelector(LIVE)).toHaveTextContent("Fundo Cedro, 3 de 6");
  });

  it("não move com focusOnClick desligado", () => {
    const { cards, front } = setup({ focusOnClick: false });
    fireEvent.click(cards()[2]);
    expect(front()).toBe(0);
  });

  it("arrastar muda a frente e liga data-dragging", () => {
    window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
    const { root, front } = setup();
    fireEvent.pointerDown(root, { clientX: 100, pointerId: 1, pointerType: "mouse" });
    fireEvent.pointerMove(root, { clientX: 400, pointerId: 1, pointerType: "mouse" });
    expect(root).toHaveAttribute("data-dragging", "true");
    fireEvent.pointerUp(root, { clientX: 400, pointerId: 1, pointerType: "mouse" });
    expect(root).toHaveAttribute("data-dragging", "false");
    expect(front()).not.toBe(0);
  });

  it("não arrasta com draggable desligado", () => {
    const { root, front } = setup({ draggable: false });
    fireEvent.pointerDown(root, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(root, { clientX: 600, pointerId: 1 });
    expect(front()).toBe(0);
  });

  it("clique sem arraste depois de soltar ainda foca o cartão", () => {
    const { root, cards, front } = setup();
    fireEvent.pointerDown(root, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(root, { clientX: 101, pointerId: 1 });
    fireEvent.pointerUp(root, { clientX: 101, pointerId: 1 });
    fireEvent.click(cards()[1]);
    expect(front()).toBe(1);
  });

  it("gira sozinho no drift", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { front } = setup({ autoplay: "drift", speed: 60 }, "never");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(front()).toBe(2);
  });

  it("gira para o outro lado com direction right", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { front } = setup({ autoplay: "drift", speed: 60, direction: "right" }, "never");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(front()).toBe(4);
  });

  it("pausa o drift com o mouse em cima", () => {
    window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { root, front } = setup({ autoplay: "drift", speed: 60 }, "never");
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(front()).toBe(0);
  });

  it("avança de cartão em cartão no modo step", async () => {
    const { front } = setup({ autoplay: "step", interval: 0.05 }, "never");
    await vi.waitFor(() => expect(front()).toBe(1), { timeout: 3000 });
  });

  it("não gira com movimento reduzido", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { front } = setup({ autoplay: "drift", speed: 60 }, "always");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(front()).toBe(0);
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
  });
});
