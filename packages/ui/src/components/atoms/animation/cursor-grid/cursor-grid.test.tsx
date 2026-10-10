import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CursorGrid, type CursorGridProps } from "./cursor-grid";

const ROOT = '[data-slot="cursor-grid"]';
const RECT = { left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200 };

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

  get pending() {
    return this.queue.size;
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
  fills = 0;
  globalAlpha = 1;
  strokeStyle = "";
  fillStyle = "";
  lineWidth = 0;
  setTransform() {}
  clearRect() {}
  beginPath() {}
  rect() {}
  roundRect() {}
  stroke() {
    this.strokes += 1;
  }
  fill() {
    this.fills += 1;
  }
}

let frames: FakeAnimationFrames;
let context: FakeCanvasContext;
let spies: { mockRestore: () => void }[];
beforeEach(() => {
  frames = new FakeAnimationFrames();
  frames.install();
  context = new FakeCanvasContext();
  spies = [
    vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(context as unknown as CanvasRenderingContext2D),
    vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ ...RECT, x: 0, y: 0, toJSON: () => ({}) }),
  ];
});
afterEach(() => {
  frames.restore();
  for (const spy of spies) spy.mockRestore();
});

function setup(props: CursorGridProps = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <CursorGrid cellSize={50} radius={60} {...props}>
        <p>Painel de acesso</p>
      </CursorGrid>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  return { ...view, root };
}

const move = (root: HTMLElement, x: number, y: number, pointerType = "mouse") =>
  fireEvent.pointerMove(root, { clientX: x, clientY: y, pointerType });

describe("CursorGrid", () => {
  it("expõe ref, className, data-slot, filhos e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root, getByText } = setup({ ref, className: "minha-classe", id: "grade" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative", "overflow-hidden");
    expect(root).toHaveAttribute("id", "grade");
    expect(getByText("Painel de acesso")).toBeInTheDocument();
    expect(CursorGrid.displayName).toBe("CursorGrid");
  });

  it("monta canvas decorativo como primeiro filho, sem capturar ponteiro", () => {
    const { root } = setup();
    const canvas = root.firstElementChild;
    expect(canvas).toHaveAttribute("data-slot", "cursor-grid-canvas");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("pointer-events-none", "absolute", "inset-0");
  });

  it("pointermove do mouse desenha as células próximas", () => {
    const { root } = setup();
    expect(context.strokes).toBe(0);
    move(root, 25, 25);
    act(() => frames.advance(16));
    expect(context.strokes).toBeGreaterThan(0);
  });

  it("toque no pointermove não acende, mas pointerdown de toque acende", () => {
    const { root } = setup({ clickPulse: false });
    move(root, 25, 25, "touch");
    act(() => frames.advance(16));
    expect(context.strokes).toBe(0);
    fireEvent.pointerDown(root, { clientX: 25, clientY: 25, pointerType: "touch" });
    act(() => frames.advance(16));
    expect(context.strokes).toBeGreaterThan(0);
  });

  it("para o loop depois do rastro apagar", () => {
    const { root } = setup({ holdTime: 100, fadeDuration: 100 });
    move(root, 25, 25);
    act(() => frames.advance(48));
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    act(() => frames.advance(600));
    const drawn = context.strokes;
    expect(frames.pending).toBe(0);
    act(() => frames.advance(300));
    expect(context.strokes).toBe(drawn);
  });

  it("o rastro continua aceso logo depois de o ponteiro sair", () => {
    const { root } = setup({ holdTime: 400, fadeDuration: 800 });
    move(root, 25, 25);
    act(() => frames.advance(32));
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    const before = context.strokes;
    act(() => frames.advance(160));
    expect(context.strokes).toBeGreaterThan(before);
  });

  it("fillOpacity > 0 preenche as células acesas", () => {
    const { root } = setup({ fillOpacity: 0.2 });
    move(root, 25, 25);
    act(() => frames.advance(16));
    expect(context.fills).toBeGreaterThan(0);
  });

  it("fillOpacity 0 não preenche", () => {
    const { root } = setup();
    move(root, 25, 25);
    act(() => frames.advance(16));
    expect(context.fills).toBe(0);
  });

  it("gridOpacity > 0 mantém a grade desenhada sem ponteiro", () => {
    setup({ gridOpacity: 0.1 });
    expect(context.strokes).toBe(16);
  });

  it("clique cria um pulso que acende células longe do ponteiro e termina", () => {
    const { root } = setup({ pulseSpeed: 600, holdTime: 50, fadeDuration: 50 });
    fireEvent.pointerDown(root, { clientX: 100, clientY: 100, pointerType: "mouse" });
    act(() => frames.advance(16));
    const first = context.strokes;
    expect(first).toBeGreaterThan(0);
    act(() => frames.advance(800));
    const drawn = context.strokes;
    expect(drawn).toBeGreaterThan(first);
    act(() => frames.advance(300));
    expect(context.strokes).toBe(drawn);
    expect(frames.pending).toBe(0);
  });

  it("clickPulse={false} não cria pulso", () => {
    const { root } = setup({ clickPulse: false });
    fireEvent.pointerDown(root, { clientX: 100, clientY: 100, pointerType: "mouse" });
    act(() => frames.advance(16));
    // só o brilho do ponteiro no pointerdown; o anel acenderia células do outro lado da área
    const near = context.strokes;
    act(() => frames.advance(200));
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    act(() => frames.advance(2000));
    const settled = context.strokes;
    act(() => frames.advance(2000));
    expect(context.strokes).toBe(settled);
    expect(near).toBeLessThanOrEqual(9);
  });

  it("movimento reduzido: um desenho da grade fraca e nenhum loop", () => {
    const { root } = setup({}, "always");
    expect(context.strokes).toBe(16);
    move(root, 25, 25);
    fireEvent.pointerDown(root, { clientX: 25, clientY: 25, pointerType: "mouse" });
    act(() => frames.advance(500));
    expect(context.strokes).toBe(16);
    expect(frames.pending).toBe(0);
  });

  it("repassa os handlers de ponteiro do consumidor", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const onPointerDown = vi.fn();
    const { root } = setup({ onPointerMove, onPointerLeave, onPointerDown });
    move(root, 10, 10);
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    fireEvent.pointerDown(root, { clientX: 10, clientY: 10, pointerType: "mouse" });
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it("sem contexto 2d nada é desenhado e os filhos seguem normais", () => {
    spies[0].mockRestore();
    spies[0] = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { root, getByText } = setup();
    move(root, 25, 25);
    act(() => frames.advance(100));
    expect(context.strokes).toBe(0);
    expect(getByText("Painel de acesso")).toBeInTheDocument();
  });
});
