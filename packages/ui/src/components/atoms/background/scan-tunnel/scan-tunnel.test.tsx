import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { ScanTunnel } from "./scan-tunnel";
import { SCAN_TUNNEL_FRAGMENT_SHADER } from "./scan-tunnel-shader";

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

describe("ScanTunnel shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(SCAN_TUNNEL_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uLineColor",
      "uScanColor",
      "uGridScale",
      "uLineWidth",
      "uScanOpacity",
      "uScanDuration",
      "uScanDelay",
      "uSpeed",
      "uPointer",
      "uStatic",
      "fwidth",
    ]) {
      expect(SCAN_TUNNEL_FRAGMENT_SHADER).toContain(name);
    }
    expect(SCAN_TUNNEL_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(SCAN_TUNNEL_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("ScanTunnel (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <ScanTunnel>
        <p>Conteúdo</p>
      </ScanTunnel>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "scan-tunnel");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="scan-tunnel-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="scan-tunnel-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--primary)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "scan-tunnel-content"
    );
  });
  it("uses the scan token in the fallback", () => {
    const { container } = render(<ScanTunnel scanColor="--success" />);
    const fallback = container.querySelector('[data-slot="scan-tunnel-fallback"]');
    expect(fallback?.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for invalid tokens with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<ScanTunnel lineColor="muted" />)).toThrow(/"muted"/);
      expect(() => render(<ScanTunnel scanColor="primary" />)).toThrow(/"primary"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ScanTunnel ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const { container } = render(
      <ScanTunnel onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} />
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 10 });
    fireEvent.pointerLeave(root);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
  });
});

describe("ScanTunnel uniforms", () => {
  it("passes the clamped props and defaults", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<ScanTunnel gridScale={9} lineWidth={0} scanOpacity={4} scanDuration={0} />);
      const values = run(captured, 1);
      expect(values.get("uGridScale")).toBe(0.5);
      expect(values.get("uLineWidth")).toBe(0.5);
      expect(values.get("uScanOpacity")).toBe(1);
      expect(values.get("uScanDuration")).toBe(0.5);
      expect(values.get("uScanDelay")).toBe(2);
      expect(values.get("uSpeed")).toBe(1);
      expect(values.get("uPointer")).toEqual([0.5, 0.5]);
      expect(values.get("uStatic")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses the renderer with speed 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<ScanTunnel speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("ScanTunnel ponteiro", () => {
  it("follows the mouse smoothly and ignores touch", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<ScanTunnel />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "touch" });
      expect(run(captured, 1).get("uPointer")).toEqual([0.5, 0.5]);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const first = (run(captured, 1).get("uPointer") as number[])[0];
      expect(first).toBeGreaterThan(0.5);
      expect(first).toBeLessThan(1);
      let last = first;
      for (let i = 0; i < 80; i++) last = (run(captured, 1).get("uPointer") as number[])[0];
      expect(last).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
  it("returns to the center on leave and with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<ScanTunnel />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      fireEvent.pointerLeave(root);
      let x = 1;
      for (let i = 0; i < 80; i++) x = (run(captured, 1).get("uPointer") as number[])[0];
      expect(x).toBe(0.5);
    } finally {
      spy.mockRestore();
    }
  });
  it("ignores the mouse with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<ScanTunnel pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      expect(run(captured, 1).get("uPointer")).toEqual([0.5, 0.5]);
    } finally {
      spy.mockRestore();
    }
  });
  it("freezes the pointer and hides the scan band under reduced motion", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <ScanTunnel />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const values = run(captured, 2);
      expect(values.get("uPointer")).toEqual([0.5, 0.5]);
      expect(values.get("uStatic")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("ScanTunnel (tema local)", () => {
  it("passes a component element for every color, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <ScanTunnel />
        </div>
      );
      const root = container.querySelector('[data-slot="scan-tunnel"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--muted-foreground", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
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
      const view = render(<ScanTunnel speed={0} />);
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
