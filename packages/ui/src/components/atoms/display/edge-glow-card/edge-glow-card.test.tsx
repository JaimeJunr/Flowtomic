import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { EdgeGlowCard, type EdgeGlowCardProps } from "./edge-glow-card";

const ROOT = '[data-slot="edge-glow-card"]';
const RECT = { left: 100, top: 100, right: 300, bottom: 200, width: 200, height: 100 };

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: EdgeGlowCardProps = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <EdgeGlowCard {...props}>Plano Gestora</EdgeGlowCard>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  root.getBoundingClientRect = () => ({ ...RECT, x: RECT.left, y: RECT.top, toJSON: () => ({}) });
  return { ...view, root };
}

const point = (clientX: number, clientY: number) => {
  act(() => {
    window.dispatchEvent(new MouseEvent("pointermove", { clientX, clientY }));
    vi.advanceTimersByTime(20);
  });
};

describe("EdgeGlowCard", () => {
  it("expõe ref, className, data-slot e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "plano" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative", "isolate");
    expect(root).toHaveAttribute("id", "plano");
    expect(root).toHaveTextContent("Plano Gestora");
  });

  it("as camadas são decorativas e nomeadas", () => {
    const { container } = setup();
    for (const part of ["border", "glow", "body"]) {
      const layer = container.querySelector(`[data-slot="edge-glow-card-${part}"]`);
      expect(layer).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("escreve --angle e --proximity com o ponteiro na borda", () => {
    const { root } = setup();
    point(300, 150);
    expect(root.style.getPropertyValue("--proximity")).toBe("1");
    expect(parseFloat(root.style.getPropertyValue("--angle"))).toBeCloseTo(90);
  });

  it("começa a acender antes do ponteiro entrar, até glowRadius", () => {
    const { root } = setup({ glowRadius: 40 });
    point(200, 90);
    expect(parseFloat(root.style.getPropertyValue("--proximity"))).toBeCloseTo(0.75);
  });

  it("no centro e longe do cartão a proximidade é 0", () => {
    const { root } = setup();
    point(300, 150);
    point(200, 150);
    expect(root.style.getPropertyValue("--proximity")).toBe("0");
    point(900, 900);
    expect(root.style.getPropertyValue("--proximity")).toBe("0");
  });

  it("zera quando o ponteiro sai da janela", () => {
    const { root } = setup();
    point(300, 150);
    act(() => void fireEvent(document.documentElement, new Event("pointerleave")));
    expect(root.style.getPropertyValue("--proximity")).toBe("0");
  });

  it("para de ouvir o window ao desmontar", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = setup();
    unmount();
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
    remove.mockRestore();
  });

  it("animated: a volta de luz termina com --proximity 0", () => {
    const { root } = setup({ animated: true });
    expect(root.style.getPropertyValue("--proximity")).toBe("0");
  });

  it("animated com movimento reduzido não anima", () => {
    const { root } = setup({ animated: true }, "always");
    expect(root.style.getPropertyValue("--angle")).toBe("0deg");
    expect(root.style.getPropertyValue("--proximity")).toBe("0");
  });

  it("rejeita props fora de faixa com o valor recebido", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => setup({ coneSpread: 99 })).toThrow(/coneSpread: received 99/);
    quiet.mockRestore();
  });
});
