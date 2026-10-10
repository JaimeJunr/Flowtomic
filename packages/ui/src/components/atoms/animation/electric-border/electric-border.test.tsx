import { act, render } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ElectricBorder, type ElectricBorderProps } from "./electric-border";

class FakeCanvasContext {
  clears = 0;
  closes = 0;
  strokes = 0;
  moves = 0;
  strokeStyles: unknown[] = [];
  lineWidth = 0;
  shadowBlur = 0;
  shadowColor = "";
  globalAlpha = 1;
  strokeStyle: unknown = "";
  clearRect() {
    this.clears++;
  }
  beginPath() {}
  moveTo() {
    this.moves++;
  }
  lineTo() {}
  closePath() {
    this.closes++;
  }
  stroke() {
    this.strokes++;
    this.strokeStyles.push(this.strokeStyle);
  }
  save() {}
  restore() {}
  setTransform() {}
}

let fake: FakeCanvasContext;
let contextToReturn: FakeCanvasContext | null;
let getContext: { mockRestore: () => void };
let offsetWidth: { mockRestore: () => void };
let offsetHeight: { mockRestore: () => void };

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  fake = new FakeCanvasContext();
  contextToReturn = fake;
  getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation((() => contextToReturn) as never);
  offsetWidth = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
  offsetHeight = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(100);
});
afterEach(() => {
  getContext.mockRestore();
  offsetWidth.mockRestore();
  offsetHeight.mockRestore();
  vi.useRealTimers();
});

function setup(props: Partial<ElectricBorderProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <ElectricBorder {...props}>
        <span>Alerta de risco</span>
      </ElectricBorder>
    </MotionConfig>
  );
  const root = view.container.querySelector('[data-slot="electric-border"]') as HTMLElement;
  return { ...view, root };
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("ElectricBorder", () => {
  it("expõe ref, className, filhos e o canvas decorativo", () => {
    const ref = createRef<HTMLDivElement>();
    const { root, container, getByText } = setup({ ref, className: "minha-classe", id: "alerta" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative");
    expect(root).toHaveAttribute("id", "alerta");
    expect(getByText("Alerta de risco")).toBeInTheDocument();
    const canvas = container.querySelector('[data-slot="electric-border-canvas"]');
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("pointer-events-none", "absolute");
  });

  it("aplica o raio aos cantos da raiz", () => {
    const { root } = setup({ radius: 24 });
    expect(root.style.borderRadius).toBe("24px");
  });

  it("sem contexto de canvas, cai para uma borda com a cor recebida e não desenha", () => {
    contextToReturn = null;
    const { root } = setup({ color: "var(--destructive)", thickness: 3 });
    advance(100);
    expect(root).toHaveAttribute("data-fallback", "true");
    expect(root.style.borderColor).toBe("var(--destructive)");
    expect(root.style.borderWidth).toBe("3px");
  });

  it("com contexto, não usa o fallback de borda", () => {
    const { root } = setup();
    expect(root).not.toHaveAttribute("data-fallback");
    expect(root.style.borderWidth).toBe("");
  });

  it("desenha um caminho fechado por quadro, com traço e brilho", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-animated", "true");
    const before = fake.clears;
    advance(100);
    const frames = fake.clears - before;
    expect(frames).toBeGreaterThan(2);
    expect(fake.closes).toBeGreaterThanOrEqual(frames);
    expect(fake.strokes).toBeGreaterThanOrEqual(frames * 2);
    expect(fake.moves).toBeGreaterThan(0);
  });

  it("movimento reduzido: data-animated=false e um único quadro", () => {
    const { root } = setup({}, "always");
    expect(root).toHaveAttribute("data-animated", "false");
    const drawn = fake.clears;
    expect(drawn).toBeGreaterThanOrEqual(1);
    advance(200);
    expect(fake.clears).toBe(drawn);
  });
});
