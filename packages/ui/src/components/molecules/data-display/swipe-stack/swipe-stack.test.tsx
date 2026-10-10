import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SwipeStack, type SwipeStackProps } from "./swipe-stack";

const ROOT = '[data-slot="swipe-stack"]';
const CARD = '[data-slot="swipe-stack-card"]';

// O PointerEvent do setup nao carrega `pointerType`; sem ele mouse e toque nao se distinguem.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  pointerId: number;
  constructor(
    type: string,
    init: MouseEventInit & { pointerType?: string; pointerId?: number; timeStamp?: number } = {}
  ) {
    super(type, init);
    // O relogio controlado deixa a velocidade do arraste deterministica.
    if (init.timeStamp !== undefined)
      Object.defineProperty(this, "timeStamp", { value: init.timeStamp });
    this.pointerType = init.pointerType ?? "";
    this.pointerId = init.pointerId ?? 1;
  }
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
});

const LABELS = ["Depoimento Aurora", "Depoimento Boreal", "Depoimento Cerrado", "Depoimento Delta"];

function setup(props: Partial<SwipeStackProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <SwipeStack
        cards={LABELS.map((label) => <p key={label}>{label}</p>)}
        labels={LABELS}
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const cards = () => Array.from(view.container.querySelectorAll<HTMLElement>(CARD));
  const topLabel = () => cards().find((card) => card.dataset.position === "0")?.textContent;
  return { ...view, root, cards, topLabel };
}

describe("SwipeStack", () => {
  it("lanca erro com os dois tamanhos quando cards e labels divergem", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(<SwipeStack cards={[<i key="a" />, <i key="b" />]} labels={["so um"]} />)
    ).toThrow(/2.*1/);
    spy.mockRestore();
  });

  it("expoe marcacao, ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "size-64", layout: "deck" });
    expect(root.dataset.layout).toBe("deck");
    expect(root.dataset.dragging).toBe("false");
    expect(root).toHaveClass("size-64");
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-roledescription", "pilha de cartões");
  });

  it("so o cartao de cima fica acessivel", () => {
    const { cards } = setup();
    const hidden = cards().filter((card) => card.getAttribute("aria-hidden") === "true");
    expect(hidden).toHaveLength(3);
  });

  it("visible esconde posicoes extras", () => {
    const { cards } = setup({ visible: 2 });
    const opacities = cards().map((card) => card.style.opacity);
    expect(opacities.filter((value) => value === "0")).toHaveLength(2);
  });

  it("Enter manda ao fim, seta esquerda traz de volta e onChange e chamado", () => {
    const onChange = vi.fn();
    const { root, topLabel, getByText } = setup({ onChange });
    expect(topLabel()).toBe(LABELS[0]);
    fireEvent.keyDown(root, { key: "Enter" });
    expect(topLabel()).toBe(LABELS[1]);
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toBe(LABELS[1]);
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(topLabel()).toBe(LABELS[0]);
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(topLabel()).toBe(LABELS[1]);
    expect(getByText(LABELS[1], { selector: "p" })).toBeInTheDocument();
  });

  it("clique sem arraste manda ao fim so com sendToBackOnClick", () => {
    const on = setup({ sendToBackOnClick: true });
    const top = on.cards().find((card) => card.dataset.position === "0") as HTMLElement;
    fireEvent.pointerDown(top, { clientX: 10, clientY: 10, pointerType: "mouse" });
    fireEvent.pointerUp(top, { clientX: 11, clientY: 10, pointerType: "mouse" });
    expect(on.topLabel()).toBe(LABELS[1]);
    on.unmount();

    const off = setup();
    const topOff = off.cards().find((card) => card.dataset.position === "0") as HTMLElement;
    fireEvent.pointerDown(topOff, { clientX: 10, clientY: 10, pointerType: "mouse" });
    fireEvent.pointerUp(topOff, { clientX: 11, clientY: 10, pointerType: "mouse" });
    expect(off.topLabel()).toBe(LABELS[0]);
  });

  it("arraste alem do limite manda ao fim; antes do limite volta", async () => {
    const onChange = vi.fn();
    const { cards, topLabel, root } = setup({ onChange, threshold: 90 });
    const top = () => cards().find((card) => card.dataset.position === "0") as HTMLElement;

    const at = (clientX: number, timeStamp: number) => ({
      clientX,
      clientY: 100,
      pointerType: "mouse",
      timeStamp,
    });

    fireEvent.pointerDown(top(), at(100, 0));
    expect(root.dataset.dragging).toBe("true");
    fireEvent.pointerMove(top(), at(140, 2000));
    fireEvent.pointerUp(top(), at(140, 4000));
    expect(root.dataset.dragging).toBe("false");
    expect(topLabel()).toBe(LABELS[0]);

    fireEvent.pointerDown(top(), at(100, 5000));
    fireEvent.pointerMove(top(), at(260, 7000));
    fireEvent.pointerUp(top(), at(260, 9000));
    await waitFor(() => expect(topLabel()).toBe(LABELS[1]));
    // onChange sai de um efeito passivo, que sob carga roda depois do commit que o waitFor viu.
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(1));
  });
});

describe("SwipeStack com tempo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("autoplay troca o topo a cada intervalo", () => {
    const { topLabel } = setup({ autoplay: true, autoplayDelay: 1000 });
    expect(topLabel()).toBe(LABELS[0]);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(topLabel()).toBe(LABELS[1]);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(topLabel()).toBe(LABELS[2]);
  });

  it("pauseOnHover pausa com pointerenter de mouse e retoma ao sair", () => {
    const { root, topLabel } = setup({ autoplay: true, autoplayDelay: 1000, pauseOnHover: true });
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(topLabel()).toBe(LABELS[0]);
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(topLabel()).toBe(LABELS[1]);
  });
});

describe("SwipeStack com movimento reduzido", () => {
  it("troca na hora pelo teclado e o arraste nao inclina", () => {
    const { root, cards, topLabel } = setup({}, "always");
    fireEvent.keyDown(root, { key: " " });
    expect(topLabel()).toBe(LABELS[1]);
    const top = cards().find((card) => card.dataset.position === "0") as HTMLElement;
    fireEvent.pointerDown(top, { clientX: 0, clientY: 0, pointerType: "mouse" });
    fireEvent.pointerMove(top, { clientX: 50, clientY: 0, pointerType: "mouse" });
    const inner = top.firstElementChild as HTMLElement;
    expect(inner.style.transform).not.toMatch(/rotateY\((?!0)/);
    fireEvent.pointerUp(top, { clientX: 300, clientY: 0, pointerType: "mouse" });
    expect(topLabel()).toBe(LABELS[2]);
  });
});
