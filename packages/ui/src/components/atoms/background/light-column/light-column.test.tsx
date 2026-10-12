import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { LightColumn } from "./light-column";
import { LIGHT_COLUMN_FRAGMENT_SHADER } from "./light-column-shader";

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

describe("LightColumn shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(LIGHT_COLUMN_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[2]",
      "uIntensity",
      "uWidth",
      "uTilt",
      "uTwist",
      "uDetail",
      "uSpeed",
      "uGrain",
      "uPointer",
      "uPulse",
      "uReveal",
    ]) {
      expect(LIGHT_COLUMN_FRAGMENT_SHADER).toContain(name);
    }
    expect(LIGHT_COLUMN_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(LIGHT_COLUMN_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("LightColumn (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <LightColumn>
        <p>Conteúdo</p>
      </LightColumn>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "light-column");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="light-column-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="light-column-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--primary)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "light-column-content"
    );
  });
  it("uses the first token in the fallback", () => {
    const { container } = render(<LightColumn colors={["--success", "--info"]} />);
    const fallback = container.querySelector('[data-slot="light-column-fallback"]');
    expect(fallback?.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid token or the wrong token count", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<LightColumn colors={["primary", "--info"]} />)).toThrow(/"primary"/);
      expect(() =>
        render(<LightColumn colors={["--a", "--b", "--c"] as unknown as [string, string]} />)
      ).toThrow(/2 tokens/);
    } finally {
      spy.mockRestore();
    }
  });
  it("throws for an invalid detail with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<LightColumn detail={7} />)).toThrow(/7/);
      expect(() => render(<LightColumn detail={2.5} />)).toThrow(/2\.5/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<LightColumn ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <LightColumn
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      />
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

describe("LightColumn uniforms", () => {
  it("passes the clamped props and defaults", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<LightColumn intensity={9} width={0} twist={5} grain={-2} detail={3} tilt={10} />);
      const values = run(captured, 1);
      expect(values.get("uIntensity")).toBe(2);
      expect(values.get("uWidth")).toBe(0.1);
      expect(values.get("uTwist")).toBe(2);
      expect(values.get("uGrain")).toBe(0);
      expect(values.get("uDetail")).toBe(3);
      expect(values.get("uTilt")).toBe(10);
      expect(values.get("uSpeed")).toBe(1);
      expect(values.get("uPointer")).toEqual([0.5, 0.5]);
      expect(values.get("uPulse")).toBe(-1);
      expect(values.get("uReveal")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses the renderer with speed 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<LightColumn speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("LightColumn pulso e ponteiro", () => {
  it("starts a pulse at the current shader time on click", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightColumn />);
      const root = container.firstElementChild as HTMLElement;
      run(captured, 3);
      fireEvent.click(root);
      expect(run(captured, 3.5).get("uPulse")).toBe(3);
    } finally {
      spy.mockRestore();
    }
  });
  it("ignores clicks with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightColumn pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      run(captured, 3);
      fireEvent.click(root);
      expect(run(captured, 3.5).get("uPulse")).toBe(-1);
    } finally {
      spy.mockRestore();
    }
  });
  it("follows the mouse smoothly and ignores touch", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightColumn />);
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
  it("returns the tilt to the center when the pointer leaves", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightColumn />);
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
  it("disables pulse and pointer and reveals the column under reduced motion", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <LightColumn />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.click(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const values = run(captured, 2);
      expect(values.get("uPulse")).toBe(-1);
      expect(values.get("uPointer")).toEqual([0.5, 0.5]);
      expect(values.get("uReveal")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("LightColumn (tema local)", () => {
  it("passes a component element for every color, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <LightColumn />
        </div>
      );
      const root = container.querySelector('[data-slot="light-column"]') as HTMLElement;
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
      const view = render(<LightColumn speed={0} />);
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
