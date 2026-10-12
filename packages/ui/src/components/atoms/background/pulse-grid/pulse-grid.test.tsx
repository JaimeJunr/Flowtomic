import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { PulseGrid } from "./pulse-grid";
import { PULSE_GRID_FRAGMENT_SHADER } from "./pulse-grid-shader";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

type Options = Parameters<typeof webgl.useWebglCanvas>[0];

// Captura as opções do hook e executa o callback de uniforms contra um gl falso.
function spyOnHook() {
  const captured: { options: Options | null } = { options: null };
  const original = webgl.useWebglCanvas;
  const spy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => {
    captured.options = options;
    return original(options);
  });
  return { captured, spy };
}

function fakeGl() {
  const values = new Map<string, unknown>();
  const record = (_loc: unknown, ...args: unknown[]) => args;
  const gl = {
    canvas: { width: 1000, height: 500, clientWidth: 0 },
    getUniformLocation: (_p: unknown, name: string) => name,
    uniform1f: (loc: string, v: number) => values.set(loc, v),
    uniform1i: (loc: string, v: number) => values.set(loc, v),
    uniform3f: (loc: string, ...v: number[]) => values.set(loc, v),
    uniform3fv: (loc: string, v: Float32Array) => values.set(loc, Array.from(v)),
    uniform1fv: (loc: string, v: Float32Array) => values.set(loc, Array.from(v)),
    record,
  };
  return { gl: gl as unknown as WebGL2RenderingContext, values };
}

function run(captured: { options: Options | null }, time: number) {
  const { gl, values } = fakeGl();
  captured.options?.uniforms?.(gl, {} as WebGLProgram, time);
  return values;
}

describe("PulseGrid shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and output", () => {
    expect(PULSE_GRID_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uScale",
      "uCellSize",
      "uLineWidth",
      "uVariant",
      "uGlow",
      "uRippleStrength",
      "uRippleSpeed",
      "uFade",
      "uRipples[8]",
      "uStrengths[8]",
      "uRippleCount",
      "uPointer",
      "uReveal",
    ]) {
      expect(PULSE_GRID_FRAGMENT_SHADER).toContain(name);
    }
    expect(PULSE_GRID_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(PULSE_GRID_FRAGMENT_SHADER).toContain("fragColor = vec4(uColor * alpha, alpha)");
  });
});

describe("PulseGrid (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <PulseGrid>
        <p>Conteúdo</p>
      </PulseGrid>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "pulse-grid");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="pulse-grid-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="pulse-grid-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--foreground)");
    expect(fallback.getAttribute("style") ?? "").toContain("48px 48px");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "pulse-grid-content"
    );
  });
  it("uses the color token and cell size in the fallback", () => {
    const { container } = render(<PulseGrid color="--primary" cellSize={24} />);
    const style =
      container.querySelector('[data-slot="pulse-grid-fallback"]')?.getAttribute("style") ?? "";
    expect(style).toContain("var(--primary)");
    expect(style).toContain("24px 24px");
  });
  it("throws for an invalid token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<PulseGrid color="primary" />)).toThrow(/"primary"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<PulseGrid ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <PulseGrid onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onClick={onClick} />
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 10 });
    fireEvent.pointerLeave(root);
    fireEvent.click(root);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("PulseGrid (tema local)", () => {
  it("rereads colors from a component element", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <PulseGrid color="--primary" />
        </div>
      );
      const root = container.querySelector('[data-slot="pulse-grid"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
      for (const [, element] of spy.mock.calls) expect(root.contains(element ?? null)).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("PulseGrid ondas", () => {
  it("starts the first automatic ripple at time 0 from the center", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<PulseGrid />);
      const values = run(captured, 0);
      expect(values.get("uRippleCount")).toBe(1);
      expect((values.get("uRipples") as number[]).slice(0, 3)).toEqual([500, 250, 0]);
      expect((values.get("uStrengths") as number[])[0]).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
  it("schedules the next automatic ripple after rippleInterval", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<PulseGrid rippleInterval={2} />);
      run(captured, 0);
      expect(run(captured, 1).get("uRippleCount")).toBe(1);
      expect(run(captured, 2.1).get("uRippleCount")).toBe(2);
    } finally {
      spy.mockRestore();
    }
  });
  it("does not schedule automatic ripples with rippleInterval 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<PulseGrid rippleInterval={0} />);
      expect(run(captured, 0).get("uRippleCount")).toBe(0);
      expect(run(captured, 50).get("uRippleCount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("creates a strong ripple on click at the pointer, in device pixels", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<PulseGrid rippleInterval={0} />);
      const root = container.firstElementChild as HTMLElement;
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
      run(captured, 3);
      fireEvent.click(root, { clientX: 100, clientY: 25 });
      const values = run(captured, 3.5);
      expect(values.get("uRippleCount")).toBe(1);
      expect((values.get("uRipples") as number[]).slice(0, 3)).toEqual([500, 375, 3]);
      expect((values.get("uStrengths") as number[])[0]).toBe(2);
    } finally {
      spy.mockRestore();
    }
  });
  it("leaves a weak trail ripple at most once every 120 ms", () => {
    const { captured, spy } = spyOnHook();
    const now = vi.spyOn(performance, "now");
    try {
      const { container } = render(<PulseGrid rippleInterval={0} />);
      const root = container.firstElementChild as HTMLElement;
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
      now.mockReturnValue(1000);
      fireEvent.pointerMove(root, { clientX: 20, clientY: 20, pointerType: "mouse" });
      now.mockReturnValue(1050);
      fireEvent.pointerMove(root, { clientX: 30, clientY: 20, pointerType: "mouse" });
      let values = run(captured, 1);
      expect(values.get("uRippleCount")).toBe(1);
      expect((values.get("uStrengths") as number[])[0]).toBeCloseTo(0.35);
      now.mockReturnValue(1200);
      fireEvent.pointerMove(root, { clientX: 40, clientY: 20, pointerType: "mouse" });
      values = run(captured, 1.2);
      expect(values.get("uRippleCount")).toBe(2);
    } finally {
      now.mockRestore();
      spy.mockRestore();
    }
  });
  it("ignores clicks with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<PulseGrid rippleInterval={0} pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
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
      fireEvent.click(root, { clientX: 100, clientY: 25 });
      fireEvent.pointerMove(root, { clientX: 100, clientY: 25, pointerType: "mouse" });
      expect(run(captured, 1).get("uRippleCount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("drops ripples with no weight left after their lifetime", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<PulseGrid rippleInterval={0} />);
      expect(run(captured, 0).get("uRippleCount")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("sends no ripples under reduced motion and reveals the grid", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(
        <MotionConfig reducedMotion="always">
          <PulseGrid />
        </MotionConfig>
      );
      const values = run(captured, 0);
      expect(values.get("uRippleCount")).toBe(0);
      expect(values.get("uReveal")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
  it("clamps and forwards the visual props", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(
        <PulseGrid cellSize={1000} lineWidth={0} glow={5} rippleStrength={9} variant="dots" />
      );
      const values = run(captured, 0);
      expect(values.get("uCellSize")).toBe(200 * 1);
      expect(values.get("uLineWidth")).toBe(0.5);
      expect(values.get("uGlow")).toBe(1);
      expect(values.get("uRippleStrength")).toBe(2);
      expect(values.get("uVariant")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});
