import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TiltedCard, type TiltedCardProps } from "./tilted-card";

const ROOT = '[data-slot="tilted-card"]';
const INNER = '[data-slot="tilted-card-inner"]';
const OVERLAY = '[data-slot="tilted-card-overlay"]';
const CAPTION = '[data-slot="tilted-card-caption"]';

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
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
  window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
});

function setup(props: Partial<TiltedCardProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <TiltedCard media={<div>Cartão Visa final 4821</div>} caption="Cartão Visa" {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  root.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,
      width: 200,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  return { ...view, root };
}

function enter(root: Element, pointerType = "mouse") {
  fireEvent.pointerEnter(root, { pointerType });
}

describe("TiltedCard", () => {
  it("renderiza figure e figcaption sr-only com a legenda", () => {
    const { root, container } = setup();
    expect(root.tagName).toBe("FIGURE");
    const figcaption = container.querySelector("figcaption");
    expect(figcaption?.textContent).toBe("Cartão Visa");
    expect(figcaption?.className).toContain("sr-only");
  });

  it("não cria figcaption sem legenda", () => {
    const { container } = setup({ caption: undefined });
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("pointerenter de mouse marca hovered e pointerleave desmarca", () => {
    const { root } = setup();
    expect(root.getAttribute("data-hovered")).toBe("false");
    enter(root);
    expect(root.getAttribute("data-hovered")).toBe("true");
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    expect(root.getAttribute("data-hovered")).toBe("false");
  });

  it("toque não ativa", () => {
    const { root, container } = setup();
    enter(root, "touch");
    fireEvent.pointerMove(root, { clientX: 150, clientY: 20, pointerType: "touch" });
    expect(root.getAttribute("data-hovered")).toBe("false");
    expect(container.querySelector(CAPTION)?.getAttribute("data-visible") ?? "false").toBe("false");
  });

  it("legenda visual fica visível só no hover e é aria-hidden", () => {
    const { root, container } = setup();
    const caption = container.querySelector(CAPTION) as HTMLElement;
    expect(caption.getAttribute("aria-hidden")).toBe("true");
    expect(caption.getAttribute("data-visible")).toBe("false");
    enter(root);
    expect(caption.getAttribute("data-visible")).toBe("true");
  });

  it("showTooltip={false} não renderiza o rótulo visual", () => {
    const { container } = setup({ showTooltip: false });
    expect(container.querySelector(CAPTION)).toBeNull();
    expect(container.querySelector("figcaption")).not.toBeNull();
  });

  it("move o ponteiro sem erro e atualiza a legenda", () => {
    const { root } = setup();
    enter(root);
    act(() => {
      fireEvent.pointerMove(root, { clientX: 190, clientY: 10, pointerType: "mouse" });
    });
    expect(root.getAttribute("data-hovered")).toBe("true");
  });

  it("renderiza overlay na camada própria", () => {
    const { container } = setup({ overlay: <span>Limite disponível</span> });
    const overlay = container.querySelector(OVERLAY) as HTMLElement;
    expect(overlay.textContent).toBe("Limite disponível");
    expect(overlay.className).toContain("translateZ(30px)");
    expect(container.querySelector(INNER)?.contains(overlay)).toBe(true);
  });

  it("sem overlay não cria a camada", () => {
    const { container } = setup();
    expect(container.querySelector(OVERLAY)).toBeNull();
  });

  it("movimento reduzido não ativa nem mostra legenda que segue", () => {
    const { root, container } = setup({}, "always");
    enter(root);
    expect(root.getAttribute("data-hovered")).toBe("false");
    expect(container.querySelector(CAPTION)).toBeNull();
  });

  it("repassa ref, className e handlers do consumidor", () => {
    const ref = createRef<HTMLElement>();
    let entered = 0;
    const { root } = setup({ ref, className: "w-64", onPointerEnter: () => entered++ });
    expect(ref.current).toBe(root);
    expect(root.className).toContain("w-64");
    enter(root);
    expect(entered).toBe(1);
  });
});
