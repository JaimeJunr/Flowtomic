import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { RadarSweep } from "./radar-sweep";
import { RADAR_SWEEP_FRAGMENT_SHADER } from "./radar-sweep-shader";

// O PointerEvent do setup nao carrega `pointerType`; sem ele mouse e toque nao se distinguem.
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

// Gl falso que so guarda o ultimo valor de cada uniform.
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

describe("RadarSweep shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(RADAR_SWEEP_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uMode",
      "uSpeed",
      "uTrail",
      "uScale",
      "uRings",
      "uSpokes",
      "uTargets",
      "uClutter",
      "uPointer",
      "uPointerForce",
      "uStatic",
      "fwidth",
    ]) {
      expect(RADAR_SWEEP_FRAGMENT_SHADER).toContain(name);
    }
    expect(RADAR_SWEEP_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(RADAR_SWEEP_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("RadarSweep (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <RadarSweep>
        <p>Conteúdo</p>
      </RadarSweep>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "radar-sweep");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="radar-sweep-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="radar-sweep-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--success)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "radar-sweep-content"
    );
  });
  it("uses the color token in the fallback", () => {
    const { container } = render(<RadarSweep color="--info" />);
    const fallback = container.querySelector('[data-slot="radar-sweep-fallback"]');
    expect(fallback?.getAttribute("style")).toContain("var(--info)");
  });
  it("throws for an invalid token or mode with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<RadarSweep color="success" />)).toThrow(/"success"/);
      expect(() => render(<RadarSweep mode={"radar" as "sweep"} />)).toThrow(/"radar"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<RadarSweep ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const { container } = render(
      <RadarSweep onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} />
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 10 });
    fireEvent.pointerLeave(root);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
  });
});

describe("RadarSweep uniforms", () => {
  it("passes the defaults", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<RadarSweep />);
      const values = run(captured, 1);
      expect(values.get("uMode")).toBe(0);
      expect(values.get("uSpeed")).toBe(1);
      expect(values.get("uTrail")).toBe(0.35);
      expect(values.get("uScale")).toBe(0.9);
      expect(values.get("uRings")).toBe(6);
      expect(values.get("uSpokes")).toBe(12);
      expect(values.get("uTargets")).toBe(6);
      expect(values.get("uClutter")).toBe(0.35);
      expect(values.get("uPointer")).toEqual([0.5, 0.5]);
      expect(values.get("uPointerForce")).toBe(0);
      expect(values.get("uStatic")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("clamps out-of-range props and selects pulse mode", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(
        <RadarSweep
          mode="pulse"
          trail={5}
          scale={0}
          rings={99}
          spokes={-4}
          targets={80}
          clutter={-1}
        />
      );
      const values = run(captured, 1);
      expect(values.get("uMode")).toBe(1);
      expect(values.get("uTrail")).toBe(1);
      expect(values.get("uScale")).toBe(0.2);
      expect(values.get("uRings")).toBe(12);
      expect(values.get("uSpokes")).toBe(0);
      expect(values.get("uTargets")).toBe(16);
      expect(values.get("uClutter")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("passes negative speed through and pauses the renderer at 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      const view = render(<RadarSweep speed={-2} />);
      expect(run(captured, 1).get("uSpeed")).toBe(-2);
      expect(captured.options?.paused).toBe(false);
      view.unmount();
      render(<RadarSweep speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("RadarSweep ponteiro", () => {
  it("follows mouse and pen smoothly and ignores touch", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<RadarSweep />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "touch" });
      expect(run(captured, 1).get("uPointerForce")).toBe(0);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const first = (run(captured, 1).get("uPointer") as number[])[0];
      expect(first).toBeGreaterThan(0.5);
      expect(first).toBeLessThan(1);
      let last = first;
      for (let i = 0; i < 80; i++) last = (run(captured, 1).get("uPointer") as number[])[0];
      expect(last).toBe(1);
      expect(run(captured, 1).get("uPointerForce")).toBe(1);
      fireEvent.pointerMove(root, { clientX: 0, clientY: 50, pointerType: "pen" });
      for (let i = 0; i < 80; i++) last = (run(captured, 1).get("uPointer") as number[])[0];
      expect(last).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("fades out on leave", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<RadarSweep />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 100, clientY: 50, pointerType: "mouse" });
      for (let i = 0; i < 80; i++) run(captured, 1);
      fireEvent.pointerLeave(root);
      let force = 1;
      for (let i = 0; i < 80; i++) force = run(captured, 1).get("uPointerForce") as number;
      expect(force).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("ignores the mouse with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<RadarSweep pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      expect(run(captured, 1).get("uPointerForce")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("freezes the pointer and marks the static frame under reduced motion", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <RadarSweep />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const values = run(captured, 2);
      expect(values.get("uPointerForce")).toBe(0);
      expect(values.get("uStatic")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("RadarSweep (tema local)", () => {
  it("passes a component element for the color, including the fallback", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <RadarSweep />
        </div>
      );
      const root = container.querySelector('[data-slot="radar-sweep"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
      for (const [, element] of spy.mock.calls) expect(root.contains(element ?? null)).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
  it("redraws after rereading the color when the theme changes", async () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const originalHook = webgl.useWebglCanvas;
    const hookSpy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => ({
      ...originalHook(options),
      redraw,
    }));
    try {
      const view = render(<RadarSweep speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
      expect(readSpy).toHaveBeenCalledWith("--success", expect.any(HTMLElement));
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
