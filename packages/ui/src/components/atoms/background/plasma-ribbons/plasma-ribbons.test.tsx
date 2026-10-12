import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { PlasmaRibbons } from "./plasma-ribbons";
import { PLASMA_RIBBONS_FRAGMENT_SHADER } from "./plasma-ribbons-shader";

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

type Options = Parameters<typeof webgl.useWebglCanvas>[0];

function spyOnHook() {
  const captured: { options: Options | null } = { options: null };
  const original = webgl.useWebglCanvas;
  const spy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => {
    captured.options = options;
    return original(options);
  });
  return { captured, spy };
}

// Gl falso que só guarda o último valor de cada uniform.
function run(captured: { options: Options | null }, time: number) {
  const values = new Map<string, unknown>();
  const gl = {
    canvas: { width: 1000, height: 500 },
    getUniformLocation: (_p: unknown, name: string) => name,
    uniform1f: (loc: string, v: number) => values.set(loc, v),
    uniform1i: (loc: string, v: number) => values.set(loc, v),
    uniform2f: (loc: string, ...v: number[]) => values.set(loc, v),
    uniform3fv: (loc: string, v: Float32Array) => values.set(loc, Array.from(v)),
  } as unknown as WebGL2RenderingContext;
  captured.options?.uniforms?.(gl, {} as WebGLProgram, time);
  return values;
}

function sizeBox(root: HTMLElement) {
  vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

describe("PlasmaRibbons shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(PLASMA_RIBBONS_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[2]",
      "uSpeed",
      "uReverse",
      "uBend",
      "uThickness",
      "uRotation",
      "uGlow",
      "uCore",
      "uGrain",
      "uPointer",
      "uPointerAmount",
      "uReveal",
    ]) {
      expect(PLASMA_RIBBONS_FRAGMENT_SHADER).toContain(name);
    }
    expect(PLASMA_RIBBONS_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(PLASMA_RIBBONS_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("PlasmaRibbons (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <PlasmaRibbons>
        <p>Conteúdo</p>
      </PlasmaRibbons>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "plasma-ribbons");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="plasma-ribbons-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="plasma-ribbons-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    const style = fallback.getAttribute("style") ?? "";
    expect(style).toContain("var(--primary)");
    expect(style).toContain("var(--info)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "plasma-ribbons-content"
    );
  });
  it("uses both tokens in the fallback", () => {
    const { container } = render(<PlasmaRibbons colors={["--success", "--warning"]} />);
    const style = container
      .querySelector('[data-slot="plasma-ribbons-fallback"]')
      ?.getAttribute("style");
    expect(style).toContain("var(--success)");
    expect(style).toContain("var(--warning)");
  });
  it("throws for an invalid token or the wrong token count", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<PlasmaRibbons colors={["primary", "--info"]} />)).toThrow(/"primary"/);
      expect(() =>
        render(<PlasmaRibbons colors={["--a", "--b", "--c"] as unknown as [string, string]} />)
      ).toThrow(/2 tokens/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<PlasmaRibbons ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const { container } = render(
      <PlasmaRibbons onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} />
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 10 });
    fireEvent.pointerLeave(root);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
  });
});

describe("PlasmaRibbons uniforms", () => {
  it("passes the defaults", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<PlasmaRibbons />);
      const values = run(captured, 1);
      expect(values.get("uSpeed")).toBe(1);
      expect(values.get("uReverse")).toBe(0);
      expect(values.get("uBend")).toEqual([1, 0.5]);
      expect(values.get("uThickness")).toBe(0.3);
      expect(values.get("uRotation")).toBe(0);
      expect(values.get("uGlow")).toBe(1);
      expect(values.get("uCore")).toBe(0.6);
      expect(values.get("uGrain")).toBe(0.03);
      expect(values.get("uPointerAmount")).toBe(0);
      expect(values.get("uReveal")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("clamps the props and converts rotation to radians", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(
        <PlasmaRibbons
          bend={[-1, 9]}
          thickness={0}
          glow={9}
          core={-2}
          grain={5}
          rotation={90}
          reverse
        />
      );
      const values = run(captured, 1);
      expect(values.get("uBend")).toEqual([0, 2]);
      expect(values.get("uThickness")).toBe(0.05);
      expect(values.get("uGlow")).toBe(2);
      expect(values.get("uCore")).toBe(0);
      expect(values.get("uGrain")).toBe(1);
      expect(values.get("uRotation")).toBeCloseTo(Math.PI / 2);
      expect(values.get("uReverse")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses the renderer with speed 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<PlasmaRibbons speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("PlasmaRibbons ponteiro", () => {
  it("follows the mouse smoothly, swells near it and ignores touch", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<PlasmaRibbons />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "touch" });
      expect(run(captured, 1).get("uPointerAmount")).toBe(0);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const first = (run(captured, 1).get("uPointer") as number[])[0];
      expect(first).toBeGreaterThan(0.5);
      expect(first).toBeLessThan(1);
      let values = run(captured, 1);
      for (let i = 0; i < 80; i++) values = run(captured, 1);
      expect((values.get("uPointer") as number[])[0]).toBe(1);
      expect(values.get("uPointerAmount")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
  it("fades the swell out when the pointer leaves", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<PlasmaRibbons />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 100, clientY: 50, pointerType: "mouse" });
      fireEvent.pointerLeave(root);
      let amount = 1;
      for (let i = 0; i < 80; i++) amount = run(captured, 1).get("uPointerAmount") as number;
      expect(amount).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("ignores the mouse with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<PlasmaRibbons pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 100, clientY: 50, pointerType: "mouse" });
      for (let i = 0; i < 20; i++) run(captured, 1);
      expect(run(captured, 1).get("uPointerAmount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("skips the entry and the pointer under reduced motion", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <PlasmaRibbons />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 100, clientY: 50, pointerType: "mouse" });
      const values = run(captured, 2);
      expect(values.get("uPointerAmount")).toBe(0);
      expect(values.get("uReveal")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("PlasmaRibbons (tema local)", () => {
  it("passes a component element for every color, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <PlasmaRibbons />
        </div>
      );
      const root = container.querySelector('[data-slot="plasma-ribbons"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--info", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
      for (const [, element] of spy.mock.calls) expect(root.contains(element ?? null)).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
  it("redraws after rereading colors when the theme changes", async () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const originalHook = webgl.useWebglCanvas;
    const hookSpy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => ({
      ...originalHook(options),
      redraw,
    }));
    try {
      const view = render(<PlasmaRibbons speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
      expect(readSpy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(redraw).toHaveBeenCalledTimes(1);
      expect(redraw.mock.invocationCallOrder[0]).toBeGreaterThan(
        Math.max(...readSpy.mock.invocationCallOrder)
      );
      view.unmount();
    } finally {
      hookSpy.mockRestore();
      readSpy.mockRestore();
      document.documentElement.removeAttribute("data-theme");
    }
  });
});
