import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PixelCard, type PixelCardProps } from "./pixel-card";

const ROOT = '[data-slot="pixel-card"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

// O rAF falso do vitest entrega timestamps que não avançam; este relógio avança de verdade.
class FakeAnimationFrames {
  private now = 1000;
  private nextId = 1;
  private queue = new Map<number, FrameRequestCallback>();
  private original = { raf: window.requestAnimationFrame, caf: window.cancelAnimationFrame };

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
  rects = 0;
  clears = 0;
  styles = new Set<string>();
  private style = "";
  get fillStyle() {
    return this.style;
  }
  set fillStyle(value: string) {
    this.style = value;
    this.styles.add(value);
  }
  setTransform() {}
  clearRect() {
    this.clears += 1;
  }
  fillRect() {
    this.rects += 1;
  }
}

let frames: FakeAnimationFrames;
let context: FakeCanvasContext;
let contextSpy: { mockRestore: () => void };

beforeEach(() => {
  window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
  frames = new FakeAnimationFrames();
  frames.install();
  context = new FakeCanvasContext();
  contextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
});
afterEach(() => {
  window.PointerEvent = OriginalPointerEvent;
  frames.restore();
  contextSpy.mockRestore();
});

// O jsdom mede tudo como zero; devolve 100x50 (200 pixels com gap 5) só durante a montagem.
function withSize<T>(mount: () => T): T {
  const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 50,
    width: 100,
    height: 50,
    toJSON: () => ({}),
  });
  try {
    return mount();
  } finally {
    spy.mockRestore();
  }
}

function setup(props: PixelCardProps = {}, reduced: "never" | "always" = "never") {
  const view = withSize(() =>
    render(
      <MotionConfig reducedMotion={reduced}>
        <PixelCard {...props}>
          <span>Plano Gestora</span>
        </PixelCard>
      </MotionConfig>
    )
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  return { ...view, root };
}

const enter = (root: HTMLElement, pointerType = "mouse") =>
  act(() => void fireEvent.pointerEnter(root, { pointerType }));
const leave = (root: HTMLElement, pointerType = "mouse") =>
  act(() => void fireEvent.pointerLeave(root, { pointerType }));

describe("PixelCard", () => {
  it("monta a estrutura decorativa com marcação", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-variant", "default");
    expect(root).toHaveAttribute("data-active", "false");
    expect(root).toHaveClass("relative", "isolate", "overflow-hidden", "rounded-3xl", "border");
    const canvas = root.querySelector('[data-slot="pixel-card-canvas"]') as HTMLElement;
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("absolute", "inset-0", "size-full");
    expect(root.querySelector("span")?.parentElement).toHaveClass("relative", "z-10");
  });

  it("variante muda a borda e o data-variant", () => {
    const { root } = setup({ variant: "primary" });
    expect(root).toHaveAttribute("data-variant", "primary");
    expect(root).toHaveClass("border-primary/40");
  });

  it("variante accent usa a borda accent", () => {
    const { root } = setup({ variant: "accent" });
    expect(root).toHaveClass("border-accent/40");
  });

  it("expõe ref, className e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "plano" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root).toHaveAttribute("id", "plano");
    expect(PixelCard.displayName).toBe("PixelCard");
  });

  it("pointerenter de mouse ativa e desenha pixels", () => {
    const { root } = setup();
    enter(root);
    expect(root).toHaveAttribute("data-active", "true");
    act(() => frames.advance(600));
    expect(context.rects).toBeGreaterThan(0);
  });

  it("desenha com a cor do token da variante", () => {
    const { root } = setup({ style: { "--muted-foreground": "oklch(0.7 0 0)" } as never });
    enter(root);
    act(() => frames.advance(600));
    expect(context.styles.has("oklch(0.7 0 0)")).toBe(true);
  });

  it("pointerleave volta a data-active=false quando todos os pixels somem", () => {
    const { root } = setup();
    enter(root);
    act(() => frames.advance(600));
    leave(root);
    expect(root).toHaveAttribute("data-active", "true");
    act(() => frames.advance(1500));
    expect(root).toHaveAttribute("data-active", "false");
    const rects = context.rects;
    act(() => frames.advance(300));
    expect(context.rects).toBe(rects);
  });

  it("toque não ativa o hover", () => {
    const { root } = setup();
    enter(root, "touch");
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("foco ativa e blur desativa", () => {
    const { root } = setup({ tabIndex: 0 });
    act(() => void fireEvent.focus(root));
    expect(root).toHaveAttribute("data-active", "true");
    act(() => void fireEvent.blur(root));
    act(() => frames.advance(1500));
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("noFocus ignora o foco", () => {
    const { root } = setup({ tabIndex: 0, noFocus: true });
    act(() => void fireEvent.focus(root));
    expect(root).toHaveAttribute("data-active", "false");
  });

  it("movimento reduzido: desenha tudo de uma vez e some de uma vez", () => {
    const { root } = setup({}, "always");
    enter(root);
    expect(root).toHaveAttribute("data-active", "true");
    expect(context.rects).toBe(200);
    act(() => frames.advance(300));
    expect(context.rects).toBe(200);
    leave(root);
    expect(root).toHaveAttribute("data-active", "false");
    expect(context.clears).toBeGreaterThan(1);
  });

  it("chama os handlers do consumidor", () => {
    const onPointerEnter = vi.fn();
    const { root } = setup({ onPointerEnter });
    enter(root);
    expect(onPointerEnter).toHaveBeenCalledTimes(1);
  });
});
