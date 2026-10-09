import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ClickSpark, type ClickSparkProps } from "./click-spark";

const ROOT = '[data-slot="click-spark"]';
const RECT = { left: 50, top: 50, right: 250, bottom: 150, width: 200, height: 100 };

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
// O rAF falso do vitest entrega timestamps que não avançam; este relógio avança de verdade.
class FakeAnimationFrames {
  private now = 1000;
  private nextId = 1;
  private queue = new Map<number, FrameRequestCallback>();
  private original = {
    raf: window.requestAnimationFrame,
    caf: window.cancelAnimationFrame,
  };

  install() {
    window.requestAnimationFrame = (cb) => {
      this.queue.set(this.nextId, cb);
      return this.nextId++;
    };
    window.cancelAnimationFrame = (id) => void this.queue.delete(id);
  }

  restore() {
    window.requestAnimationFrame = this.original.raf;
    window.cancelAnimationFrame = this.original.caf;
  }

  advance(ms: number) {
    for (let elapsed = 0; elapsed < ms; elapsed += 16) {
      this.now += 16;
      const due = [...this.queue.values()];
      this.queue.clear();
      for (const cb of due) cb(this.now);
    }
  }
}

class FakeCanvasContext {
  strokes = 0;
  strokeStyle = "";
  lineWidth = 0;
  lineCap = "";
  setTransform() {}
  clearRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {
    this.strokes += 1;
  }
}

let frames: FakeAnimationFrames;
let context: FakeCanvasContext;
let contextSpy: { mockRestore: () => void };
beforeEach(() => {
  frames = new FakeAnimationFrames();
  frames.install();
  context = new FakeCanvasContext();
  contextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
});
afterEach(() => {
  frames.restore();
  contextSpy.mockRestore();
});

function setup(props: ClickSparkProps = {}, reduced: "never" | "always" = "never") {
  const onInner = vi.fn();
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <ClickSpark {...props}>
        <button type="button" onClick={onInner}>
          Concluir etapa
        </button>
      </ClickSpark>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  root.getBoundingClientRect = () => ({ ...RECT, x: 50, y: 50, toJSON: () => ({}) });
  return { ...view, root, onInner };
}

const sparks = (root: HTMLElement) => root.getAttribute("data-sparks");

describe("ClickSpark", () => {
  it("expõe ref, className, data-slot e props nativas na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "etapa" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative");
    expect(root).toHaveAttribute("id", "etapa");
    expect(ClickSpark.displayName).toBe("ClickSpark");
  });

  it("monta canvas decorativo sem capturar ponteiro", () => {
    const { root } = setup();
    const canvas = root.querySelector('[data-slot="click-spark-canvas"]');
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("pointer-events-none", "absolute", "inset-0");
  });

  it("clique cria um estalo que some depois de duration", () => {
    const { root } = setup({ duration: 400 });
    expect(sparks(root)).toBe("0");
    fireEvent.pointerDown(root, { button: 0, clientX: 100, clientY: 80 });
    expect(sparks(root)).toBe("1");
    act(() => frames.advance(200));
    expect(sparks(root)).toBe("1");
    act(() => frames.advance(300));
    expect(sparks(root)).toBe("0");
  });

  it("desenha um traço por sparkCount a cada quadro com estalo vivo", () => {
    const { root } = setup({ sparkCount: 6 });
    fireEvent.pointerDown(root, { button: 0, clientX: 100, clientY: 80 });
    act(() => frames.advance(16));
    expect(context.strokes).toBeGreaterThanOrEqual(6);
    expect(context.strokes % 6).toBe(0);
  });

  it("para o loop quando a lista esvazia", () => {
    const { root } = setup({ duration: 100 });
    fireEvent.pointerDown(root, { button: 0, clientX: 100, clientY: 80 });
    act(() => frames.advance(300));
    const drawn = context.strokes;
    act(() => frames.advance(300));
    expect(context.strokes).toBe(drawn);
  });

  it("cliques seguidos somam estalos", () => {
    const { root } = setup();
    fireEvent.pointerDown(root, { button: 0, clientX: 100, clientY: 80 });
    act(() => frames.advance(100));
    fireEvent.pointerDown(root, { button: 0, clientX: 120, clientY: 90 });
    expect(sparks(root)).toBe("2");
  });

  it("ignora botão que não é o principal", () => {
    const { root } = setup();
    fireEvent.pointerDown(root, { button: 2, clientX: 100, clientY: 80 });
    expect(sparks(root)).toBe("0");
  });

  it("clique em filho continua chegando ao onClick do filho", () => {
    const { root, onInner, getByRole } = setup();
    fireEvent.pointerDown(getByRole("button"), { button: 0, clientX: 100, clientY: 80 });
    fireEvent.click(getByRole("button"), { detail: 1 });
    expect(onInner).toHaveBeenCalledTimes(1);
    expect(sparks(root)).toBe("1");
  });

  it("Enter/Espaço em filho (click sem ponteiro) solta estalo no centro dele", () => {
    const { root, getByRole } = setup();
    fireEvent.click(getByRole("button"), { detail: 0 });
    expect(sparks(root)).toBe("1");
  });

  it("click com ponteiro (detail > 0) não duplica o estalo", () => {
    const { root, getByRole } = setup();
    fireEvent.click(getByRole("button"), { detail: 1 });
    expect(sparks(root)).toBe("0");
  });

  it("movimento reduzido: sem canvas e sem estalo, clique segue funcionando", () => {
    const { root, onInner, getByRole } = setup({}, "always");
    expect(root.querySelector("canvas")).toBeNull();
    fireEvent.pointerDown(root, { button: 0, clientX: 100, clientY: 80 });
    fireEvent.click(getByRole("button"), { detail: 0 });
    expect(sparks(root)).toBe("0");
    expect(onInner).toHaveBeenCalledTimes(1);
  });

  it("repassa onPointerDown do consumidor", () => {
    const onPointerDown = vi.fn();
    const { root } = setup({ onPointerDown });
    fireEvent.pointerDown(root, { button: 0, clientX: 100, clientY: 80 });
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });
});
