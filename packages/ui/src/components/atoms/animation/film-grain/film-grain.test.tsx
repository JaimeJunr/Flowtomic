import { act, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FilmGrain, type FilmGrainProps } from "./film-grain";

const ROOT = '[data-slot="film-grain"]';

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
  puts = 0;
  rects = 0;
  fillStyle = "";
  strokeStyle = "";
  lineWidth = 0;
  createImageData(width: number, height: number) {
    return { width, height, data: new Uint8ClampedArray(width * height * 4) };
  }
  putImageData() {
    this.puts += 1;
  }
  fillRect() {
    this.rects += 1;
  }
  beginPath() {}
  moveTo() {}
  quadraticCurveTo() {}
  stroke() {}
}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

let frames: FakeAnimationFrames;
let context: FakeCanvasContext;
let contextSpy: { mockRestore: () => void };
const originalObserver = window.IntersectionObserver;

beforeEach(() => {
  frames = new FakeAnimationFrames();
  frames.install();
  context = new FakeCanvasContext();
  contextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  FakeIntersectionObserver.instances = [];
  window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
});
afterEach(() => {
  frames.restore();
  contextSpy.mockRestore();
  window.IntersectionObserver = originalObserver;
});

// O jsdom mede tudo como zero; devolve 200x100 só durante a montagem.
function withSize<T>(mount: () => T): T {
  const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 200,
    bottom: 100,
    width: 200,
    height: 100,
    toJSON: () => ({}),
  });
  try {
    return mount();
  } finally {
    spy.mockRestore();
  }
}

function setup(props: FilmGrainProps = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <FilmGrain {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  return { ...view, root };
}

describe("FilmGrain", () => {
  it("é decorativo e carrega as props de mistura e opacidade", () => {
    const { root } = setup({ opacity: 0.3, blendMode: "soft-light" });
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("pointer-events-none", "absolute", "inset-0");
    expect(root.style.mixBlendMode).toBe("soft-light");
    expect(root.style.opacity).toBe("0.3");
    expect(root).toHaveAttribute("data-fixed", "false");
  });

  it("usa mix-blend-mode overlay e opacidade 0.15 por padrão", () => {
    const { root } = setup();
    expect(root.style.mixBlendMode).toBe("overlay");
    expect(root.style.opacity).toBe("0.15");
  });

  it("fixed troca para position fixed", () => {
    const { root } = setup({ fixed: true });
    expect(root).toHaveClass("fixed", "inset-0");
    expect(root).not.toHaveClass("absolute");
    expect(root).toHaveAttribute("data-fixed", "true");
  });

  it("monta o canvas pixelado", () => {
    const { root } = setup();
    const canvas = root.querySelector('[data-slot="film-grain-canvas"]') as HTMLElement;
    expect(canvas).toHaveClass("size-full");
    expect(canvas.style.imageRendering).toBe("pixelated");
  });

  it("expõe ref, className e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "grao" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root).toHaveAttribute("id", "grao");
    expect(FilmGrain.displayName).toBe("FilmGrain");
  });

  it("fps=0 desenha uma vez só", () => {
    setup({ fps: 0 });
    expect(context.puts).toBe(1);
    act(() => frames.advance(500));
    expect(context.puts).toBe(1);
  });

  it("com fps > 0 desenha de novo a cada troca", () => {
    setup({ fps: 24 });
    act(() => frames.advance(500));
    expect(context.puts).toBeGreaterThan(3);
  });

  it("pausa fora da tela e retoma ao voltar", () => {
    setup({ fps: 24 });
    act(() => frames.advance(200));
    act(() => {
      for (const io of FakeIntersectionObserver.instances) io.trigger(false);
    });
    const paused = context.puts;
    act(() => frames.advance(300));
    expect(context.puts).toBe(paused);
    act(() => {
      for (const io of FakeIntersectionObserver.instances) io.trigger(true);
    });
    act(() => frames.advance(300));
    expect(context.puts).toBeGreaterThan(paused);
  });

  it("movimento reduzido: desenha uma vez, sem tremor", () => {
    const { root } = setup({ fps: 24, flicker: 1, opacity: 0.5 }, "always");
    act(() => frames.advance(500));
    expect(context.puts).toBe(1);
    expect(root.style.opacity).toBe("0.5");
  });

  it("flicker varia a opacidade do contêiner dentro da faixa", () => {
    const { root } = setup({ fps: 24, flicker: 1, opacity: 0.5 });
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      act(() => frames.advance(48));
      seen.add(root.style.opacity);
    }
    expect(seen.size).toBeGreaterThan(1);
    for (const v of seen) {
      expect(Number(v)).toBeGreaterThanOrEqual(0.4 - 1e-9);
      expect(Number(v)).toBeLessThanOrEqual(0.6 + 1e-9);
    }
  });

  it("sem efeitos não desenha retângulos além do grão", () => {
    withSize(() => setup({ fps: 0 }));
    expect(context.rects).toBe(0);
  });

  it("scanlines desenham faixas sobre o grão", () => {
    withSize(() => setup({ fps: 0, scanlines: 1 }));
    expect(context.rects).toBeGreaterThan(0);
  });

  it("poeira desenha pontos sobre o grão (também com movimento reduzido)", () => {
    withSize(() => setup({ fps: 0, dust: 1 }, "always"));
    expect(context.rects).toBeGreaterThanOrEqual(1);
  });

  it("movimento reduzido não desenha varredura", () => {
    withSize(() => setup({ fps: 0, scanlines: 1 }, "always"));
    expect(context.rects).toBe(0);
  });
});
