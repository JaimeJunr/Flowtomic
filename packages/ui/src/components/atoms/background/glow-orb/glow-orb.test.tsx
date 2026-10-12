import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { GlowOrb } from "./glow-orb";
import { GLOW_ORB_FRAGMENT_SHADER } from "./glow-orb-shader";

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

describe("GlowOrb shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(GLOW_ORB_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[3]",
      "uSize",
      "uGlow",
      "uWobble",
      "uHighlight",
      "uTrail",
      "uSpeed",
      "uPointer",
      "uPointerForce",
      "uPulse",
      "uCalm",
    ]) {
      expect(GLOW_ORB_FRAGMENT_SHADER).toContain(name);
    }
    expect(GLOW_ORB_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(GLOW_ORB_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("GlowOrb (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <GlowOrb>
        <p>Conteúdo</p>
      </GlowOrb>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "glow-orb");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="glow-orb-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="glow-orb-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--primary)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "glow-orb-content"
    );
  });
  it("uses the first token in the fallback", () => {
    const { container } = render(<GlowOrb colors={["--success", "--info", "--warning"]} />);
    const fallback = container.querySelector('[data-slot="glow-orb-fallback"]');
    expect(fallback?.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid token or the wrong token count", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<GlowOrb colors={["primary", "--info", "--primary"]} />)).toThrow(
        /"primary"/
      );
      expect(() =>
        render(<GlowOrb colors={["--a", "--b"] as unknown as [string, string, string]} />)
      ).toThrow(/3 tokens/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<GlowOrb ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <GlowOrb onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onClick={onClick} />
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

describe("GlowOrb uniforms", () => {
  it("passes the clamped props", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<GlowOrb size={9} glow={-1} wobble={5} highlight={7} trail={-2} speed={2} />);
      const values = run(captured, 1);
      expect(values.get("uSize")).toBe(1.5);
      expect(values.get("uGlow")).toBe(0);
      expect(values.get("uWobble")).toBe(2);
      expect(values.get("uHighlight")).toBe(2);
      expect(values.get("uTrail")).toBe(0);
      expect(values.get("uSpeed")).toBe(2);
    } finally {
      spy.mockRestore();
    }
  });
  it("uses the defaults and sends nine color floats", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<GlowOrb />);
      const values = run(captured, 1);
      expect(values.get("uSize")).toBe(1);
      expect(values.get("uGlow")).toBe(1);
      expect(values.get("uWobble")).toBe(1);
      expect(values.get("uHighlight")).toBe(1);
      expect(values.get("uTrail")).toBe(1);
      expect(values.get("uPointer")).toEqual([0.5, 0.5]);
      expect(values.get("uPointerForce")).toBe(0);
      expect(values.get("uPulse")).toBe(-1);
      expect(values.get("uCalm")).toBe(0);
      expect((values.get("uColors") as number[]).length).toBe(9);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses the renderer with speed 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<GlowOrb speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("GlowOrb pulso e ponteiro", () => {
  it("starts a pulse at the current shader time on click", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<GlowOrb />);
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
      const { container } = render(<GlowOrb pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      run(captured, 3);
      fireEvent.click(root);
      expect(run(captured, 3.5).get("uPulse")).toBe(-1);
    } finally {
      spy.mockRestore();
    }
  });
  it("follows the mouse smoothly, raises the force and ignores touch", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<GlowOrb />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "touch" });
      expect(run(captured, 1).get("uPointerForce")).toBe(0);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const first = run(captured, 1);
      const x = (first.get("uPointer") as number[])[0];
      expect(x).toBeGreaterThan(0.5);
      expect(x).toBeLessThan(1);
      expect(first.get("uPointerForce") as number).toBeGreaterThan(0);
      expect(first.get("uPointerForce") as number).toBeLessThan(1);
      let last = first;
      for (let i = 0; i < 120; i++) last = run(captured, 1);
      expect((last.get("uPointer") as number[])[0]).toBe(1);
      expect(last.get("uPointerForce")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
  it("releases the force when the pointer leaves", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<GlowOrb />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      for (let i = 0; i < 120; i++) run(captured, 1);
      fireEvent.pointerLeave(root);
      let values = run(captured, 1);
      for (let i = 0; i < 120; i++) values = run(captured, 1);
      expect(values.get("uPointerForce")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("disables pulse and pointer and calms the orb under reduced motion", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <GlowOrb />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.click(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const values = run(captured, 2);
      expect(values.get("uPulse")).toBe(-1);
      expect(values.get("uPointerForce")).toBe(0);
      expect(values.get("uCalm")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("GlowOrb (tema local)", () => {
  it("passes a component element for every color, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <GlowOrb />
        </div>
      );
      const root = container.querySelector('[data-slot="glow-orb"]') as HTMLElement;
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
      const view = render(<GlowOrb speed={0} />);
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
