import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PeelSticker, type PeelStickerProps } from "./peel-sticker";

const ROOT = '[data-slot="peel-sticker"]';
const STICKER = '[data-slot="peel-sticker-body"]';

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

function rect(left: number, top: number, width: number, height: number) {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function setup(props: Partial<PeelStickerProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <PeelSticker label="Selo primeiro aporte" {...props}>
        <span>Selo</span>
      </PeelSticker>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const sticker = view.container.querySelector(STICKER) as HTMLDivElement;
  root.getBoundingClientRect = () => rect(0, 0, 400, 300);
  sticker.getBoundingClientRect = () => rect(100, 70, 160, 160);
  return { ...view, root, sticker };
}

const peel = (el: Element) => Number(el.getAttribute("data-peel"));

describe("PeelSticker", () => {
  it("marca raiz, partes e acessibilidade", () => {
    const { root, sticker, container } = setup();
    expect(root).toHaveAttribute("data-slot", "peel-sticker");
    expect(sticker).toHaveAttribute("role", "img");
    expect(sticker).toHaveAttribute("aria-label", "Selo primeiro aporte");
    expect(sticker).toHaveAttribute("aria-roledescription", "adesivo arrastável");
    expect(sticker).toHaveAttribute("tabindex", "0");
    expect(container.querySelector('[data-slot="peel-sticker-face"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="peel-sticker-back"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(container.querySelector('[data-slot="peel-sticker-shadow"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("começa em repouso", () => {
    const { sticker } = setup();
    expect(sticker).toHaveAttribute("data-state", "rest");
    expect(peel(sticker)).toBe(0);
  });

  it("descola no hover do mouse e volta ao sair", () => {
    const { sticker } = setup({ peelHover: 0.3 });
    fireEvent.pointerEnter(sticker, { pointerType: "mouse" });
    expect(sticker).toHaveAttribute("data-state", "hover");
    expect(peel(sticker)).toBeCloseTo(0.3);
    fireEvent.pointerLeave(sticker, { pointerType: "mouse" });
    expect(sticker).toHaveAttribute("data-state", "rest");
  });

  it("toque não aplica hover", () => {
    const { sticker } = setup();
    fireEvent.pointerEnter(sticker, { pointerType: "touch" });
    expect(sticker).toHaveAttribute("data-state", "rest");
  });

  it("descola mais ao pressionar e solta ao levantar", () => {
    const { sticker } = setup({ peelActive: 0.45 });
    fireEvent.pointerEnter(sticker, { pointerType: "mouse" });
    fireEvent.pointerDown(sticker, { pointerType: "mouse" });
    expect(sticker).toHaveAttribute("data-state", "pressed");
    expect(peel(sticker)).toBeCloseTo(0.45);
    fireEvent.pointerUp(sticker, { pointerType: "mouse" });
    expect(sticker).toHaveAttribute("data-state", "hover");
  });

  it("foco descola com peelHover", () => {
    const { sticker } = setup({ peelHover: 0.25 });
    fireEvent.focus(sticker);
    expect(sticker).toHaveAttribute("data-state", "hover");
    expect(peel(sticker)).toBeCloseTo(0.25);
    fireEvent.blur(sticker);
    expect(sticker).toHaveAttribute("data-state", "rest");
  });

  it("setas movem 16 px e Shift move 64 px", async () => {
    const { sticker } = setup();
    fireEvent.keyDown(sticker, { key: "ArrowRight" });
    await waitFor(() => expect(sticker.style.transform).toContain("translateX(16px)"));
    fireEvent.keyDown(sticker, { key: "ArrowRight", shiftKey: true });
    await waitFor(() => expect(sticker.style.transform).toContain("translateX(80px)"));
  });

  it("respeita o limite da raiz", async () => {
    const { sticker, root } = setup();
    // Raiz de 270 px de largura: sobram só 10 px à direita do adesivo (100..260).
    root.getBoundingClientRect = () => rect(0, 0, 270, 300);
    fireEvent.keyDown(sticker, { key: "ArrowRight" });
    await waitFor(() => expect(sticker.style.transform).toContain("translateX(10px)"));
  });

  it("movimento reduzido mantém a fração em 0", () => {
    const { sticker } = setup({}, "always");
    fireEvent.pointerEnter(sticker, { pointerType: "mouse" });
    fireEvent.pointerDown(sticker, { pointerType: "mouse" });
    expect(peel(sticker)).toBe(0);
  });

  it("draggable false não anuncia nem move por teclado", () => {
    const { sticker } = setup({ draggable: false });
    expect(sticker).not.toHaveAttribute("aria-roledescription");
    act(() => {
      fireEvent.keyDown(sticker, { key: "ArrowRight" });
    });
    expect(sticker.style.transform ?? "").not.toContain("translateX(16px)");
  });

  it("repassa className à raiz", () => {
    const { root } = setup({ className: "custom" });
    expect(root).toHaveClass("custom", "overflow-hidden");
  });
});
