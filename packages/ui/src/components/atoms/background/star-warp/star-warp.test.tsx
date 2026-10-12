import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { StarWarp } from "./star-warp";
import { STAR_WARP_FRAGMENT_SHADER } from "./star-warp-shader";

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

describe("StarWarp shader", () => {
  it("is GLSL ES 3.00 with the expected uniforms and premultiplied output", () => {
    expect(STAR_WARP_FRAGMENT_SHADER.startsWith("#version 300 es")).toBe(true);
    for (const name of [
      "uTime",
      "uResolution",
      "uColors[4]",
      "uColorCount",
      "uDensity",
      "uLayers",
      "uStarSize",
      "uFlare",
      "uTwinkle",
      "uTravel",
      "uRotation",
      "uSpeed",
      "uPointer",
      "uPointerAmount",
      "uClick",
      "uReveal",
    ]) {
      expect(STAR_WARP_FRAGMENT_SHADER).toContain(name);
    }
    expect(STAR_WARP_FRAGMENT_SHADER).toContain("out vec4 fragColor");
    expect(STAR_WARP_FRAGMENT_SHADER).toContain("fragColor = vec4(color, alpha)");
  });
});

describe("StarWarp (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <StarWarp>
        <p>Conteúdo</p>
      </StarWarp>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "star-warp");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="star-warp-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="star-warp-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style") ?? "").toContain("var(--foreground)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "star-warp-content"
    );
  });
  it("uses the first token in the fallback", () => {
    const { container } = render(<StarWarp colors={["--success", "--info"]} />);
    const fallback = container.querySelector('[data-slot="star-warp-fallback"]');
    expect(fallback?.getAttribute("style")).toContain("var(--success)");
  });
  it("throws for an invalid token, an empty list and too many tokens", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<StarWarp colors={["primary"]} />)).toThrow(/"primary"/);
      expect(() => render(<StarWarp colors={[]} />)).toThrow(/1 to 4/);
      expect(() => render(<StarWarp colors={["--a", "--b", "--c", "--d", "--e"]} />)).toThrow(
        /5.*1 to 4/
      );
    } finally {
      spy.mockRestore();
    }
  });
  it("throws for invalid layers with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<StarWarp layers={9} />)).toThrow(/9/);
      expect(() => render(<StarWarp layers={2.5} />)).toThrow(/2\.5/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<StarWarp ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <StarWarp onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onClick={onClick} />
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

describe("StarWarp uniforms", () => {
  it("passes the defaults", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<StarWarp />);
      const values = run(captured, 1);
      expect(values.get("uDensity")).toBe(1);
      expect(values.get("uLayers")).toBe(4);
      expect(values.get("uStarSize")).toBe(1);
      expect(values.get("uFlare")).toBe(1);
      expect(values.get("uTwinkle")).toBe(0.3);
      expect(values.get("uTravel")).toBe(0.5);
      expect(values.get("uRotation")).toBe(0.1);
      expect(values.get("uSpeed")).toBe(1);
      expect(values.get("uColorCount")).toBe(3);
      expect(values.get("uPointerAmount")).toBe(0);
      expect(values.get("uClick")).toBe(-1);
      expect(values.get("uReveal")).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("clamps the numeric props and reports the token count", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(
        <StarWarp
          density={9}
          starSize={0}
          flare={9}
          twinkle={-1}
          travel={-9}
          layers={8}
          colors={["--primary"]}
        />
      );
      const values = run(captured, 1);
      expect(values.get("uDensity")).toBe(3);
      expect(values.get("uStarSize")).toBe(0.3);
      expect(values.get("uFlare")).toBe(2);
      expect(values.get("uTwinkle")).toBe(0);
      expect(values.get("uTravel")).toBe(-2);
      expect(values.get("uLayers")).toBe(8);
      expect(values.get("uColorCount")).toBe(1);
      expect((values.get("uColors") as number[]).length).toBe(12);
    } finally {
      spy.mockRestore();
    }
  });
  it("pauses the renderer with speed 0", () => {
    const { captured, spy } = spyOnHook();
    try {
      render(<StarWarp speed={0} />);
      expect(captured.options?.paused).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("StarWarp clique e ponteiro", () => {
  it("starts a warp jump at the current shader time on click", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<StarWarp />);
      const root = container.firstElementChild as HTMLElement;
      run(captured, 3);
      fireEvent.click(root);
      expect(run(captured, 3.5).get("uClick")).toBe(3);
    } finally {
      spy.mockRestore();
    }
  });
  it("ignores clicks with pointer={false}", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<StarWarp pointer={false} />);
      const root = container.firstElementChild as HTMLElement;
      run(captured, 3);
      fireEvent.click(root);
      expect(run(captured, 3.5).get("uClick")).toBe(-1);
    } finally {
      spy.mockRestore();
    }
  });
  it("repels smoothly from the mouse and ignores touch", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<StarWarp />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "touch" });
      expect(run(captured, 1).get("uPointerAmount")).toBe(0);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const first = run(captured, 1);
      expect(first.get("uPointerAmount")).toBeGreaterThan(0);
      expect(first.get("uPointerAmount")).toBeLessThan(1);
      let last = first;
      for (let i = 0; i < 80; i++) last = run(captured, 1);
      expect(last.get("uPointerAmount")).toBe(1);
      expect(last.get("uPointer")).toEqual([1, 0.5]);
    } finally {
      spy.mockRestore();
    }
  });
  it("fades the repulsion out when the pointer leaves", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(<StarWarp />);
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.pointerMove(root, { clientX: 100, clientY: 50, pointerType: "mouse" });
      for (let i = 0; i < 80; i++) run(captured, 1);
      fireEvent.pointerLeave(root);
      let amount = 1;
      for (let i = 0; i < 80; i++) amount = run(captured, 1).get("uPointerAmount") as number;
      expect(amount).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });
  it("disables jump and repulsion and skips the entry under reduced motion", () => {
    const { captured, spy } = spyOnHook();
    try {
      const { container } = render(
        <MotionConfig reducedMotion="always">
          <StarWarp />
        </MotionConfig>
      );
      const root = container.firstElementChild as HTMLElement;
      sizeBox(root);
      fireEvent.click(root);
      fireEvent.pointerMove(root, { clientX: 200, clientY: 50, pointerType: "mouse" });
      const values = run(captured, 2);
      expect(values.get("uClick")).toBe(-1);
      expect(values.get("uPointerAmount")).toBe(0);
      expect(values.get("uReveal")).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("StarWarp (tema local)", () => {
  it("passes a component element for every color, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <StarWarp />
        </div>
      );
      const root = container.querySelector('[data-slot="star-warp"]') as HTMLElement;
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
      const view = render(<StarWarp speed={0} />);
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
