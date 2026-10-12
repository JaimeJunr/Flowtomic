import { act, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { CornerRays } from "./corner-rays";
import { CORNER_RAYS_FRAGMENT_SHADER } from "./corner-rays-shader";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
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
    uniform2f: (loc: string, ...v: number[]) => values.set(loc, v),
    uniform3fv: (loc: string, v: Float32Array) => values.set(loc, Array.from(v)),
  } as unknown as WebGL2RenderingContext;
  captured.options?.uniforms?.(gl, {} as WebGLProgram, time);
  return values;
}

describe("CornerRays shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(CORNER_RAYS_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[2]",
      "uOrigin",
      "uCorner",
      "uIntensity",
      "uSpread",
      "uTilt",
      "uBlend",
      "uFalloff",
      "uSpeed",
    ]) {
      expect(CORNER_RAYS_FRAGMENT_SHADER).toContain(name);
    }
    expect(CORNER_RAYS_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(CORNER_RAYS_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("CornerRays (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <CornerRays>
        <p>Conteúdo</p>
      </CornerRays>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "corner-rays");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="corner-rays-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="corner-rays-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--warning)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "corner-rays-content"
    );
  });
  it("uses the first token and the chosen corner in the fallback", () => {
    const { container } = render(<CornerRays colors={["--success", "--info"]} origin="top-left" />);
    const style = container
      .querySelector('[data-slot="corner-rays-fallback"]')
      ?.getAttribute("style");
    expect(style).toContain("var(--success)");
    expect(style).toContain("at top left");
  });
  it("throws for an invalid token, token count or origin", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<CornerRays colors={["primary", "--info"]} />)).toThrow(/"primary"/);
      expect(() =>
        render(<CornerRays colors={["--a", "--b", "--c"] as unknown as [string, string]} />)
      ).toThrow(/2 tokens/);
      expect(() => render(<CornerRays origin={"middle" as "top-left"} />)).toThrow(/"middle"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<CornerRays ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
});

describe("CornerRays uniforms", () => {
  it("passes the defaults and the corner points", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<CornerRays />);
      const values = run(captured, 1);
      expect(values.get("uOrigin")).toEqual([1.1, 1.1]);
      expect(values.get("uCorner")).toEqual([1, 1]);
      expect(values.get("uIntensity")).toBe(1.5);
      expect(values.get("uSpread")).toBe(1.5);
      expect(values.get("uTilt")).toBe(0);
      expect(values.get("uBlend")).toBe(0.5);
      expect(values.get("uFalloff")).toBe(1.6);
      expect(values.get("uSpeed")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
  it("clamps the props and follows the origin", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(
        <CornerRays
          origin="bottom-left"
          intensity={9}
          spread={0}
          tilt={200}
          blend={3}
          falloff={0}
        />
      );
      const values = run(captured, 1);
      expect(values.get("uOrigin")).toEqual([-0.1, -0.1]);
      expect(values.get("uCorner")).toEqual([0, 0]);
      expect(values.get("uIntensity")).toBe(4);
      expect(values.get("uSpread")).toBe(0.2);
      expect(values.get("uTilt")).toBe(90);
      expect(values.get("uBlend")).toBe(1);
      expect(values.get("uFalloff")).toBe(0.3);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses the renderer with speed 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<CornerRays speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("CornerRays (tema local)", () => {
  it("reads every color from the component canvas, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <CornerRays />
        </div>
      );
      const root = container.querySelector('[data-slot="corner-rays"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--warning", expect.any(HTMLElement));
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
      const view = render(<CornerRays speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
      expect(readSpy).toHaveBeenCalledWith("--warning", expect.any(HTMLElement));
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
