import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { DitherWaves } from "./dither-waves";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

type Options = Parameters<typeof webgl.useWebglCanvas>[0];

// Captura as opções do hook e deixa trocar o redraw por um espião.
function spyOnHook(redraw?: () => void) {
  const captured: { options: Options | null } = { options: null };
  const original = webgl.useWebglCanvas;
  const spy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => {
    captured.options = options;
    const result = original(options);
    return redraw ? { ...result, redraw } : result;
  });
  return { captured, spy };
}

function fakeGl() {
  const values = new Map<string, unknown>();
  const gl = {
    canvas: { width: 1000, height: 500, clientWidth: 0 },
    getUniformLocation: (_p: unknown, name: string) => name,
    uniform1f: (loc: string, v: number) => values.set(loc, v),
    uniform1i: (loc: string, v: number) => values.set(loc, v),
    uniform3fv: (loc: string, v: Float32Array) => values.set(loc, Array.from(v)),
  };
  return { gl: gl as unknown as WebGL2RenderingContext, values };
}

function run(captured: { options: Options | null }, time: number) {
  const { gl, values } = fakeGl();
  captured.options?.uniforms?.(gl, {} as WebGLProgram, time);
  return values;
}

function sizeRoot(root: HTMLElement) {
  root.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 }) as DOMRect;
}

describe("DitherWaves (sem WebGL)", () => {
  it("shows the dot fallback, hidden canvas and children", () => {
    const { container } = render(
      <DitherWaves>
        <p>Conteúdo</p>
      </DitherWaves>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "dither-waves");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="dither-waves-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="dither-waves-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style")).toContain("var(--primary)");
    expect(fallback.getAttribute("style")).toContain("radial-gradient");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "dither-waves-content"
    );
  });
  it("uses the custom token in the fallback", () => {
    const { container } = render(<DitherWaves color="--info" />);
    const fallback = container.querySelector('[data-slot="dither-waves-fallback"]') as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--info)");
  });
  it("throws for an invalid token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<DitherWaves color="primary" />)).toThrow(/"primary"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("throws for an unknown pattern", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<DitherWaves pattern={"dots" as never} />)).toThrow(/"dots"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<DitherWaves ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("DitherWaves (tema local)", () => {
  it("reads the color from the component canvas, with foreground fallback", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <DitherWaves />
        </div>
      );
      const root = container.querySelector('[data-slot="dither-waves"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
      for (const [, element] of spy.mock.calls) expect(root.contains(element ?? null)).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
  it("redraws after rereading the color on a token change", () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const { spy: hookSpy } = spyOnHook(redraw);
    try {
      const view = render(<DitherWaves speed={0} color="--primary" />);
      readSpy.mockClear();
      redraw.mockClear();
      view.rerender(<DitherWaves speed={0} color="--success" />);
      expect(readSpy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      expect(redraw.mock.invocationCallOrder[0]).toBeGreaterThan(
        Math.max(...readSpy.mock.invocationCallOrder)
      );
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
    }
  });
  it("redraws after rereading the color on an html change", async () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const { spy: hookSpy } = spyOnHook(redraw);
    try {
      const view = render(<DitherWaves speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
      expect(readSpy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
      document.documentElement.removeAttribute("data-theme");
    }
  });
});

describe("DitherWaves uniforms", () => {
  it("passes clamped props to the shader", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<DitherWaves levels={20} pixelSize={0} contrast={9} pattern="lines" speed={2} />);
      const values = run(captured, 5);
      expect(values.get("uLevels")).toBe(8);
      expect(values.get("uPixelSize")).toBe(1 * (window.devicePixelRatio || 1));
      expect(values.get("uContrast")).toBe(2);
      expect(values.get("uPattern")).toBe(2);
      expect(values.get("uSpeed")).toBe(2);
      expect(values.get("uReveal")).toBe(0);
      expect(values.get("uTrailCount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses when speed is 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<DitherWaves speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("DitherWaves pointer", () => {
  it("stores the point with the uTime clock and fades it out", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<DitherWaves />);
      const root = container.firstElementChild as HTMLElement;
      sizeRoot(root);
      run(captured, 2);
      fireEvent.pointerMove(root, { clientX: 100, clientY: 25 });
      const values = run(captured, 2.5);
      expect(values.get("uTrailCount")).toBe(1);
      expect((values.get("uTrail") as number[]).slice(0, 3)).toEqual([0.5, 0.75, 2]);
      expect(run(captured, 20).get("uTrailCount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("keeps at most 12 points", () => {
    const { captured, spy } = spyOnHook();
    const now = vi.spyOn(performance, "now");
    try {
      const { container } = render(<DitherWaves />);
      const root = container.firstElementChild as HTMLElement;
      sizeRoot(root);
      for (let i = 0; i < 20; i++) {
        now.mockReturnValue(i * 100);
        fireEvent.pointerMove(root, { clientX: i, clientY: 10 });
      }
      expect(run(captured, 0).get("uTrailCount")).toBe(12);
    } finally {
      now.mockRestore();
      spy.mockRestore();
    }
  });
  it("ignores pointer moves when pointer is off", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<DitherWaves pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      sizeRoot(root);
      fireEvent.pointerMove(root, { clientX: 10, clientY: 10 });
      expect(run(captured, 1).get("uTrailCount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("calls the user onPointerMove", () => {
    const onPointerMove = vi.fn();
    const { container } = render(<DitherWaves onPointerMove={onPointerMove} />);
    fireEvent.pointerMove(container.firstElementChild as HTMLElement);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
  });
});

describe("DitherWaves (movimento reduzido)", () => {
  it("skips the entrance blocks and the trail", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <DitherWaves />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeRoot(root);
      fireEvent.pointerMove(root, { clientX: 100, clientY: 25 });
      const values = run(captured, 0);
      expect(values.get("uReveal")).toBe(1);
      expect(values.get("uTrailCount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
});
