import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Magnetic, type MagneticProps } from "./magnetic";

const ROOT = '[data-slot="magnetic"]';
const INNER = '[data-slot="magnetic-inner"]';

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

function setup(props: Partial<MagneticProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <Magnetic {...props}>
        <button type="button">Criar carteira</button>
      </Magnetic>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  root.getBoundingClientRect = () =>
    ({
      left: 100,
      top: 100,
      right: 200,
      bottom: 140,
      width: 100,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    }) as DOMRect;
  return { ...view, root };
}

function move(x: number, y: number, pointerType = "mouse") {
  act(() => {
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType }));
  });
}

describe("Magnetic", () => {
  it("ativa com o mouse perto", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-active", "false");
    move(220, 120);
    expect(root).toHaveAttribute("data-active", "true");
  });

  // No browser o segundo evento chega antes do render que liga o ímã; trocar o config do
  // useSpring nesse render prendia o deslocamento no alvo do primeiro evento.
  it("segue o último evento mesmo quando dois chegam antes do render", async () => {
    const { container } = setup();
    act(() => {
      for (const clientX of [160, 260]) {
        window.dispatchEvent(
          new PointerEvent("pointermove", { clientX, clientY: 120, pointerType: "mouse" })
        );
      }
    });
    const inner = container.querySelector(INNER) as HTMLElement;
    await waitFor(() => expect(inner.style.transform).toContain("translateX(24px)"));
  });

  it("desativa quando o mouse se afasta além do padding", () => {
    const { root } = setup({ padding: 40 });
    move(220, 120);
    expect(root).toHaveAttribute("data-active", "true");
    move(500, 500);
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("aceita caneta", () => {
    const { root } = setup();
    move(220, 120, "pen");
    expect(root).toHaveAttribute("data-active", "true");
  });

  it("toque não ativa", () => {
    const { root } = setup();
    move(150, 120, "touch");
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("disabled não ativa", () => {
    const { root } = setup({ disabled: true });
    move(150, 120);
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("movimento reduzido não ativa", () => {
    const { root } = setup({}, "always");
    move(150, 120);
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("remove o listener ao desmontar", () => {
    const { root, unmount } = setup();
    unmount();
    expect(() => move(150, 120)).not.toThrow();
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("repassa ref, className e innerClassName", () => {
    const ref = createRef<HTMLDivElement>();
    const { root, container } = setup({ ref, className: "raiz-x", innerClassName: "interno-x" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("raiz-x", "inline-block");
    expect(container.querySelector(INNER)).toHaveClass("interno-x");
  });

  it("mantém o filho dentro do elemento interno", () => {
    const { container } = setup();
    expect(container.querySelector(`${INNER} button`)).toBeInTheDocument();
  });

  it("repassa props nativas à raiz", () => {
    const { root } = setup({ id: "ima" });
    fireEvent.pointerMove(root);
    expect(root).toHaveAttribute("id", "ima");
  });
});
