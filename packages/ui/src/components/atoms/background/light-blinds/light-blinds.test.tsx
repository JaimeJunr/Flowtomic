import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as themeColor from "@/lib/read-theme-color";
import * as webgl from "@/lib/webgl";
import { LightBlinds } from "./light-blinds";

describe("LightBlinds (sem WebGL)", () => {
  it("shows the css fallback, hidden canvas and children", () => {
    const { container } = render(
      <LightBlinds>
        <p>Conteúdo</p>
      </LightBlinds>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "light-blinds");
    expect(root).toHaveAttribute("data-webgl", "off");
    const canvas = root.querySelector('[data-slot="light-blinds-canvas"]');
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    const fallback = root.querySelector('[data-slot="light-blinds-fallback"]') as HTMLElement;
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback.getAttribute("style")).toContain("var(--primary)");
    expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute(
      "data-slot",
      "light-blinds-content"
    );
  });
  it("uses the first color token in the fallback", () => {
    const { container } = render(<LightBlinds colors={["--success", "--info"]} />);
    const fallback = container.querySelector('[data-slot="light-blinds-fallback"]') as HTMLElement;
    expect(fallback.getAttribute("style")).toContain("var(--success)");
  });
  it("accepts a single token", () => {
    expect(() => render(<LightBlinds colors={["--primary"]} />)).not.toThrow();
  });
  it("throws for an invalid token with the received value", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<LightBlinds colors={["primary", "--info"]} />)).toThrow(/"primary"/);
    } finally {
      spy.mockRestore();
    }
  });
  it("throws for an empty list and for more than 8 tokens", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<LightBlinds colors={[]} />)).toThrow(/0 color tokens/);
      expect(() =>
        render(<LightBlinds colors={Array.from({ length: 9 }, () => "--info")} />)
      ).toThrow(/9 color tokens/);
    } finally {
      spy.mockRestore();
    }
  });
  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<LightBlinds ref={ref} className="min-h-40" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass("relative", "isolate", "overflow-hidden", "min-h-40");
  });
  it("keeps the consumer pointer handlers", () => {
    const onPointerMove = vi.fn();
    const onPointerLeave = vi.fn();
    const { container } = render(
      <LightBlinds onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} />
    );
    const root = container.firstElementChild as HTMLElement;
    fireEvent.pointerMove(root, { clientX: 10 });
    fireEvent.pointerLeave(root);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerLeave).toHaveBeenCalledTimes(1);
  });
});

describe("LightBlinds (tema local)", () => {
  it("reads every color from a component element, including fallbacks", () => {
    const spy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    try {
      const { container } = render(
        <div className="dark">
          <LightBlinds colors={["--primary", "--info"]} />
        </div>
      );
      const root = container.querySelector('[data-slot="light-blinds"]') as HTMLElement;
      expect(spy).toHaveBeenCalledWith("--primary", expect.any(HTMLElement));
      expect(spy).toHaveBeenCalledWith("--foreground", expect.any(HTMLElement));
      for (const [, element] of spy.mock.calls) {
        expect(root.contains(element ?? null)).toBe(true);
      }
    } finally {
      spy.mockRestore();
    }
  });
});

describe("LightBlinds (redraw)", () => {
  it("redraws after rereading colors on a token change while frozen", async () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const originalHook = webgl.useWebglCanvas;
    const hookSpy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => ({
      ...originalHook(options),
      redraw,
    }));
    try {
      const view = render(<LightBlinds speed={0} colors={["--primary", "--info"]} />);
      readSpy.mockClear();
      redraw.mockClear();
      view.rerender(<LightBlinds speed={0} colors={["--success", "--info"]} />);
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
  it("redraws after rereading colors on a html change while frozen", async () => {
    const readSpy = vi.spyOn(themeColor, "readThemeColor").mockReturnValue(null);
    const redraw = vi.fn();
    const originalHook = webgl.useWebglCanvas;
    const hookSpy = vi.spyOn(webgl, "useWebglCanvas").mockImplementation((options) => ({
      ...originalHook(options),
      redraw,
    }));
    try {
      const view = render(<LightBlinds speed={0} />);
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
