import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { LightningBolts } from "./lightning-bolts";
import { LIGHTNING_BOLTS_FRAGMENT_SHADER } from "./lightning-bolts-shader";

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
    canvas: { width: 1000, height: 500, clientWidth: 500 },
    getUniformLocation: (_p: unknown, name: string) => name,
    uniform1f: (loc: string, v: number) => values.set(loc, v),
    uniform1i: (loc: string, v: number) => values.set(loc, v),
    uniform3f: (loc: string, ...v: number[]) => values.set(loc, v),
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

describe("LightningBolts shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(LIGHTNING_BOLTS_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColor",
      "uScale",
      "uBolts",
      "uSpread",
      "uBranches",
      "uAngle",
      "uThickness",
      "uGlow",
      "uFlicker",
      "uSpeed",
      "uPointer",
      "uStrike",
      "uStatic",
    ]) {
      expect(LIGHTNING_BOLTS_FRAGMENT_SHADER).toContain(name);
    }
    expect(LIGHTNING_BOLTS_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(LIGHTNING_BOLTS_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("LightningBolts (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <LightningBolts>
        <p>Conteúdo</p>
      </LightningBolts>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "lightning-bolts");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="lightning-bolts-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="lightning-bolts-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--info)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "lightning-bolts-content"
    );
  });
  it("uses the given token in the fallback", () => {
    const { container } = render(<LightningBolts color="--success" />);
    const fallback = container.querySelector('[data-slot="lightning-bolts-fallback"]');
    expect(fallback?.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<LightningBolts color="info" />)).toThrow(/"info"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("throws for an invalid bolts count with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<LightningBolts bolts={5} />)).toThrow(/5/);
      expect(() => render(<LightningBolts bolts={1.5} />)).toThrow(/1\.5/);
      expect(() => render(<LightningBolts bolts={0} />)).toThrow(/0/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<LightningBolts ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <LightningBolts
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

describe("LightningBolts uniforms", () => {
  it("passes the clamped props and defaults, scaled to device pixels", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(
        <LightningBolts bolts={3} spread={4} branches={-1} thickness={0} glow={9} flicker={7} />
      );
      const values = run(captured, 1);
      expect(values.get("uBolts")).toBe(3);
      expect(values.get("uSpread")).toBe(1);
      expect(values.get("uBranches")).toBe(0);
      expect(values.get("uThickness")).toBe(0.3);
      expect(values.get("uGlow")).toBe(2);
      expect(values.get("uFlicker")).toBe(1);
      expect(values.get("uAngle")).toBe(0);
      expect(values.get("uSpeed")).toBe(1);
      expect(values.get("uScale")).toBe(2);
      expect(values.get("uStatic")).toBe(0);
      expect(values.get("uPointer")).toEqual([500, 250, 0]);
      expect((values.get("uStrike") as number[])[2]).toBe(-1);
      expect(values.get("uColor")).toHaveLength(3);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses the renderer with speed 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<LightningBolts speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("LightningBolts clique e ponteiro", () => {
  it("strikes at the clicked point at the current shader time", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightningBolts />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      run(captured, 3);
      fireEvent.click(root, { clientX: 100, clientY: 25 });
      expect(run(captured, 3.5).get("uStrike")).toEqual([500, 375, 3]);
    } finally {
      spy.mockRestore();
    }
  });
  it("ignores clicks with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightningBolts pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      run(captured, 3);
      fireEvent.click(root, { clientX: 100, clientY: 25 });
      expect((run(captured, 3.5).get("uStrike") as number[])[2]).toBe(-1);
    } finally {
      spy.mockRestore();
    }
  });
  it("pulls toward the mouse smoothly and ignores touch", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightningBolts />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "touch" });
      expect(run(captured, 1).get("uPointer")).toEqual([500, 250, 0]);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const first = run(captured, 1).get("uPointer") as number[];
      expect(first[0]).toBeGreaterThan(500);
      expect(first[0]).toBeLessThan(1000);
      expect(first[2]).toBeGreaterThan(0);
      let last = first;
      for (let i = 0; i < 80; i++) last = run(captured, 1).get("uPointer") as number[];
      expect(last).toEqual([1000, 250, 1]);
    } finally {
      spy.mockRestore();
    }
  });
  it("releases the pull when the pointer leaves", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<LightningBolts />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      for (let i = 0; i < 80; i++) run(captured, 1);
      fireEvent.pointerLeave(root);
      let strength = 1;
      for (let i = 0; i < 80; i++) strength = (run(captured, 1).get("uPointer") as number[])[2];
      expect(strength).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("shows a static frame and disables pointer and strike under reduced motion", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <LightningBolts />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.click(root, { clientX: 100, clientY: 25 });
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const values = run(captured, 2);
      expect((values.get("uStrike") as number[])[2]).toBe(-1);
      expect(values.get("uPointer")).toEqual([500, 250, 0]);
      expect(values.get("uStatic")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("LightningBolts (tema local)", () => {
  it("passes a component element for the color and its fallback", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <LightningBolts />
        </div>
      );
      const root = container.querySelector('[data-slot="lightning-bolts"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--info", expect.any(HTMLElement));
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
      const view = render(<LightningBolts speed={0} />);
      readSpy.mockClear();
      redraw.mockClear();
      await act(async () => {
        document.documentElement.setAttribute("data-theme", "test-theme");
      });
      expect(readSpy).toHaveBeenCalledWith("--info", expect.any(HTMLElement));
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
